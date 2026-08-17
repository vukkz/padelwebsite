"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { sentenceCase } from "@/lib/time";
import type { PublicSlotCell } from "@/lib/types";

export type BookingSuccess = {
  courtName: string;
  dateLabel: string;
  timeRange: string;
  priceLabel: string;
  customerName: string;
};

type Errors = { name?: string; phone?: string };

export function BookingSheet({
  cell,
  courtName,
  dateLabel,
  onClose,
  onSuccess,
  onConflict,
}: {
  cell: PublicSlotCell;
  courtName: string;
  dateLabel: string;
  onClose: () => void;
  onSuccess: (data: BookingSuccess) => void;
  onConflict: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [taken, setTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Stop the page behind the sheet from scrolling under the user's thumb.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function validate(): boolean {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Unesite ime i prezime.";
    // Serbian mobile: 06x followed by 6–7 digits, spaces/dashes tolerated.
    const digits = phone.replace(/[^\d+]/g, "");
    if (!/^(\+3816|06)\d{7,8}$/.test(digits)) {
      next.phone = "Unesite broj telefona u formatu 06X XXX XXXX.";
    }
    setErrors(next);
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
        setFormError(data.error ?? "Došlo je do greške. Pokušajte ponovo.");
        return;
      }

      onSuccess({
        courtName: data.courtName,
        dateLabel: data.dateLabel,
        timeRange: data.timeRange,
        priceLabel: data.priceLabel,
        customerName: name.trim(),
      });
    } catch {
      setFormError("Nema veze sa serverom. Proverite internet i pokušajte ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  const timeRange = `${cell.time} – ${endTime(cell.time)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <button
        type="button"
        aria-label="Zatvori"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-green-950/50 backdrop-blur-[2px]"
      />

      {/*
        The rise-from-the-bottom animation is the platform sheet idiom on a
        phone; on desktop the same panel is centred, so it would be sliding in
        from nowhere. Gate the motion to the breakpoint that earns it.
      */}
      <div
        ref={panelRef}
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
              className={cn(
                "flex items-start gap-2.5 rounded-sm px-3.5 py-3 text-sm",
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
                    Zatvorite i izaberite drugi termin — lista je osvežena.
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
              onChange={(e) => setName(e.target.value)}
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
            hint="Klub vas zove samo ako nešto iskrsne sa terminom."
          >
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
              Izaberi drugi termin
            </Button>
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
            Plaćanje na licu mesta. Otkazivanje najkasnije 4 sata pre termina.
          </p>
        </form>
      </div>
    </div>
  );
}

function endTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + 90;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
