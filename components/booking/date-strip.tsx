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
    <div
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
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
              "min-w-[68px] rounded-2xl border px-3 py-2.5 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "border-primary bg-primary text-on-primary shadow-md"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-green-50",
            )}
            style={{ scrollSnapAlign: "center" }}
          >
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-wide",
                active ? "text-on-primary/75" : "text-muted-foreground",
              )}
            >
              {d.isToday ? "Danas" : d.weekday}
            </span>
            <span className="tabular text-lg font-semibold leading-tight">
              {d.day}
            </span>
            {/* Weekend = peak pricing. Marked with a dot AND announced in text
                for screen readers, never colour alone. */}
            {d.isWeekend && (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 h-1 w-1 rounded-full",
                    active ? "bg-accent" : "bg-warning",
                  )}
                />
                <span className="sr-only">peak cena</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
