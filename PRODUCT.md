# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — the player booking a court.** Someone in Belgrade who wants a padel court, booking on a phone. They book a whole 90-minute court (not a per-player seat), up to 14 days ahead, and want confirmation on screen without calling anyone. When the public site and the admin panel compete for effort, this user wins.

**Secondary — the club running the schedule.** Staff and the owner working the day board and recurring series at `/admin`, behind a single shared password with no per-user accounts. Used at the venue, on a phone or a laptop.

Also present at the venue but not transacting: café guests and event clients who never book a court. The site speaks to them; they are not users of the booking system.

## Product Purpose

A public site and booking system for **Padel House Beograd** — a padel court, café, and event space in the moat of the Belgrade Fortress at Kalemegdan.

Taking bookings is not the hard part. **Tracking** them is. The club runs recurring bookings, one-off bookings, and cancellations across three courts through a notebook and a phone. The admin panel exists to replace that: a recurring series is created once for an entire period ("Tuesdays at 15:30, September–December"), then extended or deleted in one click rather than slot by slot, with the exact date list and existing conflicts shown before anything is written.

Success: the club abandons the notebook, and a player books without calling.

## Positioning

**This is a spec pitch.** It has not been presented to the club, and the club has not commissioned it. Nothing in this project may claim or imply that Padel House is a customer, or that they have seen, approved, or requested any of it.

The product's position is the club's own campaign line — *"Nije samo padel."* The site sells the place (court, café, fortress setting), not court time alone. The capability a neighboring booking tool could not truthfully copy is recurring-series management as a first-class object; generic tools handle repeat bookings slot by slot.

## Operating Context

- Three floodlit courts, a café terrace, and a lawn under the fortress ramparts. Open daily 08:00–18:00.
- Six 90-minute padel slots tile from 08:00; the last starts 15:30 and ends 17:00, so the café outlives the final match by an hour.
- Events run past closing by arrangement. They are handled through admin **blocked slots**, never through bookings.
- The club thinks in Belgrade wall-clock time; the server runs UTC. A 15:30 recurring slot stays 15:30 across the October DST change.
- Payment is taken on site. Free cancellation up to 4 hours before the slot.
- Rackets and balls are rented at the venue.

## Capabilities and Constraints

Built: public landing page, `/rezervacija` booking grid (14 days ahead × 3 courts × 6 slots), booking API, `/admin` day board, `/admin/stalni-termini` recurring-series management, and an owner email notification per booking.

- Next.js App Router, TypeScript, Tailwind v4, Supabase (Postgres), Resend, Vercel.
- **Double-booking is prevented in the database, never in the UI.** A partial unique index plus a GiST exclusion constraint; the API writes directly and translates `23505` / `23P01` into HTTP 409. Never introduce check-then-write on the booking path.
- Known limitation: blocked-slot checking is read-then-check and is *not* race-safe against an admin blocking a slot at the same moment. The contested path — player against player — is fully protected.
- All database access is server-side with the `service_role` key. RLS is on with zero policies, so guest names and phone numbers stay unreachable even if a client key leaks. `lib/supabase.ts` and `lib/email.ts` are `server-only`.
- Admin auth is one shared password plus an HMAC-signed httpOnly cookie; every Server Action re-checks the session independently.
- **Language: Serbian, Latin script (`sr-Latn-RS`).** No English or Cyrillic version is planned. Any display face must carry full `latin-ext` so č ć š ž đ render rather than falling back mid-word.
- Pricing: 4.000 RSD off-peak (weekdays), 5.000 RSD peak (weekends, all day). The peak rule is configurable — adding evening slots activates weekday peak with no code change.
- Club facts, slot times, and prices are centralized in `lib/config.ts`. Change them there, not in components.

## Brand Commitments

- Name: **Padel House**, Beograd.
- The tagline **"Nije samo padel."** is the club's own line. It is not placeholder copy to be improved.
- **Fraunces** (serif) carries headlines — it follows the club's serif logo and has full `latin-ext` coverage. **Barlow** carries body copy and the entire booking and admin interface. The serif is the brand's voice; the sans is the interface.
- The palette is taken from the physical venue: dark green from the logo, **terracotta from the court surface** as the accent, beige and warm wood. The accent appears at most once per screen, on the thing to be clicked.
- Real photography of the actual venue lives in `public/photos` (court, terrace, wedding, cinema night, pavilion lawn, rackets). Originals in `img/`, processed by `scripts/prepare-photos.mjs`.
- `@padelhouse.beograd` on Instagram is the club's live channel.

## Evidence on Hand

**Real, and usable:**
- Six verbatim Google reviews in `lib/config.ts`, each left in the language it was written in — a translated testimonial stops being a testimonial.
- Rating 4,9 from 20 Google reviews.
- The club's phone number and Instagram handle, taken from their own profile.
- The venue photography listed above.

Worth knowing: nearly every real review praises the coffee and the setting rather than the padel, and most are written in English. That is why the site leads with the venue.

**Unconfirmed — must not be presented as fact, and must not be embellished:**
- Prices (4.000 / 5.000 RSD) are a market estimate, not the club's price list.
- Address "Tadeuša Košćuška BB" is from their Google listing ("BB" = building has no number).
- Club email `info@padelhouse.rs`.
- Court names `Teren 1 / 2 / 3`.
- The "95% of traffic is phones" figure asserted in a code comment is an assumption, not measured data.

**Does not exist:** customer logos, case studies, press coverage, booking volumes, or any usage metric. Do not invent them.

## Product Principles

1. **The venue is the product; padel is the entry point.** Sell the place — court, café, fortress — not court time alone.
2. **Booking never requires a phone call**, and confirms on screen immediately.
3. **Availability is only as true as the database makes it.** Belgrade wall-clock everywhere; never show an availability guarantee the schema doesn't enforce.
4. **The club's own words outrank ours** — their tagline, their reviews, their language.
5. **Unconfirmed facts stay visibly unconfirmed.** This is a pitch; one fabricated detail caught in the room ends it.

## Accessibility & Inclusion

No external standard is contractually required, but the current implementation deliberately holds **AA contrast**, including white text over photography, with measured ratios and their corrections documented in code. Preserve that bar rather than rediscovering it. Mobile is the dominant context, and the booking action must stay reachable without scrolling on a phone.
