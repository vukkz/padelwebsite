"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUB } from "@/lib/config";
import { sentenceCase } from "@/lib/time";
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
      {/*
        The free count is the one number a visitor is looking for, so it sits
        under the date in the accent colour rather than as grey micro-copy in
        the far corner.
      */}
      <div className="rule-t mt-8 pt-7">
        <h2 className="font-display text-[1.75rem] text-foreground sm:text-[2rem]">
          {sentenceCase(dateLabel)}
        </h2>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          {freeCount > 0 ? (
            <>
              <span className="tabular font-semibold text-clay-500">{freeCount}</span>{" "}
              {freeCount === 1 ? "slobodan termin" : "slobodnih termina"}
            </>
          ) : (
            "Nema slobodnih termina — probaj sledeći dan."
          )}
        </p>
      </div>

      {/* ---------------- Mobile: one section per court ---------------- */}
      <div className="mt-8 space-y-8 md:hidden">
        {courts.map((court, courtIdx) => (
          <section key={court.id}>
            <h3 className="eyebrow rule-t pt-3 text-muted-foreground">{court.name}</h3>
            <ul className="mt-3 space-y-2">
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
                      aria-label={`${court.name}, ${cell.time}, ${label}${
                        isFree ? `, ${cell.priceRsd} dinara` : ""
                      }`}
                      onClick={() => isFree && setSelection({ cell, courtName: court.name })}
                      className={cn(
                        "animate-slot-in flex min-h-[60px] w-full touch-manipulation items-center gap-3 rounded-sm border px-4 py-3 text-left transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        state.className,
                      )}
                      style={{ animationDelay: `${(courtIdx * 6 + i) * 25}ms` }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="tabular block text-[17px] font-semibold leading-tight">
                          {cell.time}
                          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                            – {endTime(cell)}
                          </span>
                        </span>
                        {state.showLabel && (
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs">
                            <Icon
                              className={cn("size-3.5 shrink-0", state.iconClassName)}
                              aria-hidden="true"
                            />
                            <span className="truncate">{label}</span>
                          </span>
                        )}
                      </span>

                      {isFree && (
                        <>
                          <span className="tabular shrink-0 text-right text-[15px] font-semibold text-foreground">
                            {cell.priceRsd.toLocaleString("sr-RS")}
                            <span className="eyebrow ml-1.5 text-muted-foreground">rsd</span>
                          </span>
                          <ChevronRight
                            className="size-4 shrink-0 text-clay-500"
                            aria-hidden="true"
                          />
                        </>
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
      <div className="mt-8 hidden md:block">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `5.5rem repeat(${courts.length}, minmax(0, 1fr))` }}
        >
          <div />
          {courts.map((court) => (
            // A ruled label, not a filled pill — green as a background block here
            // was the single loudest thing on the page and it isn't a control.
            <div
              key={court.id}
              className="eyebrow rule-t pb-3 pt-3 text-center text-muted-foreground"
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
      <div className="tabular flex items-center justify-end pr-2 text-sm text-muted-foreground">
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
              "animate-slot-in flex min-h-[62px] flex-col items-center justify-center gap-0.5 rounded-sm border px-2 py-2 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              state.className,
            )}
            style={{ animationDelay: `${rowIdx * 40}ms` }}
          >
            {state.showLabel && (
              <span className="flex items-center gap-1.5 text-xs">
                <Icon className={cn("size-3.5", state.iconClassName)} aria-hidden="true" />
                <span className="truncate">{label}</span>
              </span>
            )}
            {isFree && (
              <span className="tabular text-[15px] font-semibold text-foreground">
                {cell.priceRsd.toLocaleString("sr-RS")}
                <span className="eyebrow ml-1.5 text-muted-foreground">rsd</span>
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
    <div className="rule-t mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
      <span>Termini sa cenom su slobodni.</span>
      {(["taken", "blocked"] as const).map((s) => {
        const Icon = SLOT_STATE[s].icon;
        return (
          <span key={s} className="inline-flex items-center gap-1.5">
            <Icon className={cn("size-3.5", SLOT_STATE[s].iconClassName)} aria-hidden="true" />
            {SLOT_STATE[s].label}
          </span>
        );
      })}
      <span className="ml-auto">Termin traje 90 minuta · plaćanje na licu mesta</span>
    </div>
  );
}

function SuccessScreen({ data, onReset }: { data: BookingSuccess; onReset: () => void }) {
  return (
    <div className="animate-fade-in rule-t mt-8 pt-12 pb-8">
      {/* Left-aligned like every other block on the site — centring it here made
          the confirmation read as a different page than the board it replaced. */}
      <div className="max-w-xl">
        <p className="eyebrow flex items-center gap-2 text-clay-500">
          <Check className="size-4" aria-hidden="true" />
          Potvrđeno
        </p>
        <h2 className="font-display mt-4 text-[2.1rem] text-foreground sm:text-[2.5rem]">
          Vidimo se na terenu, {data.customerName.split(" ")[0]}.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Klub je obavešten o rezervaciji. Ako nešto iskrsne, javi se na{" "}
          <a
            href={CLUB.phoneHref}
            className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {CLUB.phone}
          </a>
          .
        </p>

        <dl className="mt-10">
          <DetailRow label="Teren" value={data.courtName} />
          <DetailRow label="Datum" value={sentenceCase(data.dateLabel)} />
          <DetailRow label="Vreme" value={data.timeRange} />
          <DetailRow label="Cena" value={data.priceLabel} strong />
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Button variant="accent" size="lg" onClick={onReset}>
            Rezerviši još jedan termin
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline decoration-rule underline-offset-[6px] transition-colors hover:text-foreground hover:decoration-foreground"
          >
            Nazad na početnu
          </Link>
        </div>

        <div className="rule-t mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 pt-5 text-[13px] text-muted-foreground">
          <a
            href={CLUB.phoneHref}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {CLUB.phone}
          </a>
          <a
            href={CLUB.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            {CLUB.instagramHandle}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rule-t grid grid-cols-[7rem_1fr] gap-4 py-4 first:border-t-0 first:pt-0">
      <dt className="eyebrow pt-1.5 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-[15px] leading-relaxed text-foreground",
          strong && "tabular font-display text-[1.35rem] text-clay-500",
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
