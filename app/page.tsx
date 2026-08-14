import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Coffee,
  Leaf,
  MapPin,
  Phone,
  Zap,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram";
import { CLUB, PRICES_RSD, SLOT_MINUTES } from "@/lib/config";
import { cn } from "@/lib/utils";

const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(CLUB.mapsQuery)}&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CLUB.mapsQuery)}`;

export default function LandingPage() {
  return (
    <>
      <TopBar />

      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
        <Location />
        <Contact />
      </main>

      <Footer />
      <StickyCta />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function TopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <span className="font-display text-xl font-bold tracking-tight text-white">
          {CLUB.name}
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            {CLUB.city}
          </span>
        </span>
        <a
          href={CLUB.phoneHref}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{CLUB.phone}</span>
          <span className="sm:hidden">Pozovi</span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[86svh] flex-col justify-end overflow-hidden">
      {/*
        TODO(pitch): replace with a real photo of the club's courts.
        Their Instagram photos aren't downloadable, and a stock shot that
        obviously isn't their venue reads worse in a pitch than a clean
        placeholder. Drop the file in /public and swap the src.
      */}
      <Image
        src="/hero-padel.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Heavy at the bottom where the headline sits, light at the top so the
          court illustration still reads instead of turning into a dark smear. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-green-950 via-green-950/85 via-40% to-green-950/20"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-28">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent backdrop-blur-sm">
          <Leaf className="size-3.5" aria-hidden="true" />
          Zelena zona · {CLUB.city}
        </p>

        <h1 className="font-display mt-5 max-w-2xl text-[2.75rem] font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Tvoj teren te
          <br />
          <span className="text-accent">već čeka.</span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
          Tri terena, termini od {SLOT_MINUTES} minuta, rezervacija za manje od minuta. Bez
          poziva, bez čekanja na odgovor.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/rezervacija" className="sm:w-auto">
            <span
              className={cn(
                "inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-accent px-8 text-lg font-bold text-on-accent",
                "shadow-lg shadow-volt-500/20 transition-all duration-200",
                "hover:bg-accent-hover active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-green-950",
              )}
            >
              Rezerviši termin
              <ArrowRight className="size-5" aria-hidden="true" />
            </span>
          </Link>
          <a
            href="#cene"
            className="inline-flex h-14 items-center justify-center rounded-xl border border-white/25 px-6 text-base font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Pogledaj cene
          </a>
        </div>

        <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
          {[
            { k: "3", v: "terena" },
            { k: `${SLOT_MINUTES}`, v: "minuta po terminu" },
            { k: "08–17", v: "svakog dana" },
          ].map((s) => (
            <div key={s.v}>
              <dt className="font-display tabular text-2xl font-bold text-white sm:text-3xl">
                {s.k}
              </dt>
              <dd className="mt-0.5 text-xs text-white/60">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Zap,
      title: "Potvrda odmah",
      text: "Termin je tvoj čim ga rezervišeš. Bez čekanja da se neko javi na telefon.",
    },
    {
      icon: Leaf,
      title: "Zelena zona",
      text: "Tereni u zelenilu, daleko od gužve — mesto na kom se ostaje i posle meča.",
    },
    {
      icon: Coffee,
      title: "Specialty coffee",
      text: "Kafa koja se pije zbog kafe, ne zbog kofeina. Pre ili posle termina.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-green-50">
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pricing() {
  const cards = [
    {
      tier: "Off-peak",
      price: PRICES_RSD.offPeak,
      when: "Radnim danima",
      detail: "Ponedeljak – petak, svi termini",
      accent: false,
    },
    {
      tier: "Peak",
      price: PRICES_RSD.peak,
      when: "Vikendom",
      detail: "Subota i nedelja, ceo dan",
      accent: true,
    },
  ];

  return (
    <section id="cene" className="scroll-mt-8 bg-green-900 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Cene</h2>
        <p className="mt-2 text-white/70">
          Cena je po terminu od {SLOT_MINUTES} minuta, za ceo teren — ne po igraču.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
          {cards.map((c) => (
            <div
              key={c.tier}
              className={cn(
                "rounded-2xl border p-6",
                c.accent ? "border-accent bg-accent text-on-accent" : "border-white/20 bg-white/5",
              )}
            >
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.15em]",
                  c.accent ? "text-on-accent/70" : "text-accent",
                )}
              >
                {c.tier}
              </p>
              <p className="font-display tabular mt-3 text-4xl font-bold sm:text-5xl">
                {c.price.toLocaleString("sr-RS")}
                <span className="ml-2 text-base font-semibold">RSD</span>
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-medium",
                  c.accent ? "text-on-accent/80" : "text-white/80",
                )}
              >
                {c.when}
              </p>
              <p
                className={cn(
                  "mt-3 border-t pt-3 text-sm",
                  c.accent ? "border-on-accent/20 text-on-accent/75" : "border-white/15 text-white/60",
                )}
              >
                {c.detail}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm text-white/60">
          Plaćanje na licu mesta. Otkazivanje bez naknade najkasnije 4 sata pre termina.
        </p>

        <Link
          href="/rezervacija"
          className="mt-7 inline-flex h-13 items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-base font-bold text-on-accent transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
        >
          <CalendarCheck className="size-5" aria-hidden="true" />
          Rezerviši termin
        </Link>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section id="lokacija" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-14 sm:py-20">
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Lokacija</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <InfoRow icon={MapPin} label="Adresa">
            {CLUB.address}
            <span className="mt-0.5 block text-xs text-muted-foreground/70">
              {/* TODO(pitch): remove this note once the exact address is filled in. */}
              {CLUB.addressNote}
            </span>
          </InfoRow>

          <InfoRow icon={Clock} label="Radno vreme">
            {CLUB.hoursLabel}
          </InfoRow>

          <InfoRow icon={Phone} label="Telefon">
            <a href={CLUB.phoneHref} className="font-medium text-primary hover:underline">
              {CLUB.phone}
            </a>
          </InfoRow>

          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MapPin className="size-4.5" aria-hidden="true" />
            Otvori u Google Mapama
          </a>
        </div>

        {/* aspect-ratio reserves the space so the iframe can't shift the page. */}
        <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <iframe
            src={MAPS_EMBED}
            title={`Mapa — ${CLUB.name} ${CLUB.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="aspect-[4/3] w-full border-0 sm:aspect-[16/10]"
          />
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-base">{children}</div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="rounded-3xl bg-green-800 px-6 py-10 text-center text-white sm:px-10 sm:py-14">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Vidimo se na terenu
        </h2>
        <p className="mx-auto mt-2 max-w-md text-white/75">
          Izaberi dan i termin — potvrdu dobijaš odmah na ekranu.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/rezervacija"
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 text-lg font-bold text-on-accent transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-green-800 sm:w-auto"
          >
            Rezerviši termin
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <a
            href={CLUB.phoneHref}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-base font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
          >
            <Phone className="size-5" aria-hidden="true" />
            {CLUB.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-bold">
            {CLUB.name}{" "}
            <span className="text-sm font-medium text-muted-foreground">{CLUB.city}</span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{CLUB.hoursLabel}</p>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <a
            href={CLUB.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <InstagramIcon className="size-4" />
            {CLUB.instagramHandle}
          </a>
        </div>
      </div>

      {/* Extra bottom padding on mobile so the sticky CTA never covers the footer. */}
      <div className="border-t border-border px-4 py-4 pb-24 sm:pb-4">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} {CLUB.name} {CLUB.city}. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}

/** Mobile-only sticky CTA. 95% of traffic is phones — the booking button never scrolls away. */
function StickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/rezervacija"
        className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-base font-bold text-on-accent transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <CalendarCheck className="size-5" aria-hidden="true" />
        Rezerviši termin
      </Link>
    </div>
  );
}
