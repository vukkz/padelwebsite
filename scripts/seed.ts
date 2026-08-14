/**
 * Seed the demo database.
 *
 *   npx tsx scripts/seed.ts
 *
 * Idempotent — wipes bookings/blocked_slots/courts and rebuilds them, so it is
 * safe to re-run whenever the demo data starts looking chewed up after a pitch.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { addDays } from "date-fns";

config({ path: ".env.local" });

import { COURT_NAMES, SLOT_START_TIMES } from "../lib/config";
import { priceForSlot } from "../lib/pricing";
import {
  belgradeDateStr,
  belgradeSlotToInstant,
  belgradeToday,
  dayOfWeekForDateStr,
  formatBelgrade,
  formatDateStr,
  nextDays,
  parseDateStr,
  slotEnd,
} from "../lib/time";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "\n  Nedostaju env varijable.\n" +
      "  Dodajte NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local\n",
  );
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FIRST_NAMES_M = [
  "Marko", "Nikola", "Stefan", "Dušan", "Luka", "Nemanja", "Filip",
  "Aleksandar", "Miloš", "Vladimir", "Uroš", "Petar", "Đorđe", "Bojan",
];
const FIRST_NAMES_F = [
  "Ana", "Milica", "Jelena", "Ivana", "Marija", "Katarina", "Tijana",
  "Jovana", "Sara", "Nataša", "Teodora", "Andrijana",
];
const LAST_NAMES = [
  "Petrović", "Jovanović", "Ilić", "Stanković", "Nikolić", "Marković",
  "Popović", "Đorđević", "Todorović", "Ristić", "Savić", "Lukić",
  "Mitrović", "Pavlović", "Kostić", "Milošević", "Ranković", "Vasić",
];

/** Deterministic PRNG so re-seeding produces the same believable schedule. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const rnd = makeRng(20260814);

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];

function randomName(): string {
  const first = rnd() < 0.62 ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
  return `${first} ${pick(LAST_NAMES)}`;
}

function randomPhone(): string {
  const prefix = pick(["060", "061", "062", "063", "064", "065", "066", "069"]);
  const rest = String(Math.floor(rnd() * 9_000_000) + 1_000_000);
  return `${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`;
}

/**
 * Relative desirability of a slot.
 *
 * Uniform scatter reads as a dead club. Real demand clusters three ways, and
 * the seeded grid should show all three: weekends fill first, afternoons fill
 * before mornings, and the next few days are fuller than week three because
 * that is simply how far ahead people book.
 *
 * `dayIndex` is days from today.
 */
function slotWeight(dateStr: string, time: string, dayIndex: number): number {
  const dow = dayOfWeekForDateStr(dateStr);
  const weekend = dow === 0 || dow === 6;
  const hour = Number(time.slice(0, 2));

  let w = weekend ? 3.2 : 1;
  if (hour >= 14) w *= 2.2; // late afternoon is prime time
  else if (hour >= 12) w *= 1.4;
  if (hour < 10) w *= 0.4; // early mornings stay quiet

  // Near-term days are fuller — and they're the ones shown during the pitch.
  w *= 1 + Math.max(0, 7 - dayIndex) * 0.28;
  return w;
}

/** `--dry` builds the same data and prints the resulting grid without writing anything. */
const DRY = process.argv.includes("--dry");

