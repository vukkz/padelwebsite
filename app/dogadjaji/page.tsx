import Image from "next/image";
import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { CLUB, EVENTS } from "@/lib/config";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { PageHero } from "@/components/page-hero";
import { InstagramIcon } from "@/components/icons/instagram";

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
      img: "/photos/pavilion-lawn.jpg",
      alt: "Travnjak sa paviljonom i ležaljkama ispod bedema tvrđave",
    },
    {
      title: "Terasa",
      spec: "do 60 gostiju",
      text: "Natkriveni deo uz kafe, uz punu ugostiteljsku ponudu kluba.",
      img: "/photos/hero-drinks.jpg",
      alt: "Poslužavnik sa pićem i reketima na terasi kluba",
    },
    {
      title: "Teren",
      spec: "turniri · projekcije",
      text: "Firmski turniri i projekcije utakmica ispod osvetljenog bedema.",
      img: "/photos/court-plaza.jpg",
      alt: "Teren i oslikani plato ispod bedema tvrđave",
    },
  ];

  return (
    <>
      <SiteHeader active="/dogadjaji" overlay />
      <main className="flex-1">
        <PageHero
          label="Premium event prostor"
          title="Tvrđava kao sala"
          lead="Zatvaramo ceo prostor za vas: travnjak ispod bedema, terasu i teren. Od večere za trideset ljudi do firmskog turnira sa projekcijom — organizaciju radimo od početka do kraja."
          image="/photos/cinema-night.jpg"
          alt="Projekcija utakmice pred publikom ispod osvetljenog bedema tvrđave"
          /*
            The hero was a wedding photograph: the couple mid-kiss, both faces
            sharp, a dozen identifiable guests behind them. They consented to a
            venue photographer, not to a third party's uncommissioned pitch —
            and the club would likely recognise them. This frame is a public
            event at the same venue where the crowd reads as a crowd and no one
            is the subject, which is a different question entirely.

            Lower than the old values because the interest here sits below the
            middle: rampart across the top, screen and audience beneath it.
          */
          crop="object-[50%_54%] lg:object-[50%_46%]"
        >
          {/* Two affordances. tel: opens an OS prompt or nothing on desktop. */}
          <div
            className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ animationDelay: "300ms" }}
          >
            <a
              href={CLUB.phoneHref}
              className="inline-flex min-h-14 items-center gap-3 bg-terracotta px-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-terracotta-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-4 focus-visible:ring-offset-shade"
            >
              <Phone className="size-4" aria-hidden="true" />
              {CLUB.phone}
            </a>
            {/*
              Instagram, not email. `info@padelhouse.rs` is a guess — PRODUCT.md
              lists it as unconfirmed — and this was the one place on the site
              where an unconfirmed fact was wired to a live action with no
              disclosure, on the page selling the highest-value booking there is.
              A club rep tapping it in the room and not recognising the address
              undoes the credit the price disclosures earn two pages over.

              @padelhouse.beograd is confirmed, it is the club's own live
              channel, and it is where a Belgrade venue actually receives event
              enquiries.
            */}
            <a
              href={CLUB.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="label inline-flex min-h-11 items-center gap-2 text-cream/85 underline decoration-cream/40 underline-offset-[8px] transition-colors hover:text-cream hover:decoration-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-shade"
            >
              <InstagramIcon className="size-4" />
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
                <span className="label text-cream/90 sm:col-span-3 sm:text-right">
                  {e.meta}
                </span>
              </li>
            ))}
          </ul>

          <p className="label mt-8 text-cream/90">
            Program se menja — najnovije uvek na {CLUB.instagramHandle}
          </p>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
