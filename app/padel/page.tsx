import Image from "next/image";
import type { Metadata } from "next";
import { CLUB, PRICES_RSD, SLOT_MINUTES, SLOT_START_TIMES } from "@/lib/config";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { PageHero } from "@/components/page-hero";
import { ActionLink } from "@/components/stamp-cta";

export const metadata: Metadata = {
  title: `Padel — ${CLUB.name} ${CLUB.city}`,
  description: `Tri terena sa reflektorima u šancu Beogradske tvrđave. Termini od ${SLOT_MINUTES} minuta, rezervacija online.`,
};

/**
 * Padel.
 *
 * Paced deliberately: photograph → schedule on cream → prices on emerald →
 * a wide court plate → what's included. The earlier version ran cream from the
 * hero to the footer with the numbers floating in it, which read as a
 * specification sheet rather than as part of the same venue.
 */
export default function PadelPage() {
  return (
    <>
      <SiteHeader active="/padel" overlay />
      <main className="flex-1">
        <Hero />
        <Schedule />
        <Prices />
        <Included />
      </main>
      <SiteFooter />
    </>
  );
}

/* ----------------------------------------------------------------- hero -- */

function Hero() {
  return (
    <PageHero
      label="Teren"
      title="Padel"
      lead={`Tri terena sa reflektorima, u šancu ispod bedema. Jedan termin traje ${SLOT_MINUTES} minuta i pokriva ceo teren — do četiri igrača, cena je za teren a ne po osobi.`}
      image="/photos/player-serve.jpg"
      alt="Igračica servira na terakota terenu ispred paviljona"
      crop="object-[50%_34%] lg:object-[50%_24%]"
    >
      <div className="rise mt-10" style={{ animationDelay: "300ms" }}>
        <ActionLink href="/rezervacija">Vidi slobodne termine</ActionLink>
      </div>

      <dl
        className="rise mt-12 flex gap-x-10 border-t border-cream/20 pt-8"
        style={{ animationDelay: "360ms" }}
      >
        <Stat k="3" v="terena" />
        <Stat k="6" v="termina dnevno" />
        <Stat k={`${SLOT_MINUTES}′`} v="po terminu" />
      </dl>
    </PageHero>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      {/* On-dark: this strip lives inside the hero photograph, not on cream. */}
      <dt className="tabular text-[1.6rem] font-semibold leading-none text-cream">
        {k}
      </dt>
      <dd className="label mt-2 text-cream/75">{v}</dd>
    </div>
  );
}

/* ------------------------------------------------------------- schedule -- */

/**
 * The timetable is the page's ornament rather than something decorated around,
 * so it gets a ground of its own and real weight instead of six hairline boxes
 * floating in the page.
 */
function Schedule() {
  return (
    <section className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-terracotta">Raspored</p>
          <h2 className="display mt-5 max-w-[16ch] text-[2.4rem] text-ink sm:text-[3.4rem]">
            Šest termina dnevno
          </h2>
        </div>
        <p className="max-w-[30ch] text-[15px] leading-relaxed text-ink-soft">
          Poslednji termin počinje u 15:30, pa kafe radi još sat vremena posle
          poslednjeg meča.
        </p>
      </div>

      <ol className="mt-14 grid grid-cols-2 border-y border-rule sm:grid-cols-3 lg:grid-cols-6">
        {SLOT_START_TIMES.map((t, i) => (
          <li
            key={t}
            className="group flex flex-col gap-4 border-rule px-2 py-10 not-last:border-r [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:last:border-r-0"
          >
            <span className="label text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="tabular text-[2rem] font-semibold leading-none text-ink sm:text-[2.4rem]">
              {t}
            </span>
            <span className="label text-ink-faint">{SLOT_MINUTES} min</span>
          </li>
        ))}
      </ol>

      {/* A wide plate of the court itself, so the schedule sits inside the
          place it describes rather than in an abstract cream field. */}
      <div className="relative mt-14 aspect-[21/9] overflow-hidden bg-cream-warm">
        <Image
          src="/photos/court-plaza.jpg"
          alt="Teren i plato kluba u šancu Beogradske tvrđave"
          fill
          sizes="(max-width: 1400px) 100vw, 88rem"
          className="object-cover"
        />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- prices -- */

/** On emerald, so the page has three volumes rather than one flat cream run. */
function Prices() {
  const rows = [
    {
      tier: "Radnim danima",
      when: "Ponedeljak – petak",
      price: PRICES_RSD.offPeak,
    },
    { tier: "Vikend", when: "Subota i nedelja", price: PRICES_RSD.peak },
  ];

  return (
    <section className="bg-green text-cream">
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
        <p className="label text-cream/90">Cene</p>
        <h2 className="display mt-5 max-w-[14ch] text-[2.4rem] sm:text-[3.4rem]">
          Ceo teren, ne po igraču
        </h2>

        <div className="mt-16 grid gap-x-8 gap-y-12 border-t border-cream/25 pt-12 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.tier} className="flex flex-col gap-4">
              <span className="label text-cream/90">{r.tier}</span>
              <span className="tabular text-[3.6rem] font-semibold leading-none sm:text-[5rem]">
                {r.price.toLocaleString("sr-RS")}
                <span className="label ml-4 align-middle text-cream/90">rsd</span>
              </span>
              <span className="text-[15px] text-cream/85">
                {r.when} · {SLOT_MINUTES} min · do 4 igrača
              </span>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-t border-cream/25 pt-8">
          <p className="text-[15px] text-cream/85">
            Plaćanje na licu mesta · otkazivanje bez naknade do 4 sata pre termina
          </p>
          {/*
            PRODUCT.md records these figures as a market estimate rather than the
            club's price list, and requires unconfirmed facts to stay visibly
            unconfirmed. They are the largest numerals on the page.
          */}
          <p className="label text-cream/90">Predlog cenovnika — potvrđuje klub</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- included -- */

/**
 * What used to be a row of letterspaced keywords — "Teren 1 · Teren 2 · Teren 3
 * · Reflektori · Iznajmljivanje reketa" — said as sentences instead. The list
 * filled the space and told a first-timer nothing they could act on.
 */
function Included() {
  const items = [
    {
      title: "Tri terena",
      text: "Sva tri su spoljna, sa reflektorima — večernji termini rade i kad padne mrak.",
    },
    {
      title: "Oprema na licu mesta",
      text: "Reketi i loptice se iznajmljuju u klubu. Ne moraš ništa da nosiš sa sobom.",
    },
    {
      title: "Do četiri igrača",
      text: `Termin od ${SLOT_MINUTES} minuta pokriva ceo teren, pa cena ostaje ista i za dvoje i za četvoro.`,
    },
  ];

  return (
    <section className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 className="display max-w-[12ch] text-[2.2rem] text-ink sm:text-[2.8rem]">
            Šta je uključeno
          </h2>
          <ActionLink href="/rezervacija" className="mt-10">
            Rezerviši termin
          </ActionLink>
        </div>

        <dl className="lg:col-span-8">
          {items.map((it) => (
            <div
              key={it.title}
              className="grid gap-x-8 gap-y-2 border-t border-rule py-7 sm:grid-cols-12"
            >
              <dt className="text-[1.05rem] font-semibold text-ink sm:col-span-4">
                {it.title}
              </dt>
              <dd className="text-[15px] leading-relaxed text-ink-soft sm:col-span-8">
                {it.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
