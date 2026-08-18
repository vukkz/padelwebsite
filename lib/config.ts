/**
 * Single source of truth for club details and booking rules.
 * Everything the club might want changed before/after the pitch lives here.
 */

export const CLUB = {
  name: "Padel House",
  city: "Beograd",

  // Confirmed from the club's Instagram profile.
  phone: "+381 61 1417 330",
  phoneHref: "tel:+381611417330",
  instagram: "https://www.instagram.com/padelhouse.beograd/",
  instagramHandle: "@padelhouse.beograd",

  // From their Google Maps listing (4.9★). Along Kalemegdan — which is where
  // the "zelena zona" in their Instagram bio comes from.
  // TODO(pitch): confirm with the club; "BB" means the building has no number.
  address: "Tadeuša Košćuška BB",
  addressArea: "Kalemegdan, 11000 Beograd",

  // The embed resolves by search query, so the pin stays correct even if the
  // street line above is edited.
  mapsQuery: "Padel House Beograd",

  /**
   * The venue is open 08–18. The padel grid is a separate thing: six 90-minute
   * slots that tile from 08:00 and finish at 17:00, so the café outlives the
   * last match by an hour. Events run past closing by arrangement.
   */
  hoursLabel: "Svakog dana 08:00 – 18:00",
  hoursNote: "Poslednji padel termin počinje u 15:30. Za događaje radimo i duže.",
  email: "info@padelhouse.rs", // TODO(pitch): confirm

  /** Their own campaign line. The whole site is built around it. */
  tagline: "Nije samo padel.",
  rating: { score: "4,9", count: 20, source: "Google" },
} as const;

/**
 * Things reviewers actually bring up unprompted. Kept here because they are
 * conversion details for the café crowd, not decoration.
 */
export const GOOD_TO_KNOW = [
  "Parking u blizini",
  "Deca dobrodošla",
  "Psi dobrodošli",
  "Kroasani i doručak",
] as const;

/**
 * Verbatim Google reviews, left in the language they were written in — a
 * translated testimonial stops being a testimonial. Note that every one of
 * these is about the coffee and the setting, not the padel.
 *
 * `lang` is not decoration: the document is sr-Latn-RS, so without a per-quote
 * override a screen reader speaks these English sentences with Serbian
 * phonemes and they come out as noise (WCAG 3.1.2, Language of Parts). Set it
 * on every entry, and change it if a Serbian review is ever added.
 *
 * TODO(pitch): refresh from the Google profile before the demo.
 */
export const REVIEWS = [
  {
    quote:
      "Best place at the very unique location. Spotless clean, cozy atmosphere and top coffee! Very helpful team and welcoming for kids and dogs!",
    author: "Valeriya Yunnikova",
    meta: "Local Guide · 27 recenzija",
    lang: "en",
  },
  {
    quote:
      "Nice coffee spot in a beautiful historic setting near Kalemegdan. Chill vibe, good service, and a great place to take a break in the city.",
    author: "Damjana Kisic",
    meta: "Local Guide · 20 recenzija",
    lang: "en",
  },
  {
    quote:
      "Very pleasant and peaceful place, beautiful interior as well as exterior, staff always polite, professional and in a good mood. I have nothing to say about the coffee except that it is perfect.",
    author: "Nemanja Pavlović",
    meta: "Local Guide · 43 recenzije",
    lang: "en",
  },
  {
    quote: "Absolutely hidden gem. Quiet, clean, wide choice of coffee.",
    author: "Dávid Vaskor-Dely",
    meta: "8 recenzija",
    lang: "en",
  },
  {
    quote:
      "Wonderful place, heartwarming atmosphere with a great coffee and croissants! Barista talkative and friendly.",
    author: "Alberto Balsalm",
    meta: "3 recenzije",
    lang: "en",
  },
  {
    quote: "My favourite place in the city so far! Great coffee and atmosphere.",
    author: "Polina Kabakova",
    meta: "3 recenzije",
    lang: "en",
  },
] as const;

/**
 * Events the club has actually run, not event categories.
 *
 * The earlier list was "Venčanja · Firmske proslave · Rođendani · Turniri" —
 * true of every venue in Belgrade, and it read as keyword filler. These are
 * named, dated things this venue put on, which prove the capability instead of
 * asserting it. Sourced from the club's own Instagram (@padelhouse.beograd).
 *
 * TODO(pitch): confirm names, partners and rough dates with the club before
 * the demo. These are read off their public posts, not given to us.
 */
export const EVENTS = [
  {
    name: "Oaza",
    meta: "vol. 1",
    note: "Bašta i lounge na travnjaku ispod bedema.",
  },
  {
    name: "Padel & Pour",
    meta: "Bottone × Grace Cocktail",
    note: "Koktel večer na terenu, u saradnji sa barovima iz grada.",
  },
  {
    name: "Rođendan pod zvezdama",
    meta: "Bioskop na otvorenom",
    note: "Projekcija i večera ispod osvetljenog bedema.",
  },
  {
    name: "Žurka bez telefona",
    meta: "Digital detox",
    note: "Prva phone-free žurka u Beogradu.",
  },
  {
    name: "Venčanja",
    meta: "Travnjak i terasa",
    note: "Ceremonija i večera u šancu tvrđave.",
  },
  {
    name: "Dečji rođendani",
    meta: "Terasa",
    note: "Deca i psi su dobrodošli, i to gosti pominju sami.",
  },
] as const;

export const TIMEZONE = "Europe/Belgrade";

/** Every booking is one 90-minute block. */
export const SLOT_MINUTES = 90;

/**
 * Padel slot start times in Belgrade wall-clock time.
 *
 * The venue is open 08:00–18:00, but 90 minutes doesn't tile evenly into that,
 * so the six slots finish at 17:00 and the café keeps going for the last hour.
 * Adding slots is a one-line change here — pricing adapts automatically.
 */
export const SLOT_START_TIMES = [
  "08:00",
  "09:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
] as const;

/** Price per 90-minute slot, in RSD. */
export const PRICES_RSD = {
  offPeak: 4000,
  peak: 5000,
} as const;

/**
 * Peak rules: weekdays from this hour onward are peak; weekends are peak all day.
 * With the current 08:00–17:00 grid no weekday slot reaches 17:00, so in practice
 * peak pricing applies Saturday and Sunday. Extending SLOT_START_TIMES into the
 * evening activates weekday peak with no code change.
 */
export const PEAK_START_HOUR = 17;

/** How far ahead the public booking page lets people book. */
export const BOOKING_DAYS_AHEAD = 14;

/**
 * Free cancellation window, in hours before the slot starts.
 *
 * Stated in copy on three surfaces and enforced server-side on the cancellation
 * path. It lived only as the literal "4" inside two sentences before there was
 * anything to enforce it; changing the policy meant finding every sentence.
 *
 * Careful when changing it: the surrounding copy reads "{n} sata", which is the
 * Serbian paucal and is correct for 2–4. At 5 and above it has to become
 * "sati", and at 1 "sat". Every call site is a plain sentence, not a plural
 * rule, so the word has to be changed by hand alongside the number.
 */
export const CANCELLATION_HOURS = 4;

export const COURT_NAMES = ["Teren 1", "Teren 2", "Teren 3"] as const;
