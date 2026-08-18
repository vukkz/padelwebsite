import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { CancelPanel } from "@/components/booking/cancel-panel";
import { findByToken } from "@/lib/cancellation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { CLUB } from "@/lib/config";

export const metadata: Metadata = {
  title: "Otkazivanje rezervacije — Padel House Beograd",
  // The link is a credential. Keep it out of search results entirely.
  robots: { index: false, follow: false },
};

// The answer depends on a token and on the clock, so it can never be cached.
export const dynamic = "force-dynamic";

export default async function CancelPage({
  params,
}: PageProps<"/otkazivanje/[token]">) {
  const { token } = await params;
  const booking = isSupabaseConfigured() ? await findByToken(token) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        {booking ? (
          <CancelPanel booking={booking} />
        ) : (
          /*
            One answer for a token that never existed, one that has been purged,
            and one that was mistyped. Distinguishing them would turn this page
            into an oracle for guessing tokens, and none of the three changes
            what the player should do next.
          */
          <div className="max-w-xl">
            <p className="eyebrow text-muted-foreground">Link nije prepoznat</p>
            <h1 className="font-display mt-4 text-[2.1rem] text-foreground sm:text-[2.5rem]">
              Ne možemo da pronađemo ovu rezervaciju.
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
              Link je možda nepotpun ili je termin već prošao. Ako i dalje imaš termin
              koji želiš da otkažeš, javi se klubu na{" "}
              <a
                href={CLUB.phoneHref}
                className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CLUB.phone}
              </a>
              .
            </p>
            <div className="mt-10">
              <Link
                href="/rezervacija"
                className="text-sm text-muted-foreground underline decoration-rule underline-offset-[6px] transition-colors hover:text-foreground hover:decoration-foreground"
              >
                Nazad na termine
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
