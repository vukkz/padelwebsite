"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CLUB } from "@/lib/config";
import { NAV } from "@/components/nav-items";
import { InstagramIcon } from "@/components/icons/instagram";

/**
 * The phone's navigation.
 *
 * Two earlier attempts failed on the same 45px strip: three letterspaced 11–13px
 * caps sharing a row with a wordmark and a booking plate, over photography. The
 * first clipped "Kafa" mid-word and hid "Događaji" entirely; the second gave the
 * strip its own scrimmed band, which was legible and still read as cramped.
 *
 * The problem was the container, not the type. A 45px band is a label rail, and
 * this site's whole register is large type with air around it — so at the width
 * where the rail cannot deliver that, the nav stops trying to live on the frame
 * and takes a surface of its own.
 *
 * The standing objection to a hamburger here is that hiding the nav is what made
 * the original site padel-first: the phone showed one destination and it was
 * PADEL. This answers that objection rather than ignoring it. Closed, the phone
 * now shows *no* ranking at all — the three are equal because none is on screen.
 * Open, /kafa is set at 2.75rem, which is larger than it has ever been on this
 * site, on a surface where nothing competes with it. The failure mode was the
 * café being subordinate, not the café being one tap away.
 */

/** Two hairlines at the rule weight, not a lucide glyph — the frame's language. */
function MenuMark({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="14"
      viewBox="0 0 22 14"
      fill="none"
      aria-hidden="true"
      className="overflow-visible"
    >
      <line
        x1="0"
        y1={open ? 7 : 1}
        x2="22"
        y2={open ? 7 : 1}
        stroke="currentColor"
        strokeWidth="1.5"
        className="origin-center transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: open ? "rotate(45deg)" : "none" }}
      />
      <line
        x1="0"
        y1={open ? 7 : 13}
        x2="22"
        y2={open ? 7 : 13}
        stroke="currentColor"
        strokeWidth="1.5"
        className="origin-center transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: open ? "rotate(-45deg)" : "none" }}
      />
    </svg>
  );
}

export function MobileMenu({ active, overlay }: { active?: string; overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // No `mounted` guard before the portal: `open` only becomes true from a click,
  // which cannot happen during SSR, so `document` is always there by then.

  /*
    Same modal discipline as the booking sheet, for the same reasons: inert the
    background rather than aria-hiding it, un-inert before restoring focus, and
    lock the body scroll. A nav overlay a keyboard user can tab out of, into a
    page they cannot see, is not a menu — it is a decoration over a live page.
  */
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    // Captured now rather than read in the cleanup: the trigger outlives the
    // panel, but reading a ref during teardown is how focus restore silently
    // becomes a no-op when that stops being true.
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    const behind = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert"),
    );
    behind.forEach((el) => el.setAttribute("inert", ""));

    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();

    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = prevOverflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const stops = [
        ...panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'),
      ].filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!panel.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(true)}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label="Meni"
      className={[
        "-mr-2 flex size-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70 sm:hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        overlay ? "text-cream" : "text-ink",
      ].join(" ")}
    >
      <MenuMark open={false} />
    </button>
  );

  const panel = (
    <div ref={rootRef} className="fixed inset-0 z-[60] sm:hidden">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigacija"
        className="animate-fade-in flex h-full flex-col bg-shade text-cream"
      >
        {/* The close control sits exactly where the trigger was, so the mark
            reads as having rotated in place rather than as a new button. */}
        <div className="flex h-[var(--header-row)] shrink-0 items-center justify-between px-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="wordmark -mx-2 flex min-h-11 items-center px-2 text-[1.5rem] leading-none transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Padel House
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Zatvori meni"
            className="-mr-2 flex size-11 shrink-0 items-center justify-center text-cream transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <MenuMark open />
          </button>
        </div>

        {/*
          Display scale, not a list of links. The three destinations are the
          whole point of the surface, so they get the page's own headline
          treatment and a hairline between each — the same rule that separates
          sections everywhere else on the site.
        */}
        <nav aria-label="Glavna navigacija" className="flex-1 px-5 pt-4">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              aria-current={active === n.href ? "page" : undefined}
              className={[
                "rise group flex items-baseline justify-between border-b border-cream/15 py-6 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-shade",
                active === n.href ? "text-cream" : "text-cream/85 hover:text-cream",
              ].join(" ")}
              style={{ animationDelay: `${60 + i * 70}ms` }}
            >
              <span className="display text-[2.75rem] leading-none">{n.label}</span>
              {active === n.href && (
                <span className="label text-cream/60">Ovde si</span>
              )}
            </Link>
          ))}

          <Link
            href="/rezervacija"
            onClick={() => setOpen(false)}
            aria-current={active === "/rezervacija" ? "page" : undefined}
            className="rise mt-9 flex h-14 w-full items-center justify-center bg-terracotta text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-terracotta-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-shade"
            style={{ animationDelay: "270ms" }}
          >
            Rezerviši termin
          </Link>
        </nav>

        {/* The two things a visitor standing outside a fortress moat actually
            wants next, and neither of them is another page. */}
        <div className="rise shrink-0 space-y-3 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8" style={{ animationDelay: "340ms" }}>
          <p className="label text-cream/60">{CLUB.hoursLabel}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a
              href={CLUB.phoneHref}
              className="inline-flex min-h-11 items-center text-[15px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-shade"
            >
              {CLUB.phone}
            </a>
            <a
              href={CLUB.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-11 items-center gap-2 text-[15px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-shade"
            >
              <InstagramIcon className="size-4" />
              {CLUB.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {trigger}
      {open && createPortal(panel, document.body)}
    </>
  );
}
