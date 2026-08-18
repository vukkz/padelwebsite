"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CANCELLATION_HOURS } from "@/lib/config";
import { sentenceCase } from "@/lib/time";
import type { PublicSlotCell } from "@/lib/types";
import type { BoardCourt } from "./booking-board";

export type BookingSuccess = {
  courtName: string;
  dateLabel: string;
  timeRange: string;
  priceLabel: string;
  customerName: string;
  /** The only copy of the cancellation credential the player will ever get. */
  cancelToken: string;
  startsAt: string;
};

type Errors = { name?: string; phone?: string };

/**
 * Tab stops inside the panel. `:not([disabled])` matters here rather than being
 * boilerplate: a 409 disables both inputs and swaps the submit button out, so
 * the set this returns changes shape mid-dialog.
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * What to offer someone whose slot was taken while they were typing.
 *
 * Same time on another court first — that is the constraint most people came
 * with — then the nearest free time on the court they picked. Both are already
 * in memory: the board refreshes behind the sheet on a 409, so this reads the
 * post-collision truth, not the board they clicked.
 */
function alternativesFor(courts: BoardCourt[], cell: PublicSlotCell) {
  const out: { cell: PublicSlotCell; courtName: string; note: string }[] = [];

  for (const c of courts) {
    if (c.id === cell.courtId) continue;
    const sameTime = c.cells.find(
      (x) => x.time === cell.time && x.status === "free" && x.startsAt !== cell.startsAt,
    );
    if (sameTime) out.push({ cell: sameTime, courtName: c.name, note: "isto vreme" });
  }

  const own = courts.find((c) => c.id === cell.courtId);
  const rowIdx = own?.cells.findIndex((x) => x.startsAt === cell.startsAt) ?? -1;
  if (own && rowIdx >= 0) {
    let best: PublicSlotCell | null = null;
    let bestDistance = Infinity;
    own.cells.forEach((x, i) => {
      // Never the slot that just failed. The board refreshes behind the sheet
      // on a 409, but that is a round-trip we do not wait for — until it lands
      // this cell still reads `free`, and offering it back would send the
      // visitor straight into the collision they are recovering from.
      if (i === rowIdx || x.status !== "free") return;
      const d = Math.abs(i - rowIdx);
      if (d < bestDistance) {
        bestDistance = d;
        best = x;
      }
    });
    if (best) out.push({ cell: best, courtName: own.name, note: "isti teren" });
  }

  return out.slice(0, 3);
}

