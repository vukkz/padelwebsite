import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { DateStrip, type DayChip } from "@/components/booking/date-strip";
import { BookingBoard } from "@/components/booking/booking-board";
import { SetupNotice } from "@/components/setup-notice";
import { getDayAvailability } from "@/lib/availability";
import { isSupabaseConfigured } from "@/lib/supabase";
import { BOOKING_DAYS_AHEAD } from "@/lib/config";
import {
  belgradeToday,
  dayOfWeekForDateStr,
  longDateLabel,
  nextDays,
  shortDayLabel,
} from "@/lib/time";

export const metadata: Metadata = {
  title: "Rezerviši termin — Padel House Beograd",
  description: "Izaberi dan, teren i termin. Potvrda odmah, bez poziva.",
};

// Availability changes on every booking, so never serve this from a cache.
export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams,
}: PageProps<"/rezervacija">) {
  const params = await searchParams;
  const today = belgradeToday();
  const days = nextDays(BOOKING_DAYS_AHEAD, today);

  const requested = typeof params.datum === "string" ? params.datum : today;
  // Anything outside the bookable window silently falls back to today rather
  // than 404-ing — a stale shared link should still land somewhere useful.
  if (!days.includes(requested)) redirect("/rezervacija");

  const chips: DayChip[] = days.map((dateStr) => {
    const { weekday, day } = shortDayLabel(dateStr);
    const dow = dayOfWeekForDateStr(dateStr);
    return {
      dateStr,
      weekday,
      day,
      isWeekend: dow === 0 || dow === 6,
      isToday: dateStr === today,
    };
  });

  if (!isSupabaseConfigured()) {
    return (
      <>
        <SiteHeader back />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">
          <SetupNotice />
        </main>
      </>
    );
  }

  const availability = await getDayAvailability(requested);

  return (
    <>
      <SiteHeader back />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20">
        <div className="pt-5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Rezerviši termin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Izaberi dan, pa slobodan termin. Potvrda je odmah — bez poziva.
          </p>
        </div>

        <div className="sticky top-14 z-20 -mx-4 bg-background/95 px-4 pb-2 pt-4 backdrop-blur-md">
          <DateStrip days={chips} selected={requested} />
        </div>

        <BookingBoard
          dateLabel={longDateLabel(requested)}
          courts={availability.courts.map((c) => ({
            id: c.court.id,
            name: c.court.name,
            cells: c.cells,
          }))}
          freeCount={availability.freeCount}
        />
      </main>
    </>
  );
}
