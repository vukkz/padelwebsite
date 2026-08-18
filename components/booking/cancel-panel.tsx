"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CANCELLATION_HOURS, CLUB } from "@/lib/config";
import { forgetBooking } from "@/lib/own-bookings";
import { sentenceCase } from "@/lib/time";
import type { OwnBooking } from "@/lib/types";

/**
 * The cancellation screen reached from the link handed over at booking time.
 *
 * It shows the booking before it asks anything. A page that opens on "are you
 * sure?" with no detail is a page people close, and the one thing a player
 * needs to check first is that this link is for the court they think it is.
 */
export function CancelPanel({ booking }: { booking: OwnBooking }) {
  const [state, setState] = useState<"idle" | "sending" | "done">(
    booking.status === "cancelled" ? "done" : "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [alreadyGone] = useState(booking.status === "cancelled");

  async function cancel() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: booking.token }),
      });
      const data = await res.json();

      if (!res.ok && !data.alreadyCancelled) {
        setError(data.error ?? "Otkazivanje nije uspelo. Pokušajte ponovo.");
        setState("idle");
        return;
      }

      forgetBooking(booking.token);
      setState("done");
    } catch {
      setError("Nema veze sa serverom. Proverite internet i pokušajte ponovo.");
      setState("idle");
    }
  }

  const cancelled = state === "done";

  return (
    <div className="max-w-xl">
      <p className="eyebrow text-muted-foreground">
        {cancelled ? "Otkazano" : "Otkazivanje rezervacije"}
      </p>
      <h1 className="font-display mt-4 text-[2.1rem] text-foreground sm:text-[2.5rem]">
        {cancelled
          ? alreadyGone
            ? "Ova rezervacija je već otkazana."
            : "Termin je otkazan."
          : "Otkazati ovaj termin?"}
      </h1>

      <dl className="mt-10 rounded-sm border border-rule bg-card px-5 py-2">
        <Row label="Teren" value={booking.courtName} />
        <Row label="Datum" value={sentenceCase(booking.dateLabel)} />
        <Row label="Vreme" value={booking.timeRange} />
        <Row label="Na ime" value={booking.customerName} />
      </dl>

      {cancelled ? (
        <>
          <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
            {alreadyGone
              ? "Termin je slobodan za nove rezervacije."
              : "Termin je odmah oslobođen i klub je obavešten. Ne treba da zoveš."}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/rezervacija" className={buttonLink}>
              Rezerviši novi termin
            </Link>
            <Link href="/" className={quietLink}>
              Nazad na početnu
            </Link>
          </div>
        </>
      ) : booking.cancellable ? (
        <>
          <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
            Otkazivanje je besplatno — plaćanje ide na licu mesta, pa nema šta da se
            vraća. Termin odmah postaje slobodan za druge.
          </p>

          {error && (
            <p role="alert" className="mt-6 text-[15px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Button
              variant="destructive"
              size="lg"
              disabled={state === "sending"}
              onClick={cancel}
            >
              {state === "sending" ? "Otkazujem…" : "Da, otkaži termin"}
            </Button>
            <Link href="/rezervacija" className={quietLink}>
              Ne, zadrži termin
            </Link>
          </div>
        </>
      ) : (
        <>
          {/*
            Past the window. The policy is the club's, not a technical limit, so
            the page hands over the route that still works instead of leaving a
            disabled button and no explanation.
          */}
          <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
            Online otkazivanje se zatvara {CANCELLATION_HOURS} sata pre termina, pa ovaj
            više ne može da se otkaže ovde. Klub i dalje može da ga oslobodi — javi im se
            i reci da ne dolaziš, da neko drugi može da igra.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a href={CLUB.phoneHref} className={buttonLink}>
              Pozovi {CLUB.phone}
            </a>
            <Link href="/rezervacija" className={quietLink}>
              Nazad na termine
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const buttonLink =
  "inline-flex h-13 items-center rounded-sm bg-accent px-7 text-[15px] font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const quietLink =
  "text-sm text-muted-foreground underline decoration-rule underline-offset-[6px] transition-colors hover:text-foreground hover:decoration-foreground";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-[15px] font-medium text-foreground">{value}</dd>
    </div>
  );
}
