import { addDays } from "date-fns";
import { belgradeSlotToInstant, formatDateStr, parseDateStr, slotEnd } from "./time";

export type Occurrence = {
  dateStr: string;
  startsAt: Date;
  endsAt: Date;
};

/**
 * Every occurrence of "weekday at time" between two dates, inclusive.
 *
 * The expansion walks Belgrade *calendar days* and converts each one to an
 * instant separately. Adding 7×24h to a UTC timestamp instead would drift by an
 * hour the moment the series crosses the October DST switch, quietly moving a
 * 15:30 stalni termin to 14:30 for the rest of the winter.
 */
export function expandWeekly(
  fromDateStr: string,
  toDateStr: string,
  weekday: number,
  time: string,
  limit = 260,
): Occurrence[] {
  const from = parseDateStr(fromDateStr);
  const to = parseDateStr(toDateStr);
  if (to < from) return [];

  let cursor = from;
  while (cursor.getDay() !== weekday) cursor = addDays(cursor, 1);

  const out: Occurrence[] = [];
  while (cursor <= to && out.length < limit) {
    const dateStr = formatDateStr(cursor);
    const startsAt = belgradeSlotToInstant(dateStr, time);
    out.push({ dateStr, startsAt, endsAt: slotEnd(startsAt) });
    cursor = addDays(cursor, 7);
  }
  return out;
}

/** A weekly series, reassembled from its individual blocked_slots rows. */
export type Series = {
  recurrenceId: string;
  courtId: string;
  courtName: string;
  reason: string;
  weekday: number;
  time: string;
  firstDate: string;
  lastDate: string;
  total: number;
  upcoming: number;
  occurrences: Array<{ id: string; dateStr: string; startsAt: string; isPast: boolean }>;
};
