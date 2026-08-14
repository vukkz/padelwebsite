import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Phone, Star } from "lucide-react";
import {
  CLUB,
  EVENT_TYPES,
  GOOD_TO_KNOW,
  PRICES_RSD,
  REVIEWS,
  SLOT_MINUTES,
  SLOT_START_TIMES,
} from "@/lib/config";
import { InstagramIcon } from "@/components/icons/instagram";
import { cn } from "@/lib/utils";

const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(CLUB.mapsQuery)}&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CLUB.mapsQuery)}`;

export default function LandingPage() {
  return (
    <>
      <TopBar />
      <main className="flex-1">
        <Hero />
        <Manifesto />
        <TriStvari />
        <Recenzije />
        <Dogadjaji />
        <Cene />
        <Lokacija />
        <Zatvaranje />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}

/* ------------------------------------------------------------------ nav -- */

function TopBar() {
  const links = [
    { href: "#klub", label: "Klub" },
    { href: "#dogadjaji", label: "Događaji" },
    { href: "#cene", label: "Cene" },
    { href: "#lokacija", label: "Lokacija" },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex h-20 max-w-[86rem] items-center gap-8 px-5 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-display text-[1.35rem] text-white">Padel House</span>
          <span className="eyebrow hidden text-white/40 sm:inline">Beograd</span>
        </Link>

        <div className="ml-auto flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="eyebrow hidden text-white/75 transition-colors hover:text-white lg:inline"
            >
              {l.label}
            </a>
          ))}
          <a
            href={CLUB.phoneHref}
            className="eyebrow flex items-center gap-1.5 text-white/75 transition-colors hover:text-white"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            <span className="hidden md:inline">{CLUB.phone}</span>
            <span className="md:hidden">Pozovi</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

/* ----------------------------------------------------------------- hero -- */

function Hero() {
  return (
    <section className="relative isolate flex min-h-[94svh] flex-col overflow-hidden bg-green-950">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/photos/fortress-court.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover object-[58%_52%]"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-green-950 via-green-950/60 to-green-950/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-green-950/80 via-green-950/20 to-transparent"
      />
      {/* Top scrim: the sky in this photo is bright, and white nav links sat on
          it at roughly 1.4:1. This carries them to a legible contrast without
          putting a solid bar over the photograph. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-green-950/85 to-transparent"
      />

      <div className="mx-auto flex w-full max-w-[86rem] flex-1 flex-col justify-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16">
        <p className="reveal eyebrow text-clay-300" style={{ animationDelay: "80ms" }}>
          Kalemegdan · Beograd
        </p>

        {/* Their own campaign line. Nothing we'd write beats it. */}
        <h1
          className="reveal font-display mt-6 max-w-[14ch] text-[3.5rem] text-white sm:text-7xl lg:text-[6rem]"
          style={{ animationDelay: "160ms" }}
        >
          Nije samo <em className="not-italic text-clay-300">padel</em>.
        </h1>

        <div
          className="reveal mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"
          style={{ animationDelay: "260ms" }}
        >
          <p className="max-w-md text-[15px] leading-relaxed text-white/70">
            Teren u šancu Beogradske tvrđave, specialty kafa na terasi i prostor za sve što
            dolazi posle meča. Rezervacija online — bez poziva i bez čekanja.
          </p>

          <div className="flex items-center gap-6">
            <CtaButton href="/rezervacija">Rezerviši termin</CtaButton>
            <a
              href="#dogadjaji"
              className="text-sm whitespace-nowrap text-white/60 underline decoration-white/25 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white/60"
            >
              Događaji
            </a>
          </div>
        </div>

        <dl
          className="reveal mt-12 grid grid-cols-2 gap-6 border-t border-white/12 pt-6 sm:grid-cols-4"
          style={{ animationDelay: "360ms" }}
        >
          {[
            { k: "3", v: "terena" },
            { k: String(SLOT_START_TIMES.length), v: "termina dnevno" },
            { k: "08–18", v: "svakog dana" },
            { k: CLUB.rating.score, v: `${CLUB.rating.source} ocena`, star: true },
          ].map((s) => (
            <div key={s.v}>
              <dt className="font-display tabular flex items-center gap-1.5 text-3xl text-white sm:text-4xl">
                {s.k}
                {s.star && (
                  <Star
                    className="size-4 fill-clay-300 text-clay-300"
                    aria-hidden="true"
                  />
                )}
              </dt>
              <dd className="mt-1.5 text-[13px] text-white/45">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ manifesto -- */

function Manifesto() {
  return (
    <section id="klub" className="scroll-mt-8">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <p className="eyebrow pt-3 text-muted-foreground lg:col-span-3">Klub</p>
          <div className="lg:col-span-9">
            <p className="font-display max-w-[20ch] text-[2.1rem] leading-[1.1] text-foreground sm:text-[3.2rem]">
              Padel je izgovor. Ostajanje posle meča je poenta.
            </p>
            <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Nalazimo se u šancu Beogradske tvrđave — između bedema iz 18. veka i zelene
              zone Kalemegdana. Isti prostor u toku dana radi kao teren i kafe, a uveče kao
              bašta, bioskop na otvorenom ili sala za venčanje.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- tri stvari -- */

function TriStvari() {
  const items = [
    {
      n: "01",
      title: "Padel",
      text: "Tri terena sa reflektorima, termini od 90 minuta. Reketi i loptice se iznajmljuju na licu mesta.",
      img: "/photos/player-serve.jpg",
      alt: "Igračica servira na terakota terenu ispred paviljona",
      ratio: "aspect-[4/5]",
    },
    {
      n: "02",
      title: "Kafa i doručak",
      text: "Specialty kafa i kroasani na terasi između terena i bedema — mirno, čisto, sa decom i psima. Deo gostiju dolazi samo zbog ovoga.",
      img: "/photos/terrace.jpg",
      alt: "Terasa kafea sa stolovima na oslikanom platou",
      ratio: "aspect-[4/5]",
    },
    {
      n: "03",
      title: "Događaji",
      text: "Venčanja, firmske proslave i projekcije utakmica ispod osvetljenog bedema tvrđave.",
      img: "/photos/cinema-night.jpg",
      alt: "Projekcija utakmice uz osvetljeni bedem tvrđave",
      ratio: "aspect-[4/5]",
    },
  ];

  return (
    <section className="border-t border-rule">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-3">
          {items.map((it) => (
            <article key={it.n}>
              <div className={cn("relative overflow-hidden rounded-sm bg-muted", it.ratio)}>
                <Image
                  src={it.img}
                  alt={it.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, 30vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
              <div className="mt-5 grid grid-cols-[2.25rem_1fr] gap-x-4">
                <span className="font-display tabular pt-1 text-sm text-clay-500">{it.n}</span>
                <div>
                  <h3 className="font-display text-[1.6rem] text-foreground">{it.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {it.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ recenzije -- */

function Recenzije() {
  return (
    <section className="border-t border-rule bg-muted/40">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-muted-foreground">Recenzije</p>
            <h2 className="font-display mt-4 max-w-[14ch] text-[2.1rem] text-foreground sm:text-[2.5rem]">
              Ostaju zbog kafe.
            </h2>

            <div className="mt-7 flex items-center gap-3">
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-clay-500 text-clay-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="tabular font-semibold text-foreground">
                  {CLUB.rating.score}
                </span>{" "}
                na {CLUB.rating.source} · {CLUB.rating.count} recenzija
              </p>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {GOOD_TO_KNOW.map((g) => (
                <li
                  key={g}
                  className="rounded-full border border-rule bg-card px-3.5 py-1.5 text-[13px] text-muted-foreground"
                >
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/*
            Columns, not a card grid — quotes are different lengths and a grid
            forces them into boxes with dead space. CSS columns let each one be
            exactly as long as it is.
          */}
          <ul className="lg:col-span-8 lg:columns-2 lg:gap-8">
            {REVIEWS.map((r) => (
              <li
                key={r.author}
                className="mb-8 break-inside-avoid border-t border-rule pt-6 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-6"
              >
                <blockquote className="font-display text-[1.15rem] leading-[1.45] text-foreground">
                  “{r.quote}”
                </blockquote>
                <footer className="mt-3 text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground">{r.author}</span> · {r.meta}
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ događaji -- */

function Dogadjaji() {
  return (
    <section id="dogadjaji" className="scroll-mt-8 bg-green-950 text-white">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow text-clay-300">Događaji</p>
            <h2 className="font-display mt-5 max-w-[13ch] text-[2.3rem] text-white sm:text-[3rem]">
              Tvrđava kao sala.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/60">
              Zatvaramo ceo prostor za vas: travnjak ispod bedema, terasu i teren. Od
              večere za trideset ljudi do firmskog turnira sa projekcijom — organizaciju
              radimo od početka do kraja.
            </p>

            <ul className="mt-9 flex flex-wrap gap-2">
              {EVENT_TYPES.map((e) => (
                <li
                  key={e}
                  className="rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] text-white/70"
                >
                  {e}
                </li>
              ))}
            </ul>

            <a
              href={CLUB.phoneHref}
              className="mt-9 inline-flex h-13 items-center gap-2.5 rounded-full border border-white/25 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-300"
            >
              <Phone className="size-4" aria-hidden="true" />
              Pitaj za termin i ponudu
            </a>
          </div>

          {/* Offset pair: the wedding is the headline, the lawn is the context. */}
          <div className="relative lg:col-span-7">
            <div className="relative aspect-[4/3] w-[88%] overflow-hidden rounded-sm">
              <Image
                src="/photos/wedding.jpg"
                alt="Svadbena večera na travnjaku ispod bedema tvrđave"
                fill
                sizes="(max-width: 1024px) 88vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 right-0 aspect-square w-[42%] overflow-hidden rounded-sm ring-8 ring-green-950 sm:-bottom-10">
              <Image
                src="/photos/pavilion-lawn.jpg"
                alt="Paviljon i ležaljke na travnjaku uz bedem"
                fill
                sizes="(max-width: 1024px) 42vw, 22vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- cene -- */

function Cene() {
  const rows = [
    {
      tier: "Off-peak",
      when: "Ponedeljak – petak",
      detail: "Svih šest termina, 08:00 – 17:00",
      price: PRICES_RSD.offPeak,
    },
    {
      tier: "Peak",
      when: "Subota i nedelja",
      detail: "Ceo dan",
      price: PRICES_RSD.peak,
      highlight: true,
    },
  ];

  return (
    <section id="cene" className="scroll-mt-8">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-3">
            <p className="eyebrow text-muted-foreground">Cene</p>
            <p className="mt-4 max-w-[26ch] text-[15px] leading-relaxed text-muted-foreground">
              Cena je za ceo teren po terminu od {SLOT_MINUTES} minuta — ne po igraču.
            </p>
          </div>

          {/* A rule-based table, not a pair of cards. Reads like a menu. */}
          <div className="lg:col-span-9">
            <dl>
              {rows.map((r) => (
                <div
                  key={r.tier}
                  className="rule-t grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-7 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr_auto]"
                >
                  <dt className="eyebrow self-center text-muted-foreground">{r.tier}</dt>
                  <div className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1">
                    <p className="font-display text-2xl text-foreground sm:text-[1.75rem]">
                      {r.when}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                  </div>
                  <dd
                    className={cn(
                      "font-display tabular col-start-2 row-start-1 self-center text-right text-[2.25rem] sm:col-start-3 sm:text-[2.75rem]",
                      r.highlight ? "text-clay-500" : "text-foreground",
                    )}
                  >
                    {r.price.toLocaleString("sr-RS")}
                    <span className="eyebrow ml-2 align-middle text-muted-foreground">rsd</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="rule-t flex flex-wrap items-center justify-between gap-4 pt-7">
              <p className="text-sm text-muted-foreground">
                Plaćanje na licu mesta. Otkazivanje bez naknade do 4 sata pre termina.
              </p>
              <Link
                href="/rezervacija"
                className="group inline-flex items-center gap-2 text-[15px] font-semibold text-clay-500 underline decoration-clay-500/30 underline-offset-[6px] transition-colors hover:decoration-clay-500"
              >
                Vidi slobodne termine
                <ArrowUpRight
                  className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- lokacija -- */

function Lokacija() {
  return (
    <section id="lokacija" className="scroll-mt-8 border-t border-rule bg-muted/40">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-muted-foreground">Lokacija</p>
            <h2 className="font-display mt-4 max-w-[12ch] text-[2.1rem] text-foreground sm:text-[2.5rem]">
              U šancu tvrđave.
            </h2>

            <dl className="mt-10">
              <Detail label="Adresa">
                {CLUB.address}
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  {CLUB.addressArea}
                </span>
              </Detail>
              <Detail label="Radno vreme">
                {CLUB.hoursLabel}
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  {CLUB.hoursNote}
                </span>
              </Detail>
              <Detail label="Telefon">
                <a
                  href={CLUB.phoneHref}
                  className="underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {CLUB.phone}
                </a>
              </Detail>
              <Detail label="Instagram">
                <a
                  href={CLUB.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {CLUB.instagramHandle}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </Detail>
            </dl>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Otvori u Google Mapama
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          {/*
            aspect-ratio reserves the box so the lazy iframe can't shift the page,
            and the tinted layer underneath means the frame never flashes white
            while the map is still loading.
          */}
          <div className="relative overflow-hidden rounded-sm border border-rule bg-green-50 lg:col-span-8">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="eyebrow text-primary/25">Učitavanje mape…</span>
            </div>
            <iframe
              src={MAPS_EMBED}
              title={`Mapa — ${CLUB.name} ${CLUB.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="relative aspect-[4/3] w-full border-0 lg:aspect-[16/11]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rule-t grid grid-cols-[7rem_1fr] gap-4 py-4 first:border-t-0 first:pt-0">
      <dt className="eyebrow pt-1 text-muted-foreground">{label}</dt>
      <dd className="text-[15px] leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

/* ----------------------------------------------------------- zatvaranje -- */

function Zatvaranje() {
  return (
    <section className="relative isolate overflow-hidden bg-green-900">
      <Image
        src="/photos/players-three.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[70%_center] opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-green-950 via-green-950/85 to-green-950/30"
      />

      <div className="mx-auto max-w-[86rem] px-5 py-24 sm:px-8 sm:py-32">
        <p className="eyebrow text-clay-300">Rezervacija</p>
        <h2 className="font-display mt-5 max-w-[14ch] text-[2.6rem] text-white sm:text-[3.5rem]">
          Vidimo se na terenu.
        </h2>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65">
          Izaberi dan i termin — potvrdu dobijaš odmah na ekranu, bez čekanja.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-6">
          <CtaButton href="/rezervacija">Rezerviši termin</CtaButton>
          <a
            href={CLUB.phoneHref}
            className="text-sm text-white/60 underline decoration-white/25 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white/60"
          >
            {CLUB.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- shared -- */

function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-13 items-center gap-2.5 rounded-full bg-clay-500 px-7 py-3.5",
        "text-[15px] font-semibold whitespace-nowrap text-white transition-colors duration-200",
        "hover:bg-clay-400 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-clay-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950",
      )}
    >
      {children}
      <ArrowRight
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

/* --------------------------------------------------------------- footer -- */

function Footer() {
  return (
    <footer className="bg-green-950 text-white/50">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-6 border-t border-white/10 py-9 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg text-white">Padel House Beograd</p>
            <p className="mt-1 text-[13px]">
              {CLUB.address}, {CLUB.addressArea} · {CLUB.hoursLabel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 sm:ml-auto">
            <a href={CLUB.phoneHref} className="text-[13px] transition-colors hover:text-white">
              {CLUB.phone}
            </a>
            <a
              href={CLUB.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-[13px] transition-colors hover:text-white"
            >
              <InstagramIcon className="size-4" />
              {CLUB.instagramHandle}
            </a>
            <Link
              href="/rezervacija"
              className="text-[13px] text-clay-300 transition-opacity hover:opacity-80"
            >
              Rezerviši termin
            </Link>
          </div>
        </div>

        <p className="border-t border-white/10 py-6 pb-24 text-[12px] sm:pb-6">
          © {new Date().getFullYear()} {CLUB.name} {CLUB.city}. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}

/** Mobile-only. 95% of traffic is phones — the booking action never scrolls away. */
function StickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-green-950/95 px-4 py-3 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/rezervacija"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay-500 text-[15px] font-semibold text-white transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
      >
        Rezerviši termin
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
