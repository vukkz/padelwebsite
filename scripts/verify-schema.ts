/**
 * Applies supabase/migrations/0001_init.sql to a real in-process Postgres
 * (PGlite) and proves the double-booking guards actually fire.
 *
 *   npx tsx scripts/verify-schema.ts
 *
 * No Supabase project, no Docker, no network. Runs the same SQL that will run
 * against production, so a typo or a constraint that doesn't do what it claims
 * is caught here rather than during the pitch.
 */
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";

let failures = 0;

function pass(label: string) {
  console.log(`  ✓ ${label}`);
}
function fail(label: string, detail?: unknown) {
  failures++;
  console.log(`  ✗ ${label}`);
  if (detail) console.log(`      ${detail}`);
}
function assert(condition: boolean, okLabel: string, failLabel = okLabel) {
  if (condition) pass(okLabel);
  else fail(failLabel);
}

/** Expect the statement to fail with a specific SQLSTATE. */
async function expectError(db: PGlite, sql: string, code: string, label: string) {
  try {
    await db.exec(sql);
    fail(`${label} — očekivana greška ${code}, ali je upis prošao`);
  } catch (err) {
    const actual = (err as { code?: string }).code;
    if (actual === code) pass(`${label} → ${code}`);
    else fail(`${label} — očekivano ${code}, dobijeno ${actual ?? "(bez koda)"}`, err);
  }
}

async function expectOk(db: PGlite, sql: string, label: string) {
  try {
    await db.exec(sql);
    pass(label);
  } catch (err) {
    fail(label, err);
  }
}

