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
      const blockReason = blocked.get(k);

      let status: PublicSlotCell["status"];
      if (slot.startsAt.getTime() <= now) status = "past";
      else if (blockReason) status = "blocked";
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
        ...(blockReason ? { blockReason } : {}),
      };
    }),
  }));

  return { dateStr, courts: courtsWithCells, freeCount };
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
