import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { CLUB } from "@/lib/config";

/** Compact header for the inner pages. The landing page has its own hero nav. */
export function SiteHeader({ back }: { back?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        {back && (
          <Link
            href="/"
            aria-label="Nazad na početnu"
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        )}

        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          {CLUB.name}
          <span className="ml-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {CLUB.city}
          </span>
        </Link>

        <a
          href={CLUB.phoneHref}
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{CLUB.phone}</span>
          <span className="sm:hidden">Pozovi</span>
        </a>
      </div>
    </header>
  );
}
