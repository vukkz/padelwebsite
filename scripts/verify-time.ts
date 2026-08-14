/**
 * Timezone + pricing sanity checks.
 *
 *   npx tsx scripts/verify-time.ts
 *
 * No database needed. Guards the one thing that silently breaks in production:
 * Belgrade is UTC+1 in winter and UTC+2 in summer, while the server runs UTC.
 * A recurring 15:30 slot must stay 15:30 across the October DST switch.
 */
import { generateSlots, isValidSlotStart } from "../lib/slots";
import { priceForSlot, tierForSlot } from "../lib/pricing";
import {
  belgradeSlotToInstant,
  belgradeHour,
  formatBelgrade,
  formatRsd,
  isBelgradeWeekend,
  longDateLabel,
  shortDayLabel,
  slotRangeLabel,
} from "../lib/time";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = String(actual) === String(expected);
  if (!ok) failures++;
  console.log(`  ${ok ? "✓" : "✗"} ${label}${ok ? "" : `\n      očekivano: ${expected}\n      dobijeno:  ${actual}`}`);
}

console.log("\nDST — 15:30 mora ostati 15:30 preko oktobarske promene");
for (const d of ["2026-10-20", "2026-10-27", "2026-11-03"]) {
  const i = belgradeSlotToInstant(d, "15:30");
  check(`${d} → ${i.toISOString()} → ${formatBelgrade(i, "HH:mm")}`, belgradeHour(i), 15);
}

console.log("\nOffset — leto UTC+2, zima UTC+1");
check("2026-07-15 08:00 (CEST)", belgradeSlotToInstant("2026-07-15", "08:00").toISOString(), "2026-07-15T06:00:00.000Z");
check("2026-01-15 08:00 (CET)", belgradeSlotToInstant("2026-01-15", "08:00").toISOString(), "2026-01-15T07:00:00.000Z");

console.log("\nCene — vikend je peak, radni dan off-peak");
check("pet 2026-08-14 15:30", tierForSlot(belgradeSlotToInstant("2026-08-14", "15:30")), "offPeak");
check("sub 2026-08-15 08:00", tierForSlot(belgradeSlotToInstant("2026-08-15", "08:00")), "peak");
check("ned 2026-08-16 15:30", tierForSlot(belgradeSlotToInstant("2026-08-16", "15:30")), "peak");
check("pon 2026-08-17 08:00", priceForSlot(belgradeSlotToInstant("2026-08-17", "08:00")), 4000);
check("sub 2026-08-15 11:00", priceForSlot(belgradeSlotToInstant("2026-08-15", "11:00")), 5000);
check("vikend detekcija", isBelgradeWeekend(belgradeSlotToInstant("2026-08-15", "12:00")), true);

console.log("\nMreža termina — validacija start vremena");
check("08:00 je na mreži", isValidSlotStart(belgradeSlotToInstant("2026-08-18", "08:00"), "2026-08-18"), true);
check("08:45 NIJE na mreži", isValidSlotStart(belgradeSlotToInstant("2026-08-18", "08:45"), "2026-08-18"), false);
check("17:00 NIJE na mreži", isValidSlotStart(belgradeSlotToInstant("2026-08-18", "17:00"), "2026-08-18"), false);

console.log("\nLokalizacija (latinica)");
const chip = shortDayLabel("2026-08-18");
check("dan-čip", `${chip.weekday} ${chip.day}`, "uto 18.08.");
check("dug datum", longDateLabel("2026-08-18"), "utorak, 18. avgust 2026.");
check("cena", formatRsd(4000), "4.000 RSD");

console.log("\nMreža za utorak 18.08.2026.");
for (const s of generateSlots("2026-08-18")) {
  console.log(`  ${slotRangeLabel(s.startsAt, s.endsAt)}   ${s.tier.padEnd(7)} ${formatRsd(s.priceRsd)}`);
}
console.log("\nMreža za subotu 15.08.2026.");
for (const s of generateSlots("2026-08-15")) {
  console.log(`  ${slotRangeLabel(s.startsAt, s.endsAt)}   ${s.tier.padEnd(7)} ${formatRsd(s.priceRsd)}`);
}

console.log(failures === 0 ? "\n✓ Sve provere prošle.\n" : `\n✗ ${failures} provera nije prošla.\n`);
process.exit(failures === 0 ? 0 : 1);
