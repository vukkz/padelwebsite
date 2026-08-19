import "server-only";
import { serverClient } from "./supabase";
import { generateSlots } from "./slots";
import { belgradeDayBounds } from "./time";
import type { BlockedSlot, Booking, Court, PublicSlotCell } from "./types";

export type CourtAvailability = {
  court: Court;
  cells: PublicSlotCell[];
};

export type DayAvailability = {
  dateStr: string;
  courts: CourtAvailability[];
  freeCount: number;
};

/**
 * Availability for one Belgrade calendar day, per court.
 *
 * Reads confirmed bookings and blocked slots for the day in two queries, then
 * resolves every court × slot cell locally. Cancelled bookings are filtered out
 * server-side so a cancelled slot shows as free — matching the partial unique
 * index, which also ignores them.
 */
export async function getDayAvailability(dateStr: string): Promise<DayAvailability> {
  const db = serverClient();
  const { from, to } = belgradeDayBounds(dateStr);
  const slots = generateSlots(dateStr);
  const now = Date.now();

  const [courtsRes, bookingsRes, blocksRes] = await Promise.all([
    db.from("courts").select("*").order("display_order"),
    db
      .from("bookings")
      .select("id, court_id, starts_at, status")
      .eq("status", "confirmed")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString()),
    db
      .from("blocked_slots")
      .select("id, court_id, starts_at, reason")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString()),
  ]);

  if (courtsRes.error) throw courtsRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (blocksRes.error) throw blocksRes.error;

  const courts = (courtsRes.data ?? []) as Court[];
  const key = (courtId: string, iso: string) => `${courtId}|${new Date(iso).getTime()}`;

  const taken = new Set(
    (bookingsRes.data ?? []).map((b) => key(b.court_id as string, b.starts_at as string)),
  );
  const blocked = new Map(
    (blocksRes.data ?? []).map((b) => [
      key(b.court_id as string, b.starts_at as string),
      b.reason as string,
    ]),
  );

  let freeCount = 0;

  const courtsWithCells: CourtAvailability[] = courts.map((court) => ({
    court,
    cells: slots.map((slot): PublicSlotCell => {
      const k = key(court.id, slot.startsAt.toISOString());
      // Only *whether* the slot is blocked crosses into the public payload,
      // never the block's `reason`. That reason is free text an admin types
      // and it routinely names the person holding the standing slot — the
      // recurring manager's own placeholder is "Stalni termin — Marko
      // Petrović". This object is serialised to the browser on a page anyone
      // can open, so carrying the reason here would publish a customer's name
      // to the world whether or not the grid ever painted it. The grid shows
      // the generic state label instead; `blocked` still maps to the reason
      // for admin-side callers.
      const isBlocked = blocked.has(k);

      let status: PublicSlotCell["status"];
      if (slot.startsAt.getTime() <= now) status = "past";
      else if (isBlocked) status = "blocked";
      else if (taken.has(k)) status = "taken";
      else {
        status = "free";
        freeCount++;
      }

      return {
        courtId: court.id,
        time: slot.time,
        startsAt: slot.startsAt.toISOString(),
        endsAt: slot.endsAt.toISOString(),
        priceRsd: slot.priceRsd,
        status,
      };
    }),
  }));

  return { dateStr, courts: courtsWithCells, freeCount };
}

/**
 * The first day in `days` that still has a bookable slot, with its availability.
 *
 * Used when someone opens /rezervacija without a date. By late afternoon every
 * slot for today is in the past, and landing on a grid of greyed-out cells makes
 * a working booking system look broken — so we open on the next day that can
 * actually be booked. Today is still one tap away in the date strip.
 *
 * Short-circuits on the first hit, which in practice is day 0 or 1. Falls back
 * to the first day if the whole lookahead window is full.
 */
export async function firstOpenDay(
  days: readonly string[],
  lookahead = 7,
): Promise<DayAvailability> {
  const [first, ...rest] = days;
  const firstDay = await getDayAvailability(first);
  if (firstDay.freeCount > 0) return firstDay;

  for (const dateStr of rest.slice(0, lookahead)) {
    const day = await getDayAvailability(dateStr);
    if (day.freeCount > 0) return day;
  }

  return firstDay;
}

/** Admin day view: full booking rows including customer contact details. */
export async function getAdminDay(dateStr: string): Promise<{
  courts: Court[];
  bookings: Booking[];
  blocks: BlockedSlot[];
}> {
  const db = serverClient();
  const { from, to } = belgradeDayBounds(dateStr);

  const [courtsRes, bookingsRes, blocksRes] = await Promise.all([
    db.from("courts").select("*").order("display_order"),
    db
      .from("bookings")
      .select("*")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at"),
    db
      .from("blocked_slots")
      .select("*")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at"),
  ]);

  if (courtsRes.error) throw courtsRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (blocksRes.error) throw blocksRes.error;

  return {
    courts: (courtsRes.data ?? []) as Court[],
    bookings: (bookingsRes.data ?? []) as Booking[],
    blocks: (blocksRes.data ?? []) as BlockedSlot[],
  };
}