async function main() {
  let courts: Array<{ id: string; name: string }>;

  if (DRY) {
    console.log("→ DRY RUN — ništa se ne upisuje u bazu.\n");
    courts = COURT_NAMES.map((name) => ({ id: randomUUID(), name }));
  } else {
    console.log("→ Brisanje postojećih podataka…");
    // Order matters: bookings and blocks reference courts.
    await db.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await db.from("blocked_slots").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await db.from("courts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("→ Kreiranje terena…");
    const { data, error } = await db
      .from("courts")
      .insert(COURT_NAMES.map((name, i) => ({ name, display_order: i + 1 })))
      .select();

    if (error || !data) throw error ?? new Error("Tereni nisu kreirani");
    courts = data as Array<{ id: string; name: string }>;
    console.log(`  ${courts.length} terena: ${courts.map((c) => c.name).join(", ")}`);
  }

  const days = nextDays(14);

  // ---------------------------------------------------------------------
  // Recurring blocks first — bookings must not be seeded on top of them.
  // ---------------------------------------------------------------------
  console.log("→ Stalni termini…");
  const recurringSeries = [
    { courtIdx: 1, weekday: 2, time: "15:30", reason: "Stalni termin — firma Delta", weeks: 10 },
    { courtIdx: 0, weekday: 4, time: "09:30", reason: "Stalni termin — Marko Petrović", weeks: 10 },
    { courtIdx: 2, weekday: 6, time: "11:00", reason: "Škola padela — grupa A", weeks: 8 },
  ];

  type BlockRow = {
    court_id: string;
    starts_at: string;
    ends_at: string;
    reason: string;
    recurrence_id: string | null;
  };
  const blockedRows: BlockRow[] = [];
  const blockedKeys = new Set<string>();

  for (const series of recurringSeries) {
    const recurrenceId = randomUUID();
    const court = courts[series.courtIdx];
    // Walk forward from today to the first matching weekday, then step weekly.
    const start = parseDateStr(belgradeToday());
    let cursor = start;
    while (cursor.getDay() !== series.weekday) cursor = addDays(cursor, 1);

    for (let w = 0; w < series.weeks; w++) {
      const dateStr = formatDateStr(addDays(cursor, w * 7));
      const startsAt = belgradeSlotToInstant(dateStr, series.time);
      blockedKeys.add(`${court.id}|${startsAt.toISOString()}`);
      blockedRows.push({
        court_id: court.id,
        starts_at: startsAt.toISOString(),
        ends_at: slotEnd(startsAt).toISOString(),
        reason: series.reason,
        recurrence_id: recurrenceId,
      });
    }
  }

  // A one-off maintenance block, so the admin list shows both kinds.
  {
    const dateStr = days[3];
    const court = courts[0];
    const startsAt = belgradeSlotToInstant(dateStr, "08:00");
    blockedKeys.add(`${court.id}|${startsAt.toISOString()}`);
    blockedRows.push({
      court_id: court.id,
      starts_at: startsAt.toISOString(),
      ends_at: slotEnd(startsAt).toISOString(),
      reason: "Održavanje terena",
      recurrence_id: null,
    });
  }

  if (!DRY) {
    const { error: blockError } = await db.from("blocked_slots").insert(blockedRows);
    if (blockError) throw blockError;
  }
  console.log(`  ${blockedRows.length} blokiranih termina (${recurringSeries.length} serije)`);

  // ---------------------------------------------------------------------
  // Bookings
  // ---------------------------------------------------------------------
  console.log("→ Rezervacije…");
  const TARGET = 34;

  // Build every free candidate slot across the whole window first, then sample.
  // Filling greedily in date order would burn the entire quota on the first few
  // days and leave the second week of the grid completely empty.
  type Candidate = { courtId: string; startsAt: Date; weight: number };
  const candidates: Candidate[] = [];

  days.forEach((dateStr, dayIndex) => {
    for (const time of SLOT_START_TIMES) {
      for (const court of courts) {
        const startsAt = belgradeSlotToInstant(dateStr, time);
        if (startsAt.getTime() <= Date.now()) continue; // don't seed the past
        if (blockedKeys.has(`${court.id}|${startsAt.toISOString()}`)) continue;
        candidates.push({
          courtId: court.id,
          startsAt,
          weight: slotWeight(dateStr, time, dayIndex),
        });
      }
    }
  });

  const pool = [...candidates];
  const chosen: Candidate[] = [];
  const want = Math.min(TARGET, pool.length);

  /** Draw one candidate from `pool`, favouring higher weights. Removes it. */
  const draw = (from: Candidate[]): Candidate | null => {
    if (from.length === 0) return null;
    const total = from.reduce((s, c) => s + c.weight, 0);
    let r = rnd() * total;
    let idx = from.length - 1;
    for (let i = 0; i < from.length; i++) {
      r -= from[i].weight;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    const [picked] = from.splice(idx, 1);
    // Keep the shared pool in sync when drawing from a per-day subset.
    const poolIdx = pool.indexOf(picked);
    if (poolIdx !== -1) pool.splice(poolIdx, 1);
    return picked;
  };

  // Give every bookable day at least one booking first. A day sitting at zero
  // reads as a broken system rather than a quiet Tuesday when the owner clicks
  // through the date strip during the pitch.
  const byDay = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const day = belgradeDateStr(c.startsAt);
    const list = byDay.get(day);
    if (list) list.push(c);
    else byDay.set(day, [c]);
  }
  for (const dayCandidates of byDay.values()) {
    if (chosen.length >= want) break;
    const picked = draw(dayCandidates);
    if (picked) chosen.push(picked);
  }

  // Fill the remainder globally, so weekends and afternoons take the surplus.
  while (chosen.length < want) {
    const picked = draw(pool);
    if (!picked) break;
    chosen.push(picked);
  }

  const bookingRows = chosen
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .map((c) => ({
      court_id: c.courtId,
      starts_at: c.startsAt.toISOString(),
      ends_at: slotEnd(c.startsAt).toISOString(),
      customer_name: randomName(),
      customer_phone: randomPhone(),
      price_rsd: priceForSlot(c.startsAt),
      status: "confirmed",
      is_recurring: false,
    }));

  if (!DRY) {
    const { error: bookingError } = await db.from("bookings").insert(bookingRows);
    if (bookingError) throw bookingError;
  }

  // A few cancellations, so the admin view has history and the grid proves that
  // a cancelled slot becomes bookable again.
  const cancelled: Array<Record<string, unknown>> = [];
  for (let i = 0; i < 3; i++) {
    const dateStr = days[5 + i];
    const court = courts[i % courts.length];
    const time = SLOT_START_TIMES[1];
    const startsAt = belgradeSlotToInstant(dateStr, time);
    const key = `${court.id}|${startsAt.toISOString()}`;
    if (blockedKeys.has(key)) continue;
    if (bookingRows.some((b) => b.court_id === court.id && b.starts_at === startsAt.toISOString()))
      continue;

    cancelled.push({
      court_id: court.id,
      starts_at: startsAt.toISOString(),
      ends_at: slotEnd(startsAt).toISOString(),
      customer_name: randomName(),
      customer_phone: randomPhone(),
      price_rsd: priceForSlot(startsAt),
      status: "cancelled",
      is_recurring: false,
    });
  }

  if (cancelled.length && !DRY) {
    const { error } = await db.from("bookings").insert(cancelled);
    if (error) throw error;
  }

  console.log(`  ${bookingRows.length} potvrđenih, ${cancelled.length} otkazanih`);

  printGrid(days, courts, bookingRows, blockedRows);
  console.log(DRY ? "\n✓ Dry run završen — ništa nije upisano.\n" : "\n✓ Seed završen.\n");
}

/** Per-day occupancy, so it's obvious at a glance whether the grid looks alive. */
function printGrid(
  days: string[],
  courts: Array<{ id: string; name: string }>,
  bookings: Array<{ starts_at: unknown }>,
  blocks: Array<{ starts_at: unknown }>,
) {
  const perDay = new Map<string, { booked: number; blocked: number }>();
  for (const d of days) perDay.set(d, { booked: 0, blocked: 0 });

  const bump = (iso: unknown, kind: "booked" | "blocked") => {
    const day = belgradeDateStr(String(iso));
    const entry = perDay.get(day);
    if (entry) entry[kind]++;
  };
  for (const b of bookings) bump(b.starts_at, "booked");
  for (const b of blocks) bump(b.starts_at, "blocked");

  const perDayTotal = courts.length * SLOT_START_TIMES.length;
  console.log(`\n  Popunjenost (${perDayTotal} termina dnevno):`);

  for (const d of days) {
    const { booked, blocked } = perDay.get(d)!;
    const free = perDayTotal - booked - blocked;
    const bar = "█".repeat(booked) + "▒".repeat(blocked) + "·".repeat(Math.max(free, 0));
    const label = formatBelgrade(belgradeSlotToInstant(d, "12:00"), "EEE dd.MM.");
    console.log(`    ${label.padEnd(11)} ${bar}  ${booked}+${blocked}`);
  }
  console.log("    █ rezervisano   ▒ blokirano   · slobodno");
}

main().catch((err) => {
  console.error("\n✗ Seed nije uspeo:\n", err);
  process.exit(1);
});
