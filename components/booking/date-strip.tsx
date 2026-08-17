"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type DayChip = {
  dateStr: string;
  weekday: string;
  day: string;
  isWeekend: boolean;
  isToday: boolean;
};

/**
 * Horizontal day picker: 14 tappable chips with scroll-snap.
 *
 * A calendar popover is the wrong control on a phone for "the next two weeks" —
 * it costs a tap to open, hides the answer, and shows months the club can't take.
 * A strip puts every bookable day one thumb-swipe away.
 */
export function DateStrip({ days, selected }: { days: DayChip[]; selected: string }) {
  const router = useRouter();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selected]);

  return (
    // The fade on the right edge is the only cue that days 3–14 exist: the
    // scrollbar is hidden and desktop has no swipe to discover it with.
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent"
      />
      <div
        className="no-scrollbar flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1"
        style={{ scrollSnapType: "x mandatory" }}
        role="group"
        aria-label="Izbor datuma"
      >
        {days.map((d) => {
          const active = d.dateStr === selected;
          return (
            <button
              key={d.dateStr}
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => router.push(`/rezervacija?datum=${d.dateStr}`, { scroll: false })}
              aria-current={active ? "date" : undefined}
              className={cn(
                "flex shrink-0 cursor-pointer touch-manipulation flex-col items-center justify-center",
                "min-w-[68px] rounded-sm border px-3 py-2.5 transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "border-green-900 bg-green-900 text-white"
                  : "border-rule bg-card text-foreground hover:border-clay-500",
              )}
              style={{ scrollSnapAlign: "center" }}
            >
              <span
                className={cn(
                  "eyebrow",
                  active ? "text-white/60" : "text-muted-foreground",
                )}
              >
                {d.isToday ? "Danas" : d.weekday}
              </span>
              <span className="tabular mt-0.5 text-[17px] font-semibold leading-tight">
                {d.day}
              </span>
              {/* Weekend = higher price. Marked with a dot AND announced in text
                  for screen readers, never colour alone. */}
              {d.isWeekend && (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 h-1 w-1 rounded-full",
                      active ? "bg-clay-300" : "bg-clay-500",
                    )}
                  />
                  <span className="sr-only">vikend cena</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
