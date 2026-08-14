import { addDays } from "date-fns";
import { requireAdminPage } from "@/lib/admin-auth";
import { isSupabaseConfigured, serverClient } from "@/lib/supabase";
import { SetupNotice } from "@/components/setup-notice";
import {
  RecurringManager,
  type SeriesView,
} from "@/components/admin/recurring-manager";
import { SLOT_START_TIMES } from "@/lib/config";
import type { BlockedSlot, Court } from "@/lib/types";
import {
  belgradeToday,
  formatBelgrade,
  formatDateStr,
  parseDateStr,
  slotRangeLabel,
  WEEKDAY_NAMES_SR,
} from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stalni termini — Admin" };

/**
 * Load every weekly series and reassemble it from its individual blocked_slots
 * rows. Kept out of the component body: it reads the clock, which makes it
 * impure and therefore not something that belongs in a render path.
 */
async function loadSeries(): Promise<{ courts: Court[]; series: SeriesView[] }> {
  const db = serverClient();
  const [courtsRes, blocksRes] = await Promise.all([
    db.from("courts").select("*").order("display_order"),
    db.from("blocked_slots").select("*").not("recurrence_id", "is", null).order("starts_at"),
  ]);

  if (courtsRes.error) throw courtsRes.error;
  if (blocksRes.error) throw blocksRes.error;

  const courts = (courtsRes.data ?? []) as Court[];
  const blocks = (blocksRes.data ?? []) as BlockedSlot[];
  const courtName = new Map(courts.map((c) => [c.id, c.name]));
  const now = Date.now();

  const grouped = new Map<string, BlockedSlot[]>();
  for (const b of blocks) {
    const id = b.recurrence_id!;
    const list = grouped.get(id);
    if (list) list.push(b);
    else grouped.set(id, [b]);
  }

  const series: SeriesView[] = [...grouped.entries()]
    .map(([recurrenceId, rows]) => {
      const sorted = [...rows].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const weekday = Number(formatBelgrade(first.starts_at, "i")) % 7;

      return {
        recurrenceId,
        courtName: courtName.get(first.court_id) ?? "—",
        reason: first.reason,
        weekdayLabel: `${WEEKDAY_NAMES_SR[weekday]}om`,
        time: formatBelgrade(first.starts_at, "HH:mm"),
        timeRange: slotRangeLabel(first.starts_at, first.ends_at),
        rangeLabel: `${formatBelgrade(first.starts_at, "dd.MM.yyyy.")} – ${formatBelgrade(last.starts_at, "dd.MM.yyyy.")}`,
        total: sorted.length,
        upcoming: sorted.filter((r) => new Date(r.starts_at).getTime() > now).length,
        occurrences: sorted.map((r) => ({
          id: r.id,
          label: formatBelgrade(r.starts_at, "EEE, dd.MM.yyyy."),
          isPast: new Date(r.starts_at).getTime() <= now,
        })),
      } satisfies SeriesView;
    })
    // Series with upcoming dates first — those are the ones the owner manages.
    .sort((a, b) => b.upcoming - a.upcoming || a.courtName.localeCompare(b.courtName));

  return { courts, series };
}

function defaultRange(): { from: string; to: string } {
  const today = belgradeToday();
  // ~12 weeks ahead: a full season block, the usual shape of a stalni termin.
  return { from: today, to: formatDateStr(addDays(parseDateStr(today), 84)) };
}

export default async function RecurringPage() {
  await requireAdminPage();

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">
        <SetupNotice />
      </main>
    );
  }

  const { courts, series } = await loadSeries();
  const { from, to } = defaultRange();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">
      <div className="pt-5">
        <h1 className="font-display text-2xl font-bold tracking-tight">Stalni termini</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Nedeljni termini koji se automatski ponavljaju. Kreirajte jednom za ceo period — svi
          termini se posle brišu ili produžavaju jednim klikom, bez prolaska kroz kalendar.
        </p>
      </div>

      <RecurringManager
        courts={courts.map((c) => ({ id: c.id, name: c.name }))}
        times={[...SLOT_START_TIMES]}
        series={series}
        defaultFrom={from}
        defaultTo={to}
      />
    </main>
  );
}
