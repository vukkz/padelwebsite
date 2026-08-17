import Link from "next/link";
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminDay } from "@/lib/availability";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SetupNotice } from "@/components/setup-notice";
import { DayBoard, type DayCourt } from "@/components/admin/day-board";
import { generateSlots } from "@/lib/slots";
import {
  belgradeToday,
  formatDateStr,
  formatRsd,
  longDateLabel,
  parseDateStr,
  sentenceCase,
  slotRangeLabel,
} from "@/lib/time";
import { addDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminDayPage({ searchParams }: PageProps<"/admin">) {
  await requireAdminPage();

  const params = await searchParams;
  const today = belgradeToday();
  const dateStr =
    typeof params.datum === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.datum)
      ? params.datum
      : today;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">
        <SetupNotice />
      </main>
    );
  }

  const { courts, bookings, blocks } = await getAdminDay(dateStr);
  const slots = generateSlots(dateStr);

  const key = (courtId: string, iso: string) => `${courtId}|${new Date(iso).getTime()}`;

  const bookingMap = new Map(
    bookings
      .filter((b) => b.status === "confirmed")
      .map((b) => [key(b.court_id, b.starts_at), b]),
  );
  const blockMap = new Map(blocks.map((b) => [key(b.court_id, b.starts_at), b]));

  const dayCourts: DayCourt[] = courts.map((court) => ({
    id: court.id,
    name: court.name,
    cells: slots.map((slot) => {
      const k = key(court.id, slot.startsAt.toISOString());
      const booking = bookingMap.get(k);
      const block = blockMap.get(k);
      const timeRange = slotRangeLabel(slot.startsAt, slot.endsAt);

      if (block) {
        return {
          time: slot.time,
          timeRange,
          courtId: court.id,
          status: "blocked" as const,
          block: {
            id: block.id,
            reason: block.reason,
            isSeries: Boolean(block.recurrence_id),
          },
        };
      }
      if (booking) {
        return {
          time: slot.time,
          timeRange,
          courtId: court.id,
          status: "booked" as const,
          booking: {
            id: booking.id,
            name: booking.customer_name,
            phone: booking.customer_phone,
            phoneHref: `tel:${booking.customer_phone.replace(/[^\d+]/g, "")}`,
            priceRsd: booking.price_rsd,
            isRecurring: booking.is_recurring,
          },
        };
      }
      return { time: slot.time, timeRange, courtId: court.id, status: "free" as const };
    }),
  }));

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const revenue = confirmed.reduce((sum, b) => sum + b.price_rsd, 0);
  const totalCells = courts.length * slots.length;
  const freeCount = totalCells - confirmed.length - blocks.length;

  const prev = formatDateStr(addDays(parseDateStr(dateStr), -1));
  const next = formatDateStr(addDays(parseDateStr(dateStr), 1));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">
      <div className="flex flex-wrap items-center gap-3 pt-5">
        <div className="flex items-center gap-1">
          <Link
            href={`/admin?datum=${prev}`}
            aria-label="Prethodni dan"
            className="flex size-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/admin?datum=${next}`}
            aria-label="Sledeći dan"
            className="flex size-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="min-w-0">
          <h1 className="font-display truncate text-xl sm:text-2xl">
            {sentenceCase(longDateLabel(dateStr))}
          </h1>
          {dateStr !== today && (
            <Link href="/admin" className="text-xs font-medium text-primary hover:underline">
              ← Nazad na danas
            </Link>
          )}
        </div>

        <form className="ml-auto flex items-center gap-2">
          <label htmlFor="datum" className="sr-only">
            Izaberi datum
          </label>
          <input
            id="datum"
            name="datum"
            type="date"
            defaultValue={dateStr}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Idi
          </button>
        </form>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Rezervisano" value={String(confirmed.length)} tone="primary" />
        <Stat label="Slobodno" value={String(Math.max(freeCount, 0))} />
        <Stat label="Blokirano" value={String(blocks.length)} />
        <Stat label="Promet" value={formatRsd(revenue)} tone="accent" />
      </div>

      {cancelled.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {cancelled.length} otkazan{cancelled.length === 1 ? "a rezervacija" : "e rezervacije"} na
          ovaj dan — ti termini su ponovo slobodni.
        </p>
      )}

      <DayBoard dateStr={dateStr} courts={dayCourts} times={slots.map((s) => s.time)} />

      <Link
        href="/admin/stalni-termini"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary">
          <Repeat className="size-5 text-on-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Stalni termini</p>
          <p className="text-sm text-muted-foreground">
            Kreiraj i upravljaj nedeljnim terminima na svim terenima
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary" | "accent";
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={
          "tabular mt-0.5 text-xl font-bold " +
          (tone === "primary" ? "text-primary" : tone === "accent" ? "text-success" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
