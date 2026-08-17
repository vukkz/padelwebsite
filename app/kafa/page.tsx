import Image from "next/image";
import type { Metadata } from "next";
import { CLUB, REVIEWS } from "@/lib/config";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { PageHero } from "@/components/page-hero";
import { InstagramIcon } from "@/components/icons/instagram";

export const metadata: Metadata = {
  title: `Kafa i doručak — ${CLUB.name} ${CLUB.city}`,
  description:
    "Specialty kafa i kroasani na terasi u šancu Beogradske tvrđave. Bez rezervacije, svakog dana 08–18.",
};

const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CLUB.mapsQuery)}`;

/**
 * Kafa — the surface the original site never had.
 *
 * Every real review praises the coffee and the setting, and the old build gave
 * that audience nothing to press. There is no booking action anywhere on this
 * page: nobody reserves a coffee, and the venue's own copy says nobody has to
 * play to sit down. All six reviews live here, because this is the claim they
 * actually evidence.
 */
export default function KafaPage() {
  return (
    <>
      <SiteHeader active="/kafa" />
      <main className="flex-1">
        {/*
          The pavilion frame, not the terrace one. `terrace.jpg` is a 1080px
          crop showing two chairs and a stretch of painted floor — it never
          answered "what is this café like". This shows the pavilion, the
          terrace seating and the whole lounge lawn under the rampart, from a
          2268×4032 original.
        */}
        <PageHero
          label="Bez rezervacije"
          title="Niko ne mora da igra"
          lead="Specialty kafa i kroasani na terasi između terena i bedema. Mirno, čisto, sa decom i psima. Teren je tu, ali niko ne mora da igra da bi seo na terasu."
          image="/photos/hero-cafe.jpg"
          alt="Paviljon kafea, terasa i ležaljke na travnjaku ispod bedema"
          objectPosition="46% 62%"
        >
          {/*
            These facts come from real reviews and are worth stating, but as a
            row of letterspaced labels they read as keyword filler. As a
            sentence they read as the place describing itself.
          */}
          <p
            className="rise mt-6 max-w-[44ch] text-[16px] leading-relaxed text-ink-soft"
            style={{ animationDelay: "300ms" }}
          >
            Parking je u blizini, deca i psi su dobrodošli, kroasani stižu od jutra.
            Otvoreno svakog dana od 08 do 18.
          </p>
        </PageHero>

        <section className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h2 className="display max-w-[14ch] text-[2.8rem] text-ink sm:text-[4.5rem]">
              Ostaju zbog kafe
            </h2>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer noopener"
              className="label inline-flex min-h-11 items-center text-ink-soft underline decoration-rule underline-offset-[8px] transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
            >
              {CLUB.rating.score} · {CLUB.rating.count} recenzija · {CLUB.rating.source} →
            </a>
          </div>

          <ul className="mt-16 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <li key={r.author} className="flex flex-col border-t border-rule pt-7">
                <blockquote
                  lang={r.lang}
                  className="text-[1.0625rem] leading-[1.6] text-ink"
                >
                  “{r.quote}”
                </blockquote>
                <footer className="label mt-auto pt-7 text-ink-soft">
                  {r.author}
                  <span className="mt-2 block normal-case tracking-normal text-ink-faint">
                    {r.meta}
                  </span>
                </footer>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-green text-cream">
          <div className="mx-auto grid max-w-[88rem] items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="display max-w-[14ch] text-[2.4rem] sm:text-[3.2rem]">
                Dnevni meni je na Instagramu
              </h2>
              <p className="mt-7 max-w-[40ch] text-[16px] leading-relaxed text-cream/80">
                Ponuda se menja — kroasani, filter i espresso, sezonski dodaci.
                Najsvežije stanje uvek stoji na profilu kluba.
              </p>
              <a
                href={CLUB.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-10 inline-flex min-h-14 items-center gap-3 bg-cream px-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-4 focus-visible:ring-offset-green"
              >
                <InstagramIcon className="size-4" />
                {CLUB.instagramHandle}
              </a>
            </div>
            <div className="relative aspect-[4/3] lg:col-span-7">
              <Image
                src="/photos/drinks.jpg"
                alt="Piće i kafa na stolu na terasi kluba"
                fill
                sizes="(max-width: 1024px) 92vw, 58vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
