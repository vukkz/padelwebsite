import { addDays, addMinutes, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { srLatn } from "date-fns/locale";
import { SLOT_MINUTES, TIMEZONE } from "./config";

/**
 * The ONLY place timezone math happens.
 *
 * The server runs in UTC (Vercel) while the club thinks in Belgrade wall-clock
 * time, which is UTC+1 in winter and UTC+2 in summer. Every conversion between
 * "18. avgust u 15:30" and an absolute instant goes through this module so the
 * DST boundary in late October can't silently shift a recurring 15:30 slot to 14:30.
 *
 * Convention: `dateStr` is always a Belgrade calendar day as "yyyy-MM-dd",
 * `time` is always Belgrade wall-clock "HH:mm".
 */

/** Belgrade wall-clock date + time -> absolute instant. */
export function belgradeSlotToInstant(dateStr: string, time: string): Date {
  return fromZonedTime(`${dateStr}T${time}:00`, TIMEZONE);
}

/** Absolute instant -> formatted string in Belgrade time (Serbian latinica). */
export function formatBelgrade(instant: Date | string, fmt: string): string {
  return formatInTimeZone(new Date(instant), TIMEZONE, fmt, { locale: srLatn });
}

/** The Belgrade calendar day an instant falls on, as "yyyy-MM-dd". */
export function belgradeDateStr(instant: Date | string): string {
  return formatInTimeZone(new Date(instant), TIMEZONE, "yyyy-MM-dd");
}

/** Today in Belgrade, as "yyyy-MM-dd". */
export function belgradeToday(): string {
  return belgradeDateStr(new Date());
}

/** Belgrade wall-clock hour (0–23) of an instant. */
export function belgradeHour(instant: Date | string): number {
  return Number(formatInTimeZone(new Date(instant), TIMEZONE, "H"));
}

/** Belgrade day of week, 0 = Sunday … 6 = Saturday. */
export function belgradeDayOfWeek(instant: Date | string): number {
  return Number(formatInTimeZone(new Date(instant), TIMEZONE, "i")) % 7;
}

/** True if the instant falls on a Saturday or Sunday in Belgrade. */
export function isBelgradeWeekend(instant: Date | string): boolean {
  const dow = belgradeDayOfWeek(instant);
  return dow === 0 || dow === 6;
}

/** `count` consecutive Belgrade calendar days starting at `from` (default today). */
export function nextDays(count: number, from?: string): string[] {
  const start = parseDateStr(from ?? belgradeToday());
  return Array.from({ length: count }, (_, i) =>
    formatDateStr(addDays(start, i)),
  );
}

/**
 * Parse "yyyy-MM-dd" into a *calendar-only* Date used for day arithmetic.
 * Deliberately not timezone-converted — it exists only so addDays/getDay have
 * something to work with. Never persist or compare it against a real instant.
 */
export function parseDateStr(dateStr: string): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date());
}

export function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Day of week for a calendar day string, 0 = Sunday … 6 = Saturday. */
export function dayOfWeekForDateStr(dateStr: string): number {
  return parseDateStr(dateStr).getDay();
}

/** End instant of a slot that starts at `startsAt`. */
export function slotEnd(startsAt: Date): Date {
  return addMinutes(startsAt, SLOT_MINUTES);
}

/** "15:30" for the given instant, in Belgrade time. */
export function belgradeTimeStr(instant: Date | string): string {
  return formatInTimeZone(new Date(instant), TIMEZONE, "HH:mm");
}

/** "15:30 – 17:00" for a slot. */
export function slotRangeLabel(startsAt: Date | string, endsAt: Date | string): string {
  return `${belgradeTimeStr(startsAt)} – ${belgradeTimeStr(endsAt)}`;
}

/** "uto, 18.08." — the day-chip label on the booking page. */
export function shortDayLabel(dateStr: string): { weekday: string; day: string } {
  const instant = belgradeSlotToInstant(dateStr, "12:00");
  return {
    weekday: formatBelgrade(instant, "EEE"),
    day: formatBelgrade(instant, "d.MM."),
  };
}

/** "utorak, 18. avgust 2026." — used on confirmations and the admin header. */
export function longDateLabel(dateStr: string): string {
  return formatBelgrade(belgradeSlotToInstant(dateStr, "12:00"), "EEEE, d. MMMM yyyy.");
}

/** Start/end instants bounding a Belgrade calendar day — for range queries. */
export function belgradeDayBounds(dateStr: string): { from: Date; to: Date } {
  const from = belgradeSlotToInstant(dateStr, "00:00");
  const to = fromZonedTime(
    `${formatDateStr(addDays(parseDateStr(dateStr), 1))}T00:00:00`,
    TIMEZONE,
  );
  return { from, to };
}

/** Convert an instant to a Date whose *local* fields read as Belgrade time. */
export function toBelgrade(instant: Date | string): Date {
  return toZonedTime(new Date(instant), TIMEZONE);
}

export const WEEKDAY_NAMES_SR = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
] as const;

/** Format an RSD amount the Serbian way: "4.000 RSD". */
export function formatRsd(amount: number): string {
  return `${amount.toLocaleString("sr-RS")} RSD`;
}
