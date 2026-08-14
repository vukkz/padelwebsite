import { NextResponse } from "next/server";
import { z } from "zod";
import { isSlotTakenError, isSupabaseConfigured, serverClient } from "@/lib/supabase";
import { findSlot } from "@/lib/slots";
import { sendOwnerNotification } from "@/lib/email";
import {
  belgradeDateStr,
  formatRsd,
  longDateLabel,
  slotRangeLabel,
} from "@/lib/time";

const SLOT_TAKEN_MESSAGE = "Termin je upravo rezervisan. Molimo izaberite drugi.";

const BookingInput = z.object({
  courtId: z.uuid("Neispravan teren."),
  startsAt: z.iso.datetime({ offset: true, message: "Neispravno vreme termina." }),
  customerName: z
    .string({ error: "Unesite ime i prezime." })
    .trim()
    .min(2, "Unesite ime i prezime.")
    .max(60, "Ime je predugačko."),
  customerPhone: z
    .string({ error: "Unesite broj telefona." })
    .trim()
    .min(6, "Neispravan broj telefona.")
    .max(20, "Neispravan broj telefona.")
    .refine(
      (v) => /^(\+3816|06)\d{7,8}$/.test(v.replace(/[^\d+]/g, "")),
      "Neispravan broj telefona.",
    ),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Baza nije povezana. Proverite .env.local." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const parsed = BookingInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Neispravni podaci." },
      { status: 400 },
    );
  }

  const { courtId, customerName, customerPhone } = parsed.data;
  const startsAt = new Date(parsed.data.startsAt);
  const dateStr = belgradeDateStr(startsAt);

  // Never trust a client-supplied time. Anything off the published grid is
  // rejected here — the unique index only catches identical start instants, so
  // an 08:45 request would otherwise sneak in alongside the 08:00 booking.
  const slot = findSlot(startsAt, dateStr);
  if (!slot) {
    return NextResponse.json(
      { error: "Taj termin ne postoji u rasporedu." },
      { status: 400 },
    );
  }

  if (slot.startsAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Taj termin je već prošao." }, { status: 400 });
  }

  // Price is recomputed server-side from the slot. Whatever the client showed is
  // display-only and is discarded here.
  const priceRsd = slot.priceRsd;
  const db = serverClient();

  const { data: court, error: courtError } = await db
    .from("courts")
    .select("id, name")
    .eq("id", courtId)
    .maybeSingle();

  if (courtError) {
    console.error("[bookings] court lookup failed", courtError);
    return NextResponse.json({ error: "Greška na serveru." }, { status: 500 });
  }
  if (!court) {
    return NextResponse.json({ error: "Teren ne postoji." }, { status: 404 });
  }

  // Blocked slots live in a separate table, so the booking constraints can't see
  // them. This read-then-check is not race-proof against an admin creating a
  // block at this exact moment — but blocks are rare, admin-initiated, and low
  // contention. The contended path (player vs. player) is protected by the
  // database constraints below, not by any check up here.
  const { data: block, error: blockError } = await db
    .from("blocked_slots")
    .select("id")
    .eq("court_id", courtId)
    .lt("starts_at", slot.endsAt.toISOString())
    .gt("ends_at", slot.startsAt.toISOString())
    .limit(1)
    .maybeSingle();

  if (blockError) {
    console.error("[bookings] block lookup failed", blockError);
    return NextResponse.json({ error: "Greška na serveru." }, { status: 500 });
  }
  if (block) {
    return NextResponse.json(
      { error: "Taj termin nije dostupan za rezervaciju." },
      { status: 409 },
    );
  }

  // Insert straight away. No "is it free?" SELECT on bookings first — that check
  // and this insert would not be atomic, and two requests arriving in the same
  // millisecond would both pass it. The database decides who wins.
  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      court_id: courtId,
      starts_at: slot.startsAt.toISOString(),
      ends_at: slot.endsAt.toISOString(),
      customer_name: customerName,
      customer_phone: customerPhone,
      price_rsd: priceRsd,
      status: "confirmed",
      is_recurring: false,
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique index violation, 23P01 = exclusion constraint violation.
    // Either one means another request won the race for this slot.
    if (isSlotTakenError(error.code)) {
      return NextResponse.json({ error: SLOT_TAKEN_MESSAGE }, { status: 409 });
    }
    console.error("[bookings] insert failed", error);
    return NextResponse.json(
      { error: "Rezervacija nije uspela. Pokušajte ponovo." },
      { status: 500 },
    );
  }

  const timeRange = slotRangeLabel(slot.startsAt, slot.endsAt);
  const dateLabel = longDateLabel(dateStr);

  // The booking is already committed. A failing email must never turn a saved
  // booking into an error for the player, so this never throws.
  await sendOwnerNotification({
    customerName,
    customerPhone,
    courtName: court.name as string,
    dateLabel,
    timeRange,
    priceRsd,
    shortDate: dateStr,
  });

  return NextResponse.json(
    {
      id: booking.id,
      courtName: court.name,
      dateLabel,
      timeRange,
      priceLabel: formatRsd(priceRsd),
    },
    { status: 201 },
  );
}