async function main() {
  console.log("\nPodižem Postgres (PGlite) i primenjujem migraciju…");
  const db = await PGlite.create({ extensions: { btree_gist } });

  const sql = await readFile("supabase/migrations/0001_init.sql", "utf8");
  try {
    await db.exec(sql);
    pass("Migracija se primenjuje bez greške");
  } catch (err) {
    fail("Migracija NIJE prošla", err);
    process.exit(1);
  }

  // Migrations must be safe to re-run.
  try {
    await db.exec(sql);
    pass("Migracija je idempotentna (drugo pokretanje prolazi)");
  } catch (err) {
    fail("Ponovno pokretanje migracije puca", err);
  }

  console.log("\nStruktura");
  const idx = await db.query<{ indexname: string }>(
    `select indexname from pg_indexes where tablename in ('bookings','blocked_slots')`,
  );
  const names = idx.rows.map((r) => r.indexname);
  for (const expected of [
    "bookings_court_start_confirmed_uniq",
    "blocked_slots_court_start_uniq",
    "bookings_starts_at_idx",
  ]) {
    assert(names.includes(expected), `index ${expected}`, `nedostaje index ${expected}`);
  }

  const con = await db.query<{ conname: string }>(
    `select conname from pg_constraint where conname = 'bookings_no_overlap'`,
  );
  assert(con.rows.length > 0, "constraint bookings_no_overlap", "nedostaje bookings_no_overlap");

  const rls = await db.query<{ relname: string; relrowsecurity: boolean }>(
    `select relname, relrowsecurity from pg_class
     where relname in ('courts','bookings','blocked_slots') and relkind = 'r'`,
  );
  for (const r of rls.rows) {
    assert(r.relrowsecurity, `RLS uključen na ${r.relname}`, `RLS ISKLJUČEN na ${r.relname}`);
  }

  const pol = await db.query<{ count: string }>(`select count(*)::text from pg_policies`);
  assert(
    pol.rows[0].count === "0",
    "Nema RLS policy-ja — anon ključ ne vidi ništa",
    `Postoji ${pol.rows[0].count} policy — anon bi mogao da čita`,
  );

  // -------------------------------------------------------------------------
  console.log("\nDupla rezervacija");
  await db.exec(`
    insert into courts (id, name, display_order) values
      ('11111111-1111-1111-1111-111111111111', 'Teren 1', 1),
      ('22222222-2222-2222-2222-222222222222', 'Teren 2', 2);
  `);

  const book = (
    id: string,
    court = "11111111-1111-1111-1111-111111111111",
    start = "2026-08-18 06:00:00+00",
    end = "2026-08-18 07:30:00+00",
    status = "confirmed",
  ) => `insert into bookings (id, court_id, starts_at, ends_at, customer_name, customer_phone, price_rsd, status)
        values ('${id}', '${court}', '${start}', '${end}', 'Marko Petrović', '064 123 456', 4000, '${status}');`;

  await expectOk(db, book("aaaaaaaa-0000-0000-0000-000000000001"), "Prva rezervacija prolazi");

  await expectError(
    db,
    book("aaaaaaaa-0000-0000-0000-000000000002"),
    "23505",
    "Druga rezervacija za isti teren i isto vreme je odbijena",
  );

  await expectOk(
    db,
    book("aaaaaaaa-0000-0000-0000-000000000003", "22222222-2222-2222-2222-222222222222"),
    "Isti termin na DRUGOM terenu prolazi",
  );

  // The unique index only sees identical start instants. An off-grid start that
  // overlaps must still be rejected — that's what the exclusion constraint is for.
  await expectError(
    db,
    book(
      "aaaaaaaa-0000-0000-0000-000000000004",
      "11111111-1111-1111-1111-111111111111",
      "2026-08-18 06:45:00+00",
      "2026-08-18 08:15:00+00",
    ),
    "23P01",
    "Preklapajući termin van mreže (08:45) je odbijen",
  );

  // Back-to-back must be allowed: 09:30 starts exactly when 08:00 ends.
  await expectOk(
    db,
    book(
      "aaaaaaaa-0000-0000-0000-000000000005",
      "11111111-1111-1111-1111-111111111111",
      "2026-08-18 07:30:00+00",
      "2026-08-18 09:00:00+00",
    ),
    "Termin odmah nakon prethodnog (bez preklapanja) prolazi",
  );

  console.log("\nOtkazivanje oslobađa termin");
  await expectOk(
    db,
    `update bookings set status = 'cancelled' where id = 'aaaaaaaa-0000-0000-0000-000000000001';`,
    "Otkazivanje prolazi",
  );
  await expectOk(
    db,
    book("aaaaaaaa-0000-0000-0000-000000000006"),
    "Isti termin se može ponovo rezervisati posle otkazivanja",
  );

  // Two cancelled rows on the same slot must coexist — the index is partial.
  await expectOk(
    db,
    book("aaaaaaaa-0000-0000-0000-000000000007", undefined, undefined, undefined, "cancelled"),
    "Više otkazanih rezervacija na istom terminu koegzistira (istorija se čuva)",
  );

  console.log("\nOstala pravila");
  await expectError(
    db,
    book(
      "aaaaaaaa-0000-0000-0000-000000000008",
      "11111111-1111-1111-1111-111111111111",
      "2026-09-01 06:00:00+00",
      "2026-09-01 05:00:00+00",
    ),
    "23514",
    "ends_at pre starts_at je odbijen",
  );

  await expectError(
    db,
    `insert into bookings (court_id, starts_at, ends_at, customer_name, customer_phone, price_rsd, status)
     values ('11111111-1111-1111-1111-111111111111', '2026-09-01 06:00:00+00', '2026-09-01 07:30:00+00', 'X', 'Y', 4000, 'pending');`,
    "23514",
    "Nepoznat status je odbijen",
  );

  await expectOk(
    db,
    `insert into blocked_slots (court_id, starts_at, ends_at, reason, recurrence_id)
     values ('11111111-1111-1111-1111-111111111111', '2026-09-08 13:30:00+00', '2026-09-08 15:00:00+00', 'Stalni termin — firma Delta', '99999999-9999-9999-9999-999999999999');`,
    "Blokiran termin se upisuje",
  );
  await expectError(
    db,
    `insert into blocked_slots (court_id, starts_at, ends_at, reason)
     values ('11111111-1111-1111-1111-111111111111', '2026-09-08 13:30:00+00', '2026-09-08 15:00:00+00', 'Duplikat');`,
    "23505",
    "Dupli blok na istom terminu je odbijen",
  );

  await db.close();

  console.log(
    failures === 0
      ? "\n✓ Šema je ispravna — baza sama sprečava duple rezervacije.\n"
      : `\n✗ ${failures} provera nije prošla.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nProvera nije mogla da se izvrši:", err);
  process.exit(1);
});
