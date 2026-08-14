import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { CLUB } from "@/lib/config";

/** Compact header for the inner pages. The landing page has its own hero nav. */
export function SiteHeader({ back }: { back?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
        {back && (
          <Link
            href="/"
            aria-label="Nazad na početnu"
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        )}

        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg">{CLUB.name}</span>
          <span className="eyebrow hidden text-muted-foreground sm:inline">{CLUB.city}</span>
        </Link>

        <a
          href={CLUB.phoneHref}
          className="eyebrow ml-auto inline-flex h-10 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Phone className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{CLUB.phone}</span>
          <span className="sm:hidden">Pozovi</span>
        </a>
      </div>
    </header>
  );
}
