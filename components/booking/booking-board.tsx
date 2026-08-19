"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CANCELLATION_HOURS, CLUB } from "@/lib/config";
import { rememberBooking } from "@/lib/own-bookings";
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

  /*
    The draft lives here so it outlives the sheet.

    A 409 unmounts the sheet, and with it went the name and phone the visitor
    had just typed — for a collision they did not cause. It also survives
    switching to an offered alternative and "Rezerviši još jedan", both of which
    are the same person continuing.
  */
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");

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

      {/*
        One matrix at every width: times down, courts across.

        The phone used to get a different control entirely — one stacked section
        per court, six slots each, 18 buttons spanning ~1250px. That is
        court-major, and nobody arrives asking what Teren 2 has all day. They
        arrive with a time in mind, and answering "what is free at 11:00?" meant
        three separate scans 490px apart plus holding all three answers in
        working memory to compare them. Here it is one horizontal glance.

        Below `md` the time gutter narrows and the gaps tighten; the grid, the
        cells and the six rows are otherwise identical, so the two breakpoints
        speak once. About 430px on a phone, and it reads as a single ruler
        rather than three lists that happen to be stacked.

        `--court-count` rather than an interpolated template string: the value is
        dynamic but the two column settings are not, so this keeps them in
        Tailwind where the breakpoint lives instead of branching in JS.
      */}
      <div
        className={cn(
          "mt-8 grid gap-1.5 [grid-template-columns:3.25rem_repeat(var(--court-count),minmax(0,1fr))]",
          "md:gap-2 md:[grid-template-columns:5.5rem_repeat(var(--court-count),minmax(0,1fr))]",
        )}
        style={{ "--court-count": courts.length } as CSSProperties}
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

      <Legend />

      {selection && (
        <BookingSheet
          /*
            Keyed on the slot so switching to an offered alternative remounts
            the sheet: `taken` and the conflict alert reset, while the draft —
            which lives up here — carries over untouched.
          */
          key={`${selection.courtName}-${selection.cell.startsAt}`}
          cell={selection.cell}
          courtName={selection.courtName}
          dateLabel={dateLabel}
          courts={courts}
          name={draftName}
          phone={draftPhone}
          onNameChange={setDraftName}
          onPhoneChange={setDraftPhone}
          onPickAlternative={(cell, courtName) => setSelection({ cell, courtName })}
          onClose={() => setSelection(null)}
          onSuccess={(data) => {
            // Store the token here rather than on the success screen: it is the
            // only copy that will ever exist, and it must survive the player
            // closing the tab before that screen finishes rendering.
            if (data.cancelToken) {
              rememberBooking({ token: data.cancelToken, startsAt: data.startsAt });
            }
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
      {/*
        The gutter carries the whole span, not just the start. The stacked
        mobile list used to print "08:00 – 09:30" in every one of its 18 rows;
        stating it once per row here says the same thing eighteen times less,
        and keeps the fact that a slot is 90 minutes visible on the grid rather
        than only in the legend.
      */}
      <div className="tabular flex flex-col items-end justify-center pr-2 leading-tight">
        <span className="text-[13px] font-semibold text-foreground md:text-sm">{time}</span>
        <span className="text-[11px] text-muted-foreground">–{endTime(time)}</span>
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
            onClick={(e) => {
              if (!isFree) return;
              // Take focus before opening. The sheet restores focus to whatever
              // held it, and Safari — iOS in particular, which is most of this
              // traffic — does not focus a button when it is tapped. Without
              // this the sheet opens from <body> and has nothing to give back.
              e.currentTarget.focus();
              onPick({ cell, courtName: court.name });
            }}
            className={cn(
              "animate-slot-in flex min-h-[62px] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm border px-2 py-2 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              state.className,
            )}
            style={{ animationDelay: `${rowIdx * 40}ms` }}
          >
            {state.showLabel && (
              /*
                Two separate failures met on the phone here.

                The `truncate` never fired: its parent is a flex item at the
                default `min-width:auto`, so the row grew to fit the text and
                pushed it out of a ~96px cell rather than clipping it. Hence
                `min-w-0` on both, `w-full` to bind the row to the cell, and
                `overflow-hidden` on the button as the backstop.

                Clipping alone would not have made it readable, though.
                `blockReason` is free text an admin types — the placeholder in
                the recurring manager is literally "Stalni termin — Marko
                Petrović" — and at this width no clip of it survives as
                language: it reads "Stalni t…". So below `md` the cell shows
                the state instead, stacked under its icon where the full cell
                width is one word's worth of room. From `md` the cell is wide
                enough for the admin's own wording, and it stays on one line.

                Nothing is lost at any width: the button's aria-label is built
                from `label`, so a screen reader still announces the full
                reason on a phone.
              */
              <span className="flex w-full min-w-0 flex-col items-center gap-0.5 text-[11px] leading-tight md:flex-row md:justify-center md:gap-1.5 md:text-xs">
                <Icon
                  className={cn("size-3.5 shrink-0", state.iconClassName)}
                  aria-hidden="true"
                />
                <span className="min-w-0 max-w-full text-center md:truncate">
                  <span className="md:hidden">{state.label}</span>
                  <span className="hidden md:inline">{label}</span>
                </span>
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
      {/* `ml-auto` only once there is a line to push it to the end of. Below
          `md` the legend is three short items on 358px, and pushing this one
          right left a ragged hole mid-row. */}
      <span className="w-full md:ml-auto md:w-auto">
        Termin traje 90 minuta · plaćanje na licu mesta
      </span>
      {/*
        The grid states a price in every free cell — the most repeated
        unconfirmed fact on the site, and the surface the club will scrutinise
        first. Same disclosure as the /padel price table, on its own line so it
        is not read as part of the legend.
      */}
      <span className="w-full">
        Cene su okvirna procena za ovaj predlog, ne zvanični cenovnik kluba.
      </span>
    </div>
  );
}

function SuccessScreen({ data, onReset }: { data: BookingSuccess; onReset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  /*
    The sheet hands focus back to whatever opened it, but the success path
    unmounts the board along with the sheet, so that slot button no longer
    exists and focus lands on <body>. For a keyboard or screen reader user the
    booking would simply complete in silence. Take it here instead: the heading
    both confirms and names the booking.
  */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="animate-fade-in rule-t mt-8 pt-12 pb-8">
      {/* Left-aligned like every other block on the site — centring it here made
          the confirmation read as a different page than the board it replaced. */}
      <div className="max-w-xl">
        <p className="eyebrow flex items-center gap-2 text-clay-500">
          <Check className="size-4" aria-hidden="true" />
          Potvrđeno
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display mt-4 text-[2.1rem] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:text-[2.5rem]"
        >
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

        {/*
          The way out, stated at the moment the commitment is made rather than
          left for the player to discover they do not have. Quiet on purpose:
          terracotta is the accent and it is already spent on the button below,
          and a cancellation link competing with the confirmation would be
          reading the room badly.
        */}
        {data.cancelToken && (
          <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
            Planovi se menjaju?{" "}
            <Link
              href={`/otkazivanje/${data.cancelToken}`}
              className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Otkaži rezervaciju
            </Link>{" "}
            — besplatno do {CANCELLATION_HOURS} sata pre termina. Termin te čeka i na
            ovoj stranici, na ovom telefonu.
          </p>
        )}

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

function endTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + 90;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
