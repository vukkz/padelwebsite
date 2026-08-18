import type { MetadataRoute } from "next";

/**
 * Nothing here is indexable, and that is a product decision rather than a
 * technical one.
 *
 * This is a spec pitch. The club has not seen it, has not commissioned it, and
 * does not know it exists. Left open to crawlers it becomes a working booking
 * system carrying a real business's name: someone searching "Padel House
 * Beograd rezervacija" lands here, types their real name and phone number,
 * gets an on-screen confirmation, and turns up at a court nobody reserved. The
 * club takes the complaint for something they never agreed to.
 *
 * Pair this with Vercel Deployment Protection — robots.txt is a request that
 * well-behaved crawlers honour, not access control, and it does nothing about
 * a URL someone shares.
 *
 * Remove this file, and the `robots` block in app/layout.tsx, on the day the
 * club commissions the work and the site goes up under their own domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
