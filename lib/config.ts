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

  // TODO(pitch): swap in the exact street address before the demo.
  // Their address is not published anywhere we could find — only the phone number is.
  address: "Beograd, Srbija",
  addressNote: "Tačna adresa — dopuniti pre prezentacije",

  // The Maps embed resolves by search query, so it points at the right pin
  // even before the exact street address is filled in above.
  mapsQuery: "Padel House Beograd",

  hoursLabel: "Svakog dana 08:00 – 17:00",
  email: "info@padelhouse.rs", // TODO(pitch): confirm
} as const;

export const TIMEZONE = "Europe/Belgrade";

/** Every booking is one 90-minute block. */
export const SLOT_MINUTES = 90;

/**
 * Slot start times in Belgrade wall-clock time.
 * 90 min does not tile evenly into 08:00–18:00, so the last block runs 15:30–17:00.
 * Adding evening slots is a one-line change here — pricing adapts automatically.
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

export const COURT_NAMES = ["Teren 1", "Teren 2", "Teren 3"] as const;
