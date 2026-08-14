"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, ChevronRight, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUB } from "@/lib/config";
import type { PublicSlotCell } from "@/lib/types";
import { SLOT_STATE } from "./slot-styles";
import { BookingSheet, type BookingSuccess } from "./booking-sheet";

export type BoardCourt = {
  id: string;
  name: string;
  cells: PublicSlotCell[];
};

type Selection = { cell: PublicSlotCell; courtName: string };

export function BookingBoard({
  dateLabel,
  courts,
  freeCount,
}: {
  dateLabel: string;
  courts: BoardCourt[];
  freeCount: number;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  if (success) {
    return <SuccessScreen data={success} onReset={() => setSuccess(null)} />;
  }

  const times = courts[0]?.cells.map((c) => c.time) ?? [];

  return (
    <>
      <div className="flex items-baseline justify-between gap-3 pt-5">
        <h2 className="font-display text-xl font-semibold capitalize">{dateLabel}</h2>
        <p className="shrink-0 text-sm text-muted-foreground">
          {freeCount > 0 ? (
            <>
              <span className="font-semibold text-success tabular">{freeCount}</span>{" "}
              slobodnih
            </>
          ) : (
            "Nema slobodnih termina"
          )}
        </p>
      </div>

      {/* ---------------- Mobile: one section per court ---------------- */}
      <div className="mt-4 space-y-6 md:hidden">
        {courts.map((court, courtIdx) => (
          <section key={court.id}>
            <h3 className="font-display mb-2 text-base font-semibold tracking-wide text-primary">
              {court.name}
            </h3>
            <ul className="space-y-2">
              {court.cells.map((cell, i) => {
                const state = SLOT_STATE[cell.status];
                const Icon = state.icon;
                const isFree = cell.status === "free";
                const label =
                  cell.status === "blocked" ? cell.blockReason || state.label : state.label;

                return (
                  <li key={cell.startsAt}>
                    <button
                      type="button"
                      disabled={!isFree}
                      aria-disabled={!isFree}
                      onClick={() => isFree && setSelection({ cell, courtName: court.name })}
                      className={cn(
                        "animate-slot-in flex min-h-[60px] w-full touch-manipulation items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        state.className,
                      )}
                      style={{ animationDelay: `${(courtIdx * 6 + i) * 25}ms` }}
                    >
                      <Icon
                        className={cn("size-5 shrink-0", state.iconClassName)}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-display tabular block text-lg font-semibold leading-tight">
                          {cell.time}
                          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                            – {endTime(cell)}
                          </span>
                        </span>
                        <span className="block truncate text-xs">{label}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span
                          className={cn(
                            "tabular block text-base font-semibold",
                            isFree ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {cell.priceRsd.toLocaleString("sr-RS")}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                          RSD
                        </span>
                      </span>
                      {isFree && (
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* ---------------- Desktop: courts × slots matrix ---------------- */}
      <div className="mt-4 hidden md:block">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `88px repeat(${courts.length}, minmax(0, 1fr))` }}
        >
          <div />
          {courts.map((court) => (
            <div
              key={court.id}
              className="font-display rounded-xl bg-primary px-3 py-2 text-center text-base font-semibold text-on-primary"
            >
              {court.name}
            </div>
          ))}

          {times.map((time, rowIdx) => (
            <Row key={time} time={time} courts={courts} rowIdx={rowIdx} onPick={setSelection} />
          ))}
        </div>
      </div>

      <Legend />

      {selection && (
        <BookingSheet
          cell={selection.cell}
          courtName={selection.courtName}
          dateLabel={dateLabel}
          onClose={() => setSelection(null)}
          onSuccess={(data) => {
            setSelection(null);
            setSuccess(data);
            router.refresh();
          }}
          onConflict={() => {
            // The slot went to someone else mid-form. Refresh so it greys out
            // behind the sheet instead of leaving a dead end.
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function Row({
  time,
  courts,
  rowIdx,
  onPick,
}: {
  time: string;
  courts: BoardCourt[];
  rowIdx: number;
  onPick: (s: Selection) => void;
}) {
  return (
    <>
      <div className="font-display tabular flex items-center justify-end pr-1 text-sm font-semibold text-muted-foreground">
        {time}
      </div>
      {courts.map((court) => {
        const cell = court.cells[rowIdx];
        if (!cell) return <div key={court.id} />;
        const state = SLOT_STATE[cell.status];
        const Icon = state.icon;
        const isFree = cell.status === "free";
        const label = cell.status === "blocked" ? cell.blockReason || state.label : state.label;

        return (
          <button
            key={court.id}
            type="button"
            disabled={!isFree}
            aria-disabled={!isFree}
            aria-label={`${court.name}, ${time}, ${label}${isFree ? `, ${cell.priceRsd} dinara` : ""}`}
            onClick={() => isFree && onPick({ cell, courtName: court.name })}
            className={cn(
              "animate-slot-in flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              state.className,
            )}
            style={{ animationDelay: `${rowIdx * 40}ms` }}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <Icon className={cn("size-3.5", state.iconClassName)} aria-hidden="true" />
              <span className="truncate">{label}</span>
            </span>
            {isFree && (
              <span className="tabular text-sm font-semibold text-primary">
                {cell.priceRsd.toLocaleString("sr-RS")} RSD
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

function Legend() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
      {(["free", "taken", "blocked"] as const).map((s) => {
        const Icon = SLOT_STATE[s].icon;
        return (
          <span key={s} className="inline-flex items-center gap-1.5">
            <Icon className={cn("size-3.5", SLOT_STATE[s].iconClassName)} aria-hidden="true" />
            {SLOT_STATE[s].label}
          </span>
        );
      })}
      <span className="ml-auto">Termin traje 90 minuta</span>
    </div>
  );
}

function SuccessScreen({ data, onReset }: { data: BookingSuccess; onReset: () => void }) {
  return (
    <div className="animate-fade-in py-8">
      <div className="mx-auto max-w-md rounded-3xl border border-primary/20 bg-card p-6 text-center shadow-lg sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent">
          <CalendarCheck className="size-8 text-on-accent" aria-hidden="true" />
        </div>

        <h2 className="font-display mt-5 text-2xl font-bold">Termin je rezervisan</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Vidimo se na terenu, {data.customerName.split(" ")[0]}.
        </p>

        <dl className="mt-6 divide-y divide-border rounded-2xl border border-border text-left">
          <Row2 label="Teren" value={data.courtName} />
          <Row2 label="Datum" value={data.dateLabel} capitalize />
          <Row2 label="Vreme" value={data.timeRange} />
          <Row2 label="Cena" value={data.priceLabel} strong />
        </dl>

        <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-left text-xs leading-relaxed text-primary">
          Klub je obavešten o vašoj rezervaciji. Ako nešto iskrsne, javite se na{" "}
          <a href={CLUB.phoneHref} className="font-semibold underline underline-offset-2">
            {CLUB.phone}
          </a>
          .
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" size="lg" onClick={onReset}>
            Rezerviši još jedan termin
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" size="md" className="w-full">
              Nazad na početnu
            </Button>
          </Link>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <a href={CLUB.phoneHref} className="inline-flex items-center gap-1.5 hover:text-primary">
            <Phone className="size-3.5" aria-hidden="true" />
            {CLUB.phone}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            {CLUB.city}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row2({
  label,
  value,
  strong,
  capitalize,
}: {
  label: string;
  value: string;
  strong?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right text-sm font-medium",
          strong && "tabular text-base font-bold text-primary",
          capitalize && "capitalize",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function endTime(cell: PublicSlotCell): string {
  const [h, m] = cell.time.split(":").map(Number);
  const total = h * 60 + m + 90;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
