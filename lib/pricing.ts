import { PRICES_RSD, PEAK_START_HOUR } from "./config";
import { belgradeHour, isBelgradeWeekend } from "./time";

export type PriceTier = "peak" | "offPeak";

/**
 * Which tariff a slot falls under.
 *
 * Derived from the Belgrade wall clock, never from the raw UTC hour — otherwise
 * a 17:00 Belgrade slot reads as 15:00 or 16:00 on the server depending on DST
 * and gets priced as off-peak.
 */
export function tierForSlot(startsAt: Date | string): PriceTier {
  if (isBelgradeWeekend(startsAt)) return "peak";
  return belgradeHour(startsAt) >= PEAK_START_HOUR ? "peak" : "offPeak";
}

/** Price in RSD for a slot starting at the given instant. */
export function priceForSlot(startsAt: Date | string): number {
  return PRICES_RSD[tierForSlot(startsAt)];
}

export const TIER_LABEL_SR: Record<PriceTier, string> = {
  peak: "Peak",
  offPeak: "Off-peak",
};
