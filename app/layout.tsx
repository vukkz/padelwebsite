import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { CLUB } from "@/lib/config";
import "./globals.css";

/**
 * Two faces, and only one of them does any headline work.
 *
 * Inter carries every headline, label, and interface string. The club's own
 * campaigns — "NIJE SAMO PADEL", "PADEL & POUR", "ROĐENDAN POD ZVEZDAMA" — are
 * set in heavy neo-grotesque caps, tight, in cream over sunlit photography;
 * Inter at 800 with negative tracking is the closest obtainable face to the
 * Helvetica Now Display they actually use, and it has full latin-ext, so
 * č ć š ž đ render rather than falling back mid-word.
 *
 * Cormorant Garamond appears in exactly one place: the "Padel House" wordmark,
 * matching the serif in their logo badge. The original build's mistake was
 * putting a serif on every heading — their serif belongs to the logo, and
 * their headlines are a modern sans. Getting that split wrong is what made the
 * old site read as generic editorial rather than as this club.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const wordmark = Cormorant_Garamond({
  variable: "--font-wordmark",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  display: "swap",
});

/** The direction contract, emitted into the built markup so it can be audited. */
const CONTRACT = `<!--
impeccable direction contract · Padel House Beograd

THESIS: The club already has a brand — emerald badge, cream campaign caps,
terracotta court, warm wood — and every previous attempt either ignored it or
replaced it. This build executes their own identity at the scale their bio
claims: "Premium Event Prostor". It refuses the court-hero-plus-pricing-card
arrangement and refuses the quiet cream-editorial rendition that reads as
timid.

OWN-WORLD: Emerald #046A38, cream #F5F1E8, terracotta #C2593A, wood #B08356,
warm ink #1A1815. Inter 800 caps at negative tracking for every headline;
Cormorant Garamond for the wordmark only; letterspaced small caps as the quiet
counterweight. Photography full bleed at scale. One accent per screen.

STORY: The visitor sees a premium venue rather than a court to rent, believes
it because the photography and the reviews are real, and either books a court
or walks in for coffee.

FIRST VIEWPORT: Full-bleed sunlit photograph of the court in the fortress
moat. NIJE SAMO PADEL set large in cream caps over it, one terracotta action
beneath, a thin letterspaced spec line. No cards, no chips, no boxes.

FORM: The club's own identity, evidenced from their Instagram and campaign
artwork rather than invented.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
-->`;

export const metadata: Metadata = {
  title: `${CLUB.name} ${CLUB.city} — rezervacija padel terena`,
  description: `Rezerviši padel teren u ${CLUB.city}u online. Tri terena, termini od 90 minuta, potvrda odmah.`,
  openGraph: {
    title: `${CLUB.name} — rezervacija padel terena`,
    description: "Rezerviši svoj termin online, za manje od minuta.",
    locale: "sr_RS",
    type: "website",
  },
  /*
    Site-wide, for as long as this is a proposal rather than the club's site.
    See app/robots.ts for why, and remove both together. `/admin` and
    `/otkazivanje` set their own and stay noindex regardless.
  */
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#046a38",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr-Latn-RS"
      className={`${inter.variable} ${wordmark.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
