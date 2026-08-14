"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { destroySession, isAdmin } from "./admin-auth";
import { serverClient } from "./supabase";
import { findSlot } from "./slots";
import { expandWeekly } from "./recurring";
import { belgradeDateStr, belgradeSlotToInstant, formatBelgrade, slotEnd } from "./time";
import { SLOT_START_TIMES } from "./config";

/**
 * Server Actions are public endpoints — every one of them re-checks the session
 * rather than trusting that the page it was rendered on was guarded.
 */
async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Niste prijavljeni.");
}

export type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
  conflicts?: string[];
  created?: number;
  skipped?: number;
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
export async function logoutAction() {
  await destroySession();
  redirect("/admin/prijava");
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  await assertAdmin();

  // Soft-cancel, never delete: the row stays as history, and because the unique
  // index is partial on status='confirmed' the slot becomes bookable again the
  // instant this lands.
  const { error } = await serverClient()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("status", "confirmed");

  if (error) {
    console.error("[admin] cancel failed", error);
    return { ok: false, error: "Otkazivanje nije uspelo." };
  }

  revalidatePath("/admin");
  revalidatePath("/rezervacija");
  return { ok: true, message: "Rezervacija je otkazana." };
}

// ---------------------------------------------------------------------------
// One-off block
// ---------------------------------------------------------------------------
const BlockInput = z.object({
  courtId: z.string().uuid(),
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string(),
  reason: z.string().trim().min(2).max(120),
});

export async function blockSlotAction(input: {
  courtId: string;
  dateStr: string;
  time: string;
  reason: string;
}): Promise<ActionResult> {
  await assertAdmin();

  const parsed = BlockInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Neispravni podaci." };

  const { courtId, dateStr, time, reason } = parsed.data;
  const slot = findSlot(belgradeSlotToInstant(dateStr, time), dateStr);
  if (!slot) return { ok: false, error: "Taj termin ne postoji u rasporedu." };

  const db = serverClient();

  const { data: clash } = await db
    .from("bookings")
    .select("customer_name")
    .eq("court_id", courtId)
    .eq("starts_at", slot.startsAt.toISOString())
    .eq("status", "confirmed")
    .maybeSingle();

  if (clash) {
    return {
      ok: false,
      error: `Termin je već rezervisan (${clash.customer_name}). Prvo otkažite rezervaciju.`,
    };
  }

  const { error } = await db.from("blocked_slots").insert({
    court_id: courtId,
    starts_at: slot.startsAt.toISOString(),
    ends_at: slot.endsAt.toISOString(),
    reason,
    recurrence_id: null,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Taj termin je već blokiran." };
    console.error("[admin] block failed", error);
    return { ok: false, error: "Blokiranje nije uspelo." };
  }

  revalidatePath("/admin");
  revalidatePath("/rezervacija");
  return { ok: true, message: "Termin je blokiran." };
}

export async function unblockSlotAction(blockId: string): Promise<ActionResult> {
  await assertAdmin();
  const { error } = await serverClient().from("blocked_slots").delete().eq("id", blockId);
  if (error) return { ok: false, error: "Brisanje nije uspelo." };

  revalidatePath("/admin");
  revalidatePath("/admin/stalni-termini");
  revalidatePath("/rezervacija");
  return { ok: true, message: "Termin je oslobođen." };
}

// ---------------------------------------------------------------------------
// Recurring series — stalni termini
// ---------------------------------------------------------------------------
const RecurringInput = z.object({
  courtId: z.string().uuid("Izaberite teren."),
  weekday: z.coerce.number().int().min(0).max(6),
  time: z.string().refine((t) => (SLOT_START_TIMES as readonly string[]).includes(t), {
    message: "Neispravno vreme termina.",
  }),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neispravan datum početka."),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neispravan datum kraja."),
  reason: z.string().trim().min(2, "Unesite naziv termina.").max(120),
});

