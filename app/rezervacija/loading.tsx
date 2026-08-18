import { Fragment } from "react";
import { SiteHeader } from "@/components/site-frame";

/**
 * Shown while the board is being fetched.
 *
 * This route is `force-dynamic` and awaits Supabase, so every arrival and every
 * date change costs a real round-trip. Without this file Next had nothing to
 * put on screen for that interval and the page simply held the previous view,
 * which is what made the date strip feel broken rather than slow.
 *
 * The skeleton is the board's own geometry — same header, same emerald block,
 * same 3.25rem/5.5rem time gutter, same six rows — so the real board lands in
 * place instead of shifting the page under a thumb that is already reaching for
 * a slot. Nothing here pulses: a shimmer on six rows of a timetable reads as
 * activity the server is not actually doing.
 */
export default function Loading() {
  return (
    <>
      <SiteHeader active="/rezervacija" />
      <main className="flex-1" aria-busy="true" aria-live="polite">
        <span className="sr-only">Učitavam termine…</span>

        <section className="bg-green text-cream">
          <div className="mx-auto max-w-[92rem] px-5 py-7 sm:px-8 sm:py-20">
            <h1 className="display text-[1.75rem] sm:text-[4.2rem]">Izaberi termin</h1>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-cream/85 sm:mt-6 sm:text-[16px]">
              Učitavam slobodne termine…
            </p>
          </div>
        </section>

        <div className="mx-auto w-full min-w-0 max-w-[92rem] px-4 pb-20 sm:px-6">
          <div className="-mx-5 border-b border-rule bg-cream px-5 pb-3 pt-4 sm:-mx-8 sm:px-8">
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[68px] w-[68px] shrink-0 rounded-sm border border-rule bg-card"
                />
              ))}
            </div>
          </div>

          <div className="rule-t mt-8 pt-7">
            <div className="h-7 w-56 rounded-sm bg-cream-deep sm:h-8" />
            <div className="mt-2.5 h-4 w-36 rounded-sm bg-cream-warm" />
          </div>

          <div className="mt-8 grid gap-1.5 [grid-template-columns:3.25rem_repeat(3,minmax(0,1fr))] md:gap-2 md:[grid-template-columns:5.5rem_repeat(3,minmax(0,1fr))]">
            <div />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`h${i}`} className="rule-t pb-3 pt-3">
                <div className="mx-auto h-3 w-14 rounded-sm bg-cream-deep" />
              </div>
            ))}
            {Array.from({ length: 6 }).map((_, row) => (
              <Fragment key={row}>
                <div className="flex flex-col items-end justify-center gap-1 pr-2">
                  <div className="h-3.5 w-9 rounded-sm bg-cream-deep" />
                  <div className="h-2.5 w-8 rounded-sm bg-cream-warm" />
                </div>
                {Array.from({ length: 3 }).map((_, col) => (
                  <div
                    key={col}
                    className="min-h-[62px] rounded-sm border border-rule bg-card"
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
