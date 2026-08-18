"use client";

import { useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-frame";
import { CLUB } from "@/lib/config";

/**
 * Shown when the board cannot be fetched.
 *
 * There was no error boundary anywhere in `app/`, so a Supabase outage handed
 * the visitor Next's default error screen — on the one route where a working
 * fallback exists and is one import away. The club answers its phone; the whole
 * product exists to make that call unnecessary, not impossible.
 *
 * So this is not an apology page. It names what failed, offers the two things
 * that still work (call, try again), and states the hours so nobody rings a
 * closed venue. `reset()` re-runs the server component, which is the right
 * first move when the cause is a dropped connection rather than a bad request.
 */
export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side cause; without it a
    // production report is just "something failed on /rezervacija".
    console.error("[rezervacija]", error.digest ?? error.message);
  }, [error]);

  return (
    <>
      <SiteHeader active="/rezervacija" />
      <main className="flex-1">
        <section className="bg-green text-cream">
          <div className="mx-auto max-w-[92rem] px-5 py-7 sm:px-8 sm:py-20">
            <h1 className="display text-[1.75rem] sm:text-[4.2rem]">
              Termini trenutno nisu dostupni
            </h1>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-cream/85 sm:mt-6 sm:text-[16px]">
              Ne možemo da učitamo raspored — problem je kod nas, ne kod tebe.
              Tvoje postojeće rezervacije nisu ugrožene.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[92rem] px-4 pb-24 sm:px-6">
          <div className="rule-t mt-8 max-w-xl pt-7">
            <p className="text-[16px] leading-relaxed text-ink-soft">
              Pokušaj ponovo za trenutak. Ako i dalje ne radi, klub prima
              rezervacije telefonom — termin ti mogu upisati odmah.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center bg-terracotta px-6 text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-terracotta-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
              >
                Pokušaj ponovo
              </button>
              <a
                href={CLUB.phoneHref}
                className="inline-flex min-h-11 items-center text-[16px] font-semibold text-ink underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
              >
                {CLUB.phone}
              </a>
            </div>

            <p className="label mt-10 text-ink-faint">
              {CLUB.hoursLabel} · {CLUB.hoursNote}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
