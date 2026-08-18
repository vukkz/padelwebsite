/**
 * The tokens this device is holding, in localStorage.
 *
 * Client-only, deliberately no `server-only` twin: this is the whole of the
 * "account" in a product that has no accounts. A token here is a capability,
 * so the store is treated like one — pruned as soon as an entry stops being
 * useful, and never asked to hold anything about the person.
 *
 * Every read is defensive. localStorage throws in Safari private browsing, can
 * be full, and can contain whatever a previous version of this file wrote.
 */

const KEY = "padelhouse.bookings.v1";

/** Slots stay listed until they have started; the club keeps the history. */
const KEEP_AFTER_START_MS = 0;

export type StoredBooking = {
  token: string;
  /** ISO instant, so the list can prune itself without asking the server. */
  startsAt: string;
};

function read(): StoredBooking[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is StoredBooking =>
        !!b &&
        typeof b === "object" &&
        typeof (b as StoredBooking).token === "string" &&
        typeof (b as StoredBooking).startsAt === "string",
    );
  } catch {
    return [];
  }
}

function write(list: StoredBooking[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Private browsing, or a full quota. Losing the token costs a phone call,
    // which is the fallback the whole design already assumes — it must never
    // cost the booking that was just made.
  }
}

/** Drop anything already under way, then hand back what is still upcoming. */
export function loadOwnBookings(): StoredBooking[] {
  const cutoff = Date.now() - KEEP_AFTER_START_MS;
  const kept = read().filter((b) => {
    const t = Date.parse(b.startsAt);
    return Number.isFinite(t) && t > cutoff;
  });
  write(kept);
  return kept;
}

export function rememberBooking(entry: StoredBooking): void {
  const list = loadOwnBookings().filter((b) => b.token !== entry.token);
  list.push(entry);
  list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  write(list);
}

export function forgetBooking(token: string): void {
  write(loadOwnBookings().filter((b) => b.token !== token));
}
