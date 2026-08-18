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
 * Below `sm` the nav gets its own row under the wordmark instead of sharing
 * the line with it.
 *
 * Measured at 390px, the shared line left the nav 87px of the 214px its three
 * links need — the wordmark and the always-visible Rezerviši plate take the
 * rest — and the scroller is `no-scrollbar`, so "Kafa" clipped mid-word and
 * "Događaji" was not on screen at all, with no fade, chevron or bar to say it
 * was there. A phone got exactly one destination and it was PADEL, on a site
 * whose whole argument is that people come for the coffee. /kafa answers every
 * question the primary visitor actually has — shade, children, dogs, parking —
 * and it was the clipped word behind the button.
 *
 * Not a hamburger. Hiding the nav behind a breakpoint was the original site's
 * worst structural failure, and a silently clipped scroller is that same
 * failure wearing a different hat. The second row costs 45px and shows all
 * three, on every page, at every width.
 */

const NAV = [
  { href: "/padel", label: "Padel" },
  { href: "/kafa", label: "Kafa" },
  { href: "/dogadjaji", label: "Događaji" },
];

/**
 * An underline that grows from the link rather than a filled pill or a boxed
 * cell. At this level of brand the nav should be the quietest thing on screen;
 * state is carried by a 1px rule, not by a container.
 *
 * `px-2` is a touch target, not spacing: "Kafa" is short enough that the link
 * measured 40px wide against a 44px floor, at every breakpoint. The padding is
 * cancelled by `-mx-2` on the nav so the first link's *text* still aligns to
 * the gutter, and the underline insets to match so it hugs the word rather
 * than the target.
 */
function NavLink({
  href,
  label,
  active,
  overlay,
}: {
  href: string;
  label: string;
  active: boolean;
  overlay?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        // Written out rather than composed: `hover:${...}` builds a class name
        // the Tailwind scanner never sees as a literal, so the hover state only
        // worked here because other files happened to emit the same utility.
        active
          ? overlay
            ? "text-cream"
            : "text-ink"
          : overlay
            ? "text-cream/70 hover:text-cream"
            : "text-ink-soft hover:text-ink",
      ].join(" ")}
    >
      {label}
      <span
        aria-hidden="true"
        className={[
          "absolute inset-x-2 bottom-[26%] h-px origin-left bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        ].join(" ")}
      />
    </Link>
  );
}

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

  /*
    /rezervacija is deliberately not in NAV — the booking plate already points
    at it, and listing it twice would be the frame arguing with itself. But the
    page was passing `active="/rezervacija"` into a nav with nowhere to put it,
    so the one surface where a visitor is mid-task showed no location at all.
    The plate carries the state instead: current page, already pressed.
  */
  const onBooking = active === "/rezervacija";

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
        <div className="flex h-[var(--header-row)] items-center gap-5 sm:gap-12">
          <Link
            href="/"
            className="wordmark -mx-2 flex min-h-11 shrink-0 items-center px-2 text-[1.5rem] leading-none transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-transparent sm:text-[1.75rem]"
          >
            Padel House
          </Link>

          <nav
            aria-label="Glavna navigacija"
            className="-mx-2 hidden min-w-0 flex-1 items-center gap-4 sm:flex"
          >
            {NAV.map((n) => (
              <NavLink
                key={n.href}
                href={n.href}
                label={n.label}
                active={active === n.href}
                overlay={overlay}
              />
            ))}
          </nav>

          {/* Below `sm` the nav has left this row, so nothing is left to hold
              the plate against the right edge. */}
          <span aria-hidden="true" className="flex-1 sm:hidden" />

          <a
            href={CLUB.phoneHref}
            className={`label hidden min-h-11 shrink-0 items-center transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 lg:flex ${dim}`}
          >
            {CLUB.phone}
          </a>

          {/*
            Visible at every width, including below 640px.

            It was `hidden sm:inline-flex`, which on a phone left the frame
            carrying a wordmark and three nav links and no booking action at
            all — while the hero CTA measured 29px below an 844px fold. So the
            dominant context had no way to book without scrolling, against the
            one hard requirement this project states. Narrower padding at the
            smallest size keeps it off the wordmark rather than hiding it.
          */}
          <Link
            href="/rezervacija"
            aria-current={onBooking ? "page" : undefined}
            className={[
              "inline-flex h-11 shrink-0 items-center px-4 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors sm:px-6",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta",
              // Over photography the cream plate flips to terracotta on hover,
              // matching the hero's primary action so both white buttons on
              // that screen behave as one control.
              overlay
                ? "bg-cream text-ink hover:bg-terracotta hover:text-white"
                : onBooking
                  ? "bg-terracotta-deep text-white"
                  : "bg-terracotta text-white hover:bg-terracotta-deep",
            ].join(" ")}
          >
            Rezerviši
          </Link>
        </div>
      </div>

      {/*
        The second row. A full-bleed hairline above it so it reads as a band of
        the frame rather than as links that fell off the line above, and the
        same NavLink as the row it left, so the two breakpoints speak once.
      */}
      <div className={`h-[var(--header-nav)] border-t sm:hidden ${rule}`}>
        <nav
          aria-label="Glavna navigacija"
          className="mx-auto flex h-full max-w-[88rem] items-center gap-4 px-3"
        >
          {NAV.map((n) => (
            <NavLink
              key={n.href}
              href={n.href}
              label={n.label}
              active={active === n.href}
              overlay={overlay}
            />
          ))}
        </nav>
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
