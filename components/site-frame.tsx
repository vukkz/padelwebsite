import Link from "next/link";
import { CLUB } from "@/lib/config";
import { InstagramIcon } from "@/components/icons/instagram";

/**
 * The persistent frame, in the club's own register.
 *
 * Deliberately thin: a hairline rule, letterspaced caps, and the serif
 * wordmark. The previous build boxed every nav item in a 2px outline, which is
 * a packaging device and reads as loud rather than as expensive. Premium here
 * is space and restraint — the header should be the quietest thing on screen
 * so the photography and the headline can carry the page.
 *
 * The nav still scrolls horizontally rather than collapsing, which is what
 * fixed the original site's worst structural failure: four anchors hidden
 * behind `lg:` meant a phone got no navigation at all.
 */

const NAV = [
  { href: "/padel", label: "Padel" },
  { href: "/kafa", label: "Kafa" },
  { href: "/dogadjaji", label: "Događaji" },
];

export function SiteHeader({
  active,
  overlay,
}: {
  active?: string;
  /** Sits over a full-bleed photograph: knock the chrome out to cream. */
  overlay?: boolean;
}) {
  const base = overlay ? "text-cream" : "text-ink";
  const rule = overlay ? "border-cream/20" : "border-rule";
  const dim = overlay ? "text-cream/70" : "text-ink-soft";

  return (
    <header
      className={[
        overlay
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b bg-cream/95 backdrop-blur-sm",
        overlay ? "" : rule,
        base,
      ].join(" ")}
    >
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="flex h-20 items-center gap-5 sm:h-24 sm:gap-12">
          <Link
            href="/"
            className="wordmark -mx-2 flex min-h-11 shrink-0 items-center px-2 text-[1.5rem] leading-none transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-transparent sm:text-[1.75rem]"
          >
            Padel House
          </Link>

          {/*
            An underline that grows from the link rather than a filled pill or a
            boxed cell. At this level of brand the nav should be the quietest
            thing on screen; state is carried by a 1px rule, not by a container.
          */}
          <nav
            aria-label="Glavna navigacija"
            className="no-scrollbar -mx-2 flex min-w-0 flex-1 items-center gap-4 overflow-x-auto px-2 sm:gap-8"
          >
            {NAV.map((n) => {
              const isActive = active === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "group relative flex min-h-11 shrink-0 items-center whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    isActive ? base : `${dim} hover:${overlay ? "text-cream" : "text-ink"}`,
                  ].join(" ")}
                >
                  {n.label}
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute inset-x-0 bottom-[26%] h-px origin-left bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <a
            href={CLUB.phoneHref}
            className={`label hidden min-h-11 shrink-0 items-center transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 lg:flex ${dim}`}
          >
            {CLUB.phone}
          </a>

          <Link
            href="/rezervacija"
            className={[
              "hidden h-11 shrink-0 items-center px-6 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors sm:inline-flex",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta",
              // Over photography the cream plate flips to terracotta on hover,
              // matching the hero's primary action so both white buttons on
              // that screen behave as one control.
              overlay
                ? "bg-cream text-ink hover:bg-terracotta hover:text-white"
                : "bg-terracotta text-white hover:bg-terracotta-deep",
            ].join(" ")}
          >
            Rezerviši
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-green-dark text-cream">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="wordmark text-[2rem] sm:text-[2.6rem]">Padel House</p>
            <p className="label mt-4 text-cream/50">Kalemegdan · Beograd</p>
            <p className="mt-8 max-w-[32ch] text-[15px] leading-relaxed text-cream/70">
              {CLUB.address}, {CLUB.addressArea}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="label text-cream/50">Radno vreme</p>
            <p className="mt-4 text-[15px] leading-relaxed">
              {CLUB.hoursLabel}
              <span className="mt-2 block text-cream/60">{CLUB.hoursNote}</span>
            </p>
          </div>

          <div className="lg:col-span-4">
            <p className="label text-cream/50">Kontakt</p>
            <div className="mt-4 flex flex-col items-start gap-1">
              <a
                href={CLUB.phoneHref}
                className="inline-flex min-h-11 items-center text-[15px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
              >
                {CLUB.phone}
              </a>
              <a
                href={`mailto:${CLUB.email}`}
                className="inline-flex min-h-11 items-center text-[15px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
              >
                {CLUB.email}
              </a>
              <a
                href={CLUB.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-2 text-[15px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
              >
                <InstagramIcon className="size-4" />
                {CLUB.instagramHandle}
              </a>
            </div>
          </div>
        </div>

        <p className="label mt-16 border-t border-cream/15 pt-8 text-cream/40">
          © {new Date().getFullYear()} {CLUB.name} {CLUB.city}
        </p>
      </div>
    </footer>
  );
}