/**
 * The preview only answers "which dates would this create?", which the label
 * has no bearing on. Validating `reason` here would make the preview fail while
 * the owner is still choosing a day — before they have typed a name at all.
 */
const RecurringPreviewInput = RecurringInput.omit({ reason: true });

export type RecurringInputShape = z.input<typeof RecurringInput>;
export type RecurringPreviewShape = z.input<typeof RecurringPreviewInput>;

export type RecurringPreview = {
  ok: boolean;
  error?: string;
  total: number;
  dates: string[];
  conflicts: Array<{ dateStr: string; label: string; who: string }>;
};

/** Dry run: how many occurrences, and which of them clash with real bookings. */
export async function previewRecurringAction(
  input: RecurringPreviewShape,
): Promise<RecurringPreview> {
  await assertAdmin();

  const parsed = RecurringPreviewInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Neispravni podaci.",
      total: 0,
      dates: [],
      conflicts: [],
    };
  }

  const { courtId, weekday, time, fromDate, toDate } = parsed.data;
  const occurrences = expandWeekly(fromDate, toDate, weekday, time);

  if (occurrences.length === 0) {
    return {
      ok: false,
      error: "U izabranom periodu nema nijednog takvog dana.",
      total: 0,
      dates: [],
      conflicts: [],
    };
  }

  const conflicts = await findConflicts(courtId, occurrences);

  return {
    ok: true,
    total: occurrences.length,
    dates: occurrences.map((o) => formatBelgrade(o.startsAt, "dd.MM.")),
    conflicts,
  };
}

async function findConflicts(
  courtId: string,
  occurrences: Array<{ dateStr: string; startsAt: Date }>,
) {
  const db = serverClient();
  const isoList = occurrences.map((o) => o.startsAt.toISOString());

  const [bookingsRes, blocksRes] = await Promise.all([
    db
      .from("bookings")
      .select("starts_at, customer_name")
      .eq("court_id", courtId)
      .eq("status", "confirmed")
      .in("starts_at", isoList),
    db
      .from("blocked_slots")
      .select("starts_at, reason")
      .eq("court_id", courtId)
      .in("starts_at", isoList),
  ]);

  const conflicts: Array<{ dateStr: string; label: string; who: string }> = [];

  for (const b of bookingsRes.data ?? []) {
    conflicts.push({
      dateStr: belgradeDateStr(b.starts_at as string),
      label: formatBelgrade(b.starts_at as string, "dd.MM.yyyy."),
      who: `rezervacija — ${b.customer_name}`,
    });
  }
  for (const b of blocksRes.data ?? []) {
    conflicts.push({
      dateStr: belgradeDateStr(b.starts_at as string),
      label: formatBelgrade(b.starts_at as string, "dd.MM.yyyy."),
      who: `već blokirano — ${b.reason}`,
    });
  }
  return conflicts;
}

