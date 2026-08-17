import Image from "next/image";
import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { CLUB, EVENTS } from "@/lib/config";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: `Događaji — ${CLUB.name} ${CLUB.city}`,
  description:
    "Venčanja, firmske proslave, turniri i projekcije ispod bedema Beogradske tvrđave. Zatvaramo ceo prostor.",
};

/**
 * Događaji — the highest-value enquiry on the site, given its own surface.
 *
 * The club's own bio leads with "Premium Event Prostor". In the original build
 * this was a section 4,700px down a single page whose only mobile route was a
 * 20px text link. It gets a page, and two real contact affordances, because
 * `tel:` alone fails silently on a desktop.
 */
export default function DogadjajiPage() {
  const spaces = [
    {
      title: "Travnjak",
      spec: "do 120 gostiju",
      text: "Ispod bedema, sa paviljonom i ležaljkama. Večere, venčanja, koktel prijemi.",
      img: "/photos/wedding.jpg",
      alt: "Svadbena večera na travnjaku ispod bedema tvrđave",
    },
    {
      title: "Terasa",
      spec: "do 60 gostiju",
      text: "Natkriveni deo uz kafe, uz punu ugostiteljsku ponudu kluba.",
      img: "/photos/pavilion-lawn.jpg",
      alt: "Paviljon i ležaljke na travnjaku uz bedem",
    },
    {
      title: "Teren",
      spec: "turniri · projekcije",
      text: "Firmski turniri i projekcije utakmica ispod osvetljenog bedema.",
      img: "/photos/cinema-night.jpg",
      alt: "Projekcija utakmice uz osvetljeni bedem tvrđave",
    },
  ];

  return (
    <>
      <SiteHeader active="/dogadjaji" />
      <main className="flex-1">
        <PageHero
          label="Premium event prostor"
          title="Tvrđava kao sala"
          lead="Zatvaramo ceo prostor za vas: travnjak ispod bedema, terasu i teren. Od večere za trideset ljudi do firmskog turnira sa projekcijom — organizaciju radimo od početka do kraja."
          image="/photos/wedding.jpg"
          alt="Svadbena večera na travnjaku ispod bedema tvrđave"
          objectPosition="50% 38%"
        >
          {/* Two affordances. tel: opens an OS prompt or nothing on desktop. */}
          <div
            className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ animationDelay: "300ms" }}
          >
            <a
              href={CLUB.phoneHref}
              className="inline-flex min-h-14 items-center gap-3 bg-terracotta px-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-terracotta-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
            >
              <Phone className="size-4" aria-hidden="true" />
              {CLUB.phone}
            </a>
            <a
              href={`mailto:${CLUB.email}`}
              className="label inline-flex min-h-11 items-center gap-2 text-ink-soft underline decoration-rule underline-offset-[8px] transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
            >
              <Mail className="size-4" aria-hidden="true" />
              Pošalji upit
            </a>
          </div>
        </PageHero>

        <section className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h2 className="display max-w-[16ch] text-[2.4rem] text-ink sm:text-[3.2rem]">
              Tri prostora, jedan šanac
            </h2>
            <p className="label text-ink-faint">
              Kapaciteti okvirni — potvrđujemo po upitu
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {spaces.map((s) => (
              <article key={s.title} className="flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-warm">
                  <Image
                    src={s.img}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-7 flex items-baseline justify-between gap-4">
                  <h3 className="display text-[1.9rem] text-ink">{s.title}</h3>
                  <span className="label text-ink-faint">{s.spec}</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{s.text}</p>
              </article>
            ))}
          </div>
        </section>

      {/*
        Named events, not event categories. "Venčanja · Firmske proslave ·
        Rođendani · Turniri" is true of every venue in Belgrade and reads as
        keyword filler; these are things this venue actually put on, which is
        the difference between claiming capability and showing it.
      */}
      <section className="bg-green text-cream">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
          <h2 className="display max-w-[16ch] text-[2.4rem] sm:text-[3.2rem]">
            Šta se ovde već dešavalo
          </h2>

          <ul className="mt-14 border-t border-cream/25">
            {EVENTS.map((e) => (
              <li
                key={e.name}
                className="grid gap-x-8 gap-y-2 border-b border-cream/25 py-7 sm:grid-cols-12 sm:items-baseline"
              >
                <span className="display text-[1.5rem] sm:col-span-4 sm:text-[1.9rem]">
                  {e.name}
                </span>
                <span className="text-[15px] leading-relaxed text-cream/85 sm:col-span-5">
                  {e.note}
                </span>
                <span className="label text-cream/60 sm:col-span-3 sm:text-right">
                  {e.meta}
                </span>
              </li>
            ))}
          </ul>

          <p className="label mt-8 text-cream/55">
            Program se menja — najnovije uvek na {CLUB.instagramHandle}
          </p>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
