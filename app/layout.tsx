import type { Metadata, Viewport } from "next";
import { Barlow, Fraunces } from "next/font/google";
import { CLUB } from "@/lib/config";
import "./globals.css";

/**
 * Two faces, clear roles.
 *
 * Fraunces carries every headline: an old-style serif with enough character to
 * read as a place rather than a template, and — critically — full latin-ext
 * coverage, so č/ć/š/ž/đ render properly instead of falling back mid-word.
 * Barlow handles body copy and the whole booking UI, where a neutral sans and
 * tabular figures matter more than personality.
 */
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  // Variable weight + the SOFT/WONK axes: one file covers every headline size,
  // and the axes let the face soften without swapping to a second family.
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${CLUB.name} ${CLUB.city} — rezervacija padel terena`,
  description: `Rezerviši padel teren u ${CLUB.city}u online. Tri terena, termini od 90 minuta, potvrda odmah.`,
  openGraph: {
    title: `${CLUB.name} — rezervacija padel terena`,
    description: "Rezerviši svoj termin online, za manje od minuta.",
    locale: "sr_RS",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f3d2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr-Latn-RS"
      className={`${barlow.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