export async function createRecurringAction(
  input: RecurringInputShape & { skipConflicts?: boolean },
): Promise<ActionResult> {
  await assertAdmin();

  const parsed = RecurringInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
  }

  const { courtId, weekday, time, fromDate, toDate, reason } = parsed.data;
  const occurrences = expandWeekly(fromDate, toDate, weekday, time);
  if (occurrences.length === 0) {
    return { ok: false, error: "U izabranom periodu nema nijednog takvog dana." };
  }

  const conflicts = await findConflicts(courtId, occurrences);
  const conflictDates = new Set(conflicts.map((c) => c.dateStr));

  // Conflicts are surfaced, never silently swallowed — quietly dropping a date
  // is exactly the notebook failure this panel replaces.
  if (conflictDates.size > 0 && !input.skipConflicts) {
    return {
      ok: false,
      error: `${conflictDates.size} termin(a) u seriji je već zauzeto.`,
      conflicts: conflicts.map((c) => `${c.label} — ${c.who}`),
    };
  }

  const toInsert = occurrences.filter((o) => !conflictDates.has(o.dateStr));
  if (toInsert.length === 0) {
    return { ok: false, error: "Svi termini u seriji su već zauzeti." };
  }

  const recurrenceId = randomUUID();
  const { error } = await serverClient()
    .from("blocked_slots")
    .insert(
      toInsert.map((o) => ({
        court_id: courtId,
        starts_at: o.startsAt.toISOString(),
        ends_at: o.endsAt.toISOString(),
        reason,
        recurrence_id: recurrenceId,
      })),
    );

  if (error) {
    console.error("[admin] recurring insert failed", error);
    return { ok: false, error: "Kreiranje serije nije uspelo." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/stalni-termini");
  revalidatePath("/rezervacija");

  const skipped = conflictDates.size;
  return {
    ok: true,
    created: toInsert.length,
    skipped,
    message:
      skipped > 0
        ? `Kreirano ${toInsert.length} termina, preskočeno ${skipped} zauzetih.`
        : `Kreirano ${toInsert.length} termina.`,
  };
}

export async function deleteSeriesAction(recurrenceId: string): Promise<ActionResult> {
  await assertAdmin();

  const { error } = await serverClient()
    .from("blocked_slots")
    .delete()
    .eq("recurrence_id", recurrenceId);

  if (error) {
    console.error("[admin] delete series failed", error);
    return { ok: false, error: "Brisanje serije nije uspelo." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/stalni-termini");
  revalidatePath("/rezervacija");
  return { ok: true, message: "Serija je obrisana." };
}

/** Extend an existing series by N more weeks past its current last occurrence. */
export async function extendSeriesAction(
  recurrenceId: string,
  weeks: number,
): Promise<ActionResult> {
  await assertAdmin();
  if (weeks < 1 || weeks > 52) return { ok: false, error: "Neispravan broj nedelja." };

  const db = serverClient();
  const { data: rows, error } = await db
    .from("blocked_slots")
    .select("court_id, starts_at, reason")
    .eq("recurrence_id", recurrenceId)
    .order("starts_at", { ascending: false })
    .limit(1);

  if (error || !rows?.length) return { ok: false, error: "Serija nije pronađena." };

  const last = rows[0];
  const courtId = last.court_id as string;
  const reason = last.reason as string;
  const lastDate = belgradeDateStr(last.starts_at as string);
  const time = formatBelgrade(last.starts_at as string, "HH:mm");
  const weekday = new Date(`${lastDate}T00:00:00`).getDay();

  // Reuse the same Belgrade-calendar expansion so the extension is DST-correct too.
  const end = new Date(`${lastDate}T00:00:00`);
  end.setDate(end.getDate() + weeks * 7);
  const start = new Date(`${lastDate}T00:00:00`);
  start.setDate(start.getDate() + 7);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const occurrences = expandWeekly(fmt(start), fmt(end), weekday, time).map((o) => ({
    ...o,
    endsAt: slotEnd(o.startsAt),
  }));

  if (occurrences.length === 0) return { ok: false, error: "Nema novih termina." };

  const conflicts = await findConflicts(courtId, occurrences);
  const conflictDates = new Set(conflicts.map((c) => c.dateStr));
  const toInsert = occurrences.filter((o) => !conflictDates.has(o.dateStr));

  if (toInsert.length === 0) return { ok: false, error: "Svi novi termini su zauzeti." };

  const { error: insertError } = await db.from("blocked_slots").insert(
    toInsert.map((o) => ({
      court_id: courtId,
      starts_at: o.startsAt.toISOString(),
      ends_at: o.endsAt.toISOString(),
      reason,
      recurrence_id: recurrenceId,
    })),
  );

  if (insertError) {
    console.error("[admin] extend failed", insertError);
    return { ok: false, error: "Produženje nije uspelo." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/stalni-termini");
  revalidatePath("/rezervacija");
  return {
    ok: true,
    message:
      conflictDates.size > 0
        ? `Dodato ${toInsert.length} termina, preskočeno ${conflictDates.size} zauzetih.`
        : `Serija je produžena za ${toInsert.length} nedelja.`,
  };
}
