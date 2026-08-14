import { SLOT_START_TIMES } from "./config";
import { priceForSlot, tierForSlot, type PriceTier } from "./pricing";
import { belgradeSlotToInstant, slotEnd } from "./time";

export type Slot = {
  /** Belgrade wall-clock start, e.g. "15:30". */
  time: string;
  startsAt: Date;
  endsAt: Date;
  priceRsd: number;
  tier: PriceTier;
};

/** The full slot grid for one Belgrade calendar day. */
export function generateSlots(dateStr: string): Slot[] {
  return SLOT_START_TIMES.map((time) => {
    const startsAt = belgradeSlotToInstant(dateStr, time);
    return {
      time,
      startsAt,
      endsAt: slotEnd(startsAt),
      priceRsd: priceForSlot(startsAt),
      tier: tierForSlot(startsAt),
    };
  });
}

/**
 * Does this instant sit exactly on the published slot grid?
 *
 * The unique index only catches *identical* start instants, so an off-grid
 * request like 08:45 would slip past it and overlap the 08:00 booking. The
 * exclusion constraint would still reject it, but rejecting it here gives a
 * clearer error and keeps garbage out of the table.
 */
export function isValidSlotStart(startsAt: Date, dateStr: string): boolean {
  const target = startsAt.getTime();
  return generateSlots(dateStr).some((s) => s.startsAt.getTime() === target);
}

/** Look up the canonical slot for an instant, or null if it is off-grid. */
export function findSlot(startsAt: Date, dateStr: string): Slot | null {
  const target = startsAt.getTime();
  return generateSlots(dateStr).find((s) => s.startsAt.getTime() === target) ?? null;
}
