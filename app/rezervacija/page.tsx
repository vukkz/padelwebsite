import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { DateStrip, type DayChip } from "@/components/booking/date-strip";
import { BookingBoard } from "@/components/booking/booking-board";
import { SetupNotice } from "@/components/setup-notice";
import { firstOpenDay, getDayAvailability } from "@/lib/availability";
import { isSupabaseConfigured } from "@/lib/supabase";
import { BOOKING_DAYS_AHEAD, SLOT_MINUTES } from "@/lib/config";
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

  const explicit = typeof params.datum === "string" ? params.datum : null;
  // Anything outside the bookable window silently falls back to today rather
  // than 404-ing — a stale shared link should still land somewhere useful.
  if (explicit && !days.includes(explicit)) redirect("/rezervacija");

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
        <SiteHeader active="/rezervacija" />
        <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 pb-16 sm:px-6">
          <SetupNotice />
        </main>
        <SiteFooter />
      </>
    );
  }

  // No date in the URL: open on the first day that can actually be booked.
  // After the last slot starts, today's grid is entirely in the past and a wall
  // of greyed-out cells reads as a broken system rather than a closed day.
  const availability = explicit
    ? await getDayAvailability(explicit)
    : await firstOpenDay(days);
  const selected = availability.dateStr;

  return (
    <>
      <SiteHeader active="/rezervacija" />
      <main className="flex-1">
        {/*
          Operate, not Persuade. The world dresses this surface — the ink field,
          the spec cells, the square corners — but the grid's job outranks every
          expressive move on it, so the panel voice stops at the heading and the
          board itself stays a legible timetable.
        */}
        {/*
          Operate, not Persuade. The brand dresses the opening block — emerald
          ground, campaign caps, letterspaced labels — and then stops, so the
          grid below stays a legible timetable rather than a styled one.
        */}
        <section className="bg-green text-cream">
          <div className="mx-auto max-w-[92rem] px-5 py-14 sm:px-8 sm:py-20">
            <p className="label text-cream/90">Rezervacija</p>
            <h1 className="display mt-5 text-[2.8rem] sm:text-[4.2rem]">
              Izaberi termin
            </h1>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-cream/85">
              Cena je za ceo teren po terminu od {SLOT_MINUTES} minuta — ne po igraču.
              Potvrdu dobijaš odmah na ekranu, bez poziva.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-9 gap-y-2">
              <span className="label text-cream/90">
                {availability.freeCount} slobodnih termina
              </span>
              <span className="label text-cream/90">{longDateLabel(selected)}</span>
            </div>
          </div>
        </section>

        {/*
          `min-w-0` at every step down to the day strip.

          The strip is a horizontal scroller holding 14 chips. Without an
          explicit floor its ancestors size to content instead of to the
          viewport, the scroller stops clipping, and the whole document grows to
          1141px on a 390px phone — the strip scrolls the page sideways instead
          of scrolling inside itself.
        */}
        <div className="mx-auto w-full min-w-0 max-w-[92rem] px-4 pb-20 sm:px-6">
          {/*
            Opaque, not translucent-with-blur: the page background is a flat
            colour, so the blur bought nothing and its compositing layer rendered
            as a faintly visible panel behind the chips.
          */}
          <div className="sticky top-16 z-20 -mx-5 min-w-0 border-b border-rule bg-cream px-5 pb-3 pt-4 sm:top-20 sm:-mx-8 sm:px-8">
            <DateStrip days={chips} selected={selected} />
          </div>

          <BookingBoard
            dateLabel={longDateLabel(selected)}
            courts={availability.courts.map((c) => ({
              id: c.court.id,
              name: c.court.name,
              cells: c.cells,
            }))}
            freeCount={availability.freeCount}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
