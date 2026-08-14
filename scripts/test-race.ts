/**
 * Concurrency test for the double-booking guard.
 *
 *   npm run dev          # in one terminal
 *   npx tsx scripts/test-race.ts
 *
 * Fires N simultaneous booking requests at the SAME court and the SAME slot.
 * The database must let exactly one through; every other request must come back
 * 409 with the Serbian "termin je upravo rezervisan" message.
 *
 * This is the acceptance test for the whole booking flow. A visual check can't
 * prove the race is closed — only hammering the endpoint can.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

import { belgradeSlotToInstant, belgradeToday, formatBelgrade } from "../lib/time";
import { SLOT_START_TIMES } from "../lib/config";
import { addDays } from "date-fns";
import { formatDateStr, parseDateStr } from "../lib/time";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const PARALLEL = 10;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Nedostaju Supabase env varijable u .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // Pick a slot far enough out that the seed almost certainly left it free, and
  // clear it first so the test starts from a known state.
  const dateStr = formatDateStr(addDays(parseDateStr(belgradeToday()), 13));
  const time = SLOT_START_TIMES[0];
  const startsAt = belgradeSlotToInstant(dateStr, time);

  const { data: courts } = await db.from("courts").select("id, name").order("display_order");
  if (!courts?.length) {
    console.error("Nema terena u bazi — pokrenite `npm run seed` prvo.");
    process.exit(1);
  }
  const court = courts[0];

  console.log(`\nMeta: ${court.name}, ${formatBelgrade(startsAt, "EEEE dd.MM.yyyy.")} u ${time}`);
  console.log(`Čistim slot i šaljem ${PARALLEL} istovremenih zahteva…\n`);

  await db
    .from("bookings")
    .delete()
    .eq("court_id", court.id)
    .eq("starts_at", startsAt.toISOString());
  await db
    .from("blocked_slots")
    .delete()
    .eq("court_id", court.id)
    .eq("starts_at", startsAt.toISOString());

  const results = await Promise.all(
    Array.from({ length: PARALLEL }, async (_, i) => {
      const res = await fetch(`${BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: court.id,
          startsAt: startsAt.toISOString(),
          customerName: `Takmičar Broj ${i + 1}`,
          customerPhone: `06${i} 123 456`,
        }),
      });
      const body = await res.json().catch(() => ({}));
      return { status: res.status, body };
    }),
  );

  const created = results.filter((r) => r.status === 201);
  const conflicts = results.filter((r) => r.status === 409);
  const other = results.filter((r) => r.status !== 201 && r.status !== 409);

  for (const r of results) {
    const detail = r.status === 201 ? "rezervisano" : (r.body?.error ?? "—");
    console.log(`  ${r.status}  ${detail}`);
  }

  // Confirm the database agrees with the HTTP responses.
  const { count } = await db
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("court_id", court.id)
    .eq("starts_at", startsAt.toISOString())
    .eq("status", "confirmed");

  console.log("\n─────────────────────────────────────────────");
  console.log(`  201 Created:     ${created.length}   (očekivano 1)`);
  console.log(`  409 Conflict:    ${conflicts.length}   (očekivano ${PARALLEL - 1})`);
  console.log(`  ostalo:          ${other.length}   (očekivano 0)`);
  console.log(`  redova u bazi:   ${count}   (očekivano 1)`);
  console.log("─────────────────────────────────────────────");

  const pass =
    created.length === 1 && conflicts.length === PARALLEL - 1 && other.length === 0 && count === 1;

  if (!pass) {
    console.error("\n✗ PAO — dupla rezervacija je moguća ili je nešto drugo puklo.\n");
    if (other.length) console.error(other.map((o) => o.body).slice(0, 3));
    process.exit(1);
  }

  console.log("\n✓ PROŠAO — baza je propustila tačno jednu rezervaciju.\n");
}

main().catch((err) => {
  console.error("\nTest nije mogao da se izvrši:", err);
  process.exit(1);
});