export function BookingSheet({
  cell,
  courtName,
  dateLabel,
  courts,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onPickAlternative,
  onClose,
  onSuccess,
  onConflict,
}: {
  cell: PublicSlotCell;
  courtName: string;
  dateLabel: string;
  /** The refreshed board, so a collision can offer a way out instead of an instruction. */
  courts: BoardCourt[];
  /*
    Name and phone live in the board, not here.

    A 409 used to unmount this component, and the two fields the visitor had
    just typed went with it — on a phone, re-typing a full name and a number is
    most of the cost of booking, and the collision is the system's event, not
    theirs. Held one level up, the draft survives the sheet closing, the slot
    changing, and a second booking in the same sitting.
  */
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onPickAlternative: (cell: PublicSlotCell, courtName: string) => void;
  onClose: () => void;
  onSuccess: (data: BookingSuccess) => void;
  onConflict: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [taken, setTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  // The parent passes `onClose={() => setSelection(null)}` — a new identity on
  // every render. Read it through a ref so the effects below can key on [] and
  // mean it.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  /*
    The whole modal lifecycle, in one effect because the steps are ordered and
    the order is not obvious.

    Opening: remember who opened us, lock the page behind — no scrolling under
    the thumb, nothing reachable by Tab or by a screen reader's browse mode —
    and take focus. `inert` is what makes this a modal rather than a panel that
    merely looks like one: without it, tabbing past "Potvrdi rezervaciju" put a
    keyboard user silently into the 18-button slot grid behind the overlay,
    still able to book a different court through a dialog they could not see.

    Closing: un-inert *before* restoring focus. Split across two effects, React
    runs the cleanups in declaration order, and a restore that fires while the
    background is still inert is refused by the browser — focus drops to <body>
    and the caret vanishes. Measured exactly that before merging them.

    Once, not per render. This used to share an effect with the key listener
    keyed on `[onClose]`, and the parent passes a fresh closure every time, so a
    `router.refresh()` after a 409 re-ran it and yanked focus back into the name
    field while the user was typing their phone number.
  */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = rootRef.current;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    const behind = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert"),
    );
    behind.forEach((el) => el.setAttribute("inert", ""));

    nameRef.current?.focus();

    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = prevOverflow;
      // On the success path the board unmounts with the sheet, so the slot
      // button that opened it is gone. SuccessScreen takes focus instead.
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  /*
    Escape, and a Tab cycle within the panel.

    `inert` alone would stop Tab escaping, but it would hand focus to the
    browser chrome at each end rather than wrapping, and it cannot recover the
    case where focus has already been dropped: when a 409 disables both inputs
    and replaces the submit button, the focused element is unmounted and focus
    falls to <body>. Hence the listener is on the document, in the capture
    phase, and treats "outside the panel" as a position to pull back from.
  */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const stops = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
      );
      if (stops.length === 0) {
        e.preventDefault();
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];
      const inside = panel.contains(document.activeElement);

      if (e.shiftKey && (!inside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, []);

  /*
    A failure from the server is the one thing here that a keyboard or screen
    reader user has no other way to notice — and on a 409 it also drops focus,
    per above. Move to the alert: it is read out, and the recovery button is the
    next stop from there.
  */
  useEffect(() => {
    if (formError) alertRef.current?.focus();
  }, [formError]);

  function validate(): boolean {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Unesi ime i prezime.";
    // Serbian mobile: 06x followed by 6–7 digits, spaces/dashes tolerated.
    const digits = phone.replace(/[^\d+]/g, "");
    if (!/^(\+3816|06)\d{7,8}$/.test(digits)) {
      next.phone = "Unesi broj telefona u formatu 06X XXX XXXX.";
    }
    setErrors(next);
    // Focus the first field that failed. `aria-invalid` on its own changes
    // nothing a screen reader announces, and on a phone the offending field is
    // often behind the keyboard by the time the user submits.
    if (next.name) nameRef.current?.focus();
    else if (next.phone) phoneRef.current?.focus();
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: cell.courtId,
          startsAt: cell.startsAt,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Someone booked this exact slot while the form was open. The database
        // rejected our insert — that's the constraint doing its job.
        setTaken(true);
        setFormError(data.error ?? "Termin je upravo rezervisan.");
        onConflict();
        return;
      }

      if (!res.ok) {
        setFormError(data.error ?? "Došlo je do greške. Pokušaj ponovo.");
        return;
      }

      onSuccess({
        courtName: data.courtName,
        dateLabel: data.dateLabel,
        timeRange: data.timeRange,
        priceLabel: data.priceLabel,
        customerName: name.trim(),
        cancelToken: data.cancelToken,
        startsAt: data.startsAt,
      });
    } catch {
      setFormError("Nema veze sa serverom. Proveri internet i pokušaj ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  const timeRange = `${cell.time} – ${endTime(cell.time)}`;
  const alternatives = taken ? alternativesFor(courts, cell) : [];

  const sheet = (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/*
        Pointer-only dismissal, deliberately outside the accessibility tree.

        It was a real `<button aria-label="Zatvori">` covering the viewport, so
        every sheet announced "Zatvori" twice and spent a tab stop on a control
        that duplicates the X. Escape and the X are the keyboard routes; this is
        just the tap-outside gesture.
      */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-green-950/50 backdrop-blur-[2px]"
      />

      {/*
        The dialog is the panel, not the panel plus its backdrop — the role sat
        on the container above, which meant the backdrop button counted as
        dialog content.

        The rise-from-the-bottom animation is the platform sheet idiom on a
        phone; on desktop the same panel is centred, so it would be sliding in
        from nowhere. Gate the motion to the breakpoint that earns it.
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={cn(
          "animate-sheet-up relative w-full max-w-md rounded-t-lg border border-rule bg-card",
          "sm:animate-fade-in sm:rounded-sm",
          "max-h-[92vh] overflow-y-auto",
        )}
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        {/* Drag affordance — mirrors the platform sheet idiom on mobile. */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <h2 id="sheet-title" className="font-display text-[1.6rem]">
              Rezervacija termina
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{sentenceCase(dateLabel)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="-mr-1 -mt-1 flex size-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mx-5 mt-5 flex items-baseline justify-between gap-3 border-y border-rule py-4">
          <div>
            <p className="font-display text-[1.35rem] text-foreground">{courtName}</p>
            <p className="tabular mt-0.5 text-sm text-muted-foreground">{timeRange}</p>
          </div>
          <p className="font-display tabular text-[1.75rem] text-clay-500">
            {cell.priceRsd.toLocaleString("sr-RS")}
            <span className="eyebrow ml-1.5 align-middle text-muted-foreground">rsd</span>
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 px-5 pb-5 pt-5" noValidate>
          {formError && (
            <div
              role="alert"
              ref={alertRef}
              tabIndex={-1}
              className={cn(
                "flex items-start gap-2.5 rounded-sm px-3.5 py-3 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                taken
                  ? "bg-warning-soft text-warning"
                  : "bg-destructive-soft text-destructive",
              )}
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{formError}</p>
                {taken && (
                  <p className="mt-0.5 opacity-90">
                    {alternatives.length > 0
                      ? "Ovo je slobodno umesto njega — tvoji podaci ostaju upisani."
                      : "Ovaj dan je popunjen. Probaj sledeći iz trake sa datumima."}
                  </p>
                )}
              </div>
            </div>
          )}

          <Field
            label="Ime i prezime"
            htmlFor="name"
            required
            error={errors.name}
            hint="Na ovo ime se vodi termin."
          >
            <Input
              id="name"
              ref={nameRef}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              autoComplete="name"
              enterKeyHint="next"
              maxLength={60}
              disabled={taken}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : "name-hint"}
              placeholder="Marko Petrović"
            />
          </Field>

          <Field
            label="Telefon"
            htmlFor="phone"
            required
            error={errors.phone}
            hint="Klub te zove samo ako nešto iskrsne sa terminom."
          >
            <Input
              id="phone"
              ref={phoneRef}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              autoComplete="tel"
              enterKeyHint="done"
              maxLength={20}
              disabled={taken}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
              placeholder="064 123 4567"
            />
          </Field>

          {taken ? (
            /*
              A route, not an instruction.

              This used to be one button that closed the sheet and told the
              visitor to go find another slot themselves — at the highest-drop-off
              moment in the product, having just thrown away what they typed.
              The board behind has already refreshed, so the answer is in memory:
              offer it, keep the draft, and let them finish in the same panel.
            */
            <div className="space-y-2">
              {alternatives.map((alt) => (
                <button
                  key={`${alt.courtName}-${alt.cell.startsAt}`}
                  type="button"
                  onClick={() => onPickAlternative(alt.cell, alt.courtName)}
                  className="flex min-h-[60px] w-full items-center justify-between gap-3 rounded-sm border border-rule bg-card px-4 py-3 text-left transition-colors hover:border-clay-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="min-w-0">
                    <span className="font-display block text-[1.1rem] text-foreground">
                      {alt.courtName}
                    </span>
                    <span className="tabular mt-0.5 block text-sm text-muted-foreground">
                      {alt.cell.time} – {endTime(alt.cell.time)} · {alt.note}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-[15px] font-semibold text-foreground">
                    {alt.cell.priceRsd.toLocaleString("sr-RS")}
                    <span className="eyebrow ml-1.5 text-muted-foreground">rsd</span>
                  </span>
                </button>
              ))}
              <Button
                variant={alternatives.length > 0 ? "ghost" : "primary"}
                size="lg"
                className="w-full"
                onClick={onClose}
              >
                {alternatives.length > 0 ? "Nazad na raspored" : "Izaberi drugi termin"}
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Rezervišem…
                </>
              ) : (
                `Potvrdi rezervaciju · ${cell.priceRsd.toLocaleString("sr-RS")} RSD`
              )}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Plaćanje na licu mesta. Otkazivanje najkasnije {CANCELLATION_HOURS} sata pre
            termina, sa linka koji dobijaš odmah posle rezervacije.
          </p>
        </form>
      </div>
    </div>
  );

  /*
    Portalled to <body> for two reasons. `inert` on the background is then just
    "every other child of body" instead of a walk up the board's ancestors
    inerting siblings at each level; and a `position: fixed` overlay nested in
    the page is one `transform` or `filter` on an ancestor away from being
    clipped into it. The sheet is already `fixed inset-0 z-50`, so nothing about
    how it renders changes.
  */
  return typeof document === "undefined" ? null : createPortal(sheet, document.body);
}

function endTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + 90;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
