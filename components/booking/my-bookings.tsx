"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CLUB, CANCELLATION_HOURS } from "@/lib/config";
import { forgetBooking, loadOwnBookings } from "@/lib/own-bookings";
import { sentenceCase } from "@/lib/time";
import type { OwnBooking } from "@/lib/types";

/**
 * The bookings this device made, on the page where they matter.
 *
 * Renders nothing at all until the device is holding a token, so the first-time
 * visitor — most visitors — sees the board exactly as before. For everyone else
 * it answers "do I already have a court?" above the grid, which is also the
 * cheapest way to stop somebody booking a second slot they did not mean to.
 *
 * Confirmation is inline rather than a `confirm()` or a modal: releasing a court
 * needs a second look, not an interruption, and the row that is about to change
 * should stay visible while the question is asked.
 */
export function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<OwnBooking[] | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;

    // All of it inside the callback, including the localStorage read: settling
    // state synchronously in an effect body cascades a second render before
    // paint, for a block that is empty for most visitors anyway.
    (async () => {
      const stored = loadOwnBookings();
      if (stored.length === 0) {
        if (live) setBookings([]);
        return;
      }

      try {
        const res = await fetch("/api/bookings/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokens: stored.map((b) => b.token) }),
        });
        const data = await res.json();
        if (live) setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch {
        // Offline, or the lookup failed. The board below is the page's job;
        // this block simply does not appear.
        if (live) setBookings([]);
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  const cancel = useCallback(
    async (booking: OwnBooking) => {
      setBusy(booking.token);
      setFailed((f) => ({ ...f, [booking.token]: "" }));
      try {
        const res = await fetch("/api/bookings/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: booking.token }),
        });
        const data = await res.json();

        if (!res.ok && !data.alreadyCancelled) {
          setFailed((f) => ({
            ...f,
            [booking.token]: data.error ?? "Otkazivanje nije uspelo. Pokušajte ponovo.",
          }));
          return;
        }

        // Either we cancelled it or it was already cancelled; both mean this
        // device has no further business holding the token.
        forgetBooking(booking.token);
        setDone((d) => ({
          ...d,
          [booking.token]: data.alreadyCancelled
            ? "Ova rezervacija je već otkazana."
            : "Termin je otkazan i ponovo je slobodan.",
        }));
        // The grid below is showing this slot as taken. Put it back.
        router.refresh();
      } catch {
        setFailed((f) => ({
          ...f,
          [booking.token]: "Nema veze sa serverom. Proverite internet i pokušajte ponovo.",
        }));
      } finally {
        setBusy(null);
        setConfirming(null);
      }
    },
    [router],
  );

  // Nothing stored, nothing resolved, or everything already past.
  if (!bookings || bookings.length === 0) return null;

  return (
    <section className="rule-t mt-8 pt-7" aria-labelledby="own-bookings-title">
      <h2 id="own-bookings-title" className="font-display text-[1.35rem] text-foreground">
        Tvoje rezervacije
      </h2>
      <p className="mt-1.5 text-[15px] text-muted-foreground">
        Sačuvane na ovom uređaju. Otkazivanje je besplatno do {CANCELLATION_HOURS} sata
        pre termina.
      </p>

      <ul className="mt-5 space-y-3">
        {bookings.map((b) => {
          const message = done[b.token];
          const error = failed[b.token];
          const isConfirming = confirming === b.token;
          const isBusy = busy === b.token;

          return (
            <li
              key={b.token}
              className="rounded-sm border border-rule bg-card px-4 py-3.5 sm:px-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className={message ? "text-muted-foreground" : undefined}>
                  <p className="font-display text-[1.1rem] text-foreground">
                    {b.courtName}
                    <span className="tabular ml-2 font-normal text-muted-foreground">
                      {b.timeRange}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {sentenceCase(b.dateLabel)}
                  </p>
                </div>

                {/*
                  Absent rather than disabled once the window has closed. A
                  greyed-out button is a dead end that still looks like a
                  control; the sentence below says what happened and the phone
                  number is a live link. Same call the /otkazivanje page makes.
                */}
                {!message && !isConfirming && b.cancellable && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Otkaži rezervaciju — ${b.courtName}, ${b.dateLabel}, ${b.timeRange}`}
                    onClick={() => setConfirming(b.token)}
                  >
                    Otkaži
                  </Button>
                )}

                {!message && isConfirming && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => cancel(b)}
                    >
                      {isBusy ? "Otkazujem…" : "Da, otkaži"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => setConfirming(null)}
                    >
                      Odustani
                    </Button>
                  </div>
                )}
              </div>

              {/*
                The window has closed on this one. Say so where the button was,
                and give the only route that still works — the club's phone is
                the fallback the whole token design already leans on.
              */}
              {!b.cancellable && !message && (
                <p className="mt-2.5 text-sm text-muted-foreground">
                  Online otkazivanje je zatvoreno. Pozovi{" "}
                  <a
                    href={CLUB.phoneHref}
                    className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    {CLUB.phone}
                  </a>
                  .
                </p>
              )}

              <p aria-live="polite" className="empty:hidden">
                {message && (
                  <span className="mt-2.5 block text-sm font-semibold text-primary">
                    {message}
                  </span>
                )}
                {error && (
                  <span className="mt-2.5 block text-sm font-semibold text-destructive">
                    {error}
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
