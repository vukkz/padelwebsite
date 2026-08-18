import "server-only";
import { serverClient } from "./supabase";
import { CANCELLATION_HOURS } from "./config";
import {
  belgradeDateStr,
  formatRsd,
  longDateLabel,
  slotRangeLabel,
} from "./time";
import type { OwnBooking } from "./types";

/**
 * The customer-facing cancellation path.
 *
 * One module owns the rule because three callers need it — the token page, the
 * "your bookings" list, and the cancel endpoint — and a cancellation window
 * that three files each decide for themselves is a window that closes at three
 * different times.
 *
 * The token is the whole authorisation model. Every function here takes one and
 * nothing else; there is no "and also check the phone matches" fallback, because
 * a fallback that accepts a phone number is the thing the token exists to avoid.
 */

/** How many tokens one lookup may ask about. */
const MAX_TOKENS = 24;

/** A uuid, and nothing that could be a Postgres expression. */
const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCancelToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_RE.test(value);
}

/** The instant after which a slot can no longer be released online. */
export function cancellationDeadline(startsAt: Date | string): Date {
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  return new Date(start.getTime() - CANCELLATION_HOURS * 60 * 60 * 1000);
}

export function withinCancellationWindow(startsAt: Date | string, now = Date.now()): boolean {
  return cancellationDeadline(startsAt).getTime() > now;
}

type Row = {
  cancel_token: string;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  price_rsd: number;
  status: "confirmed" | "cancelled";
  courts: { name: string } | { name: string }[] | null;
};

const SELECT = "cancel_token, starts_at, ends_at, customer_name, price_rsd, status, courts(name)";

function present(row: Row): OwnBooking {
  const court = Array.isArray(row.courts) ? row.courts[0] : row.courts;
  return {
    token: row.cancel_token,
    courtName: court?.name ?? "Teren",
    dateLabel: longDateLabel(belgradeDateStr(row.starts_at)),
    timeRange: slotRangeLabel(row.starts_at, row.ends_at),
    priceLabel: formatRsd(row.price_rsd),
    customerName: row.customer_name,
    startsAt: row.starts_at,
    status: row.status,
    cancellable: row.status === "confirmed" && withinCancellationWindow(row.starts_at),
  };
}

/** One booking, by token. Null when the token matches nothing. */
export async function findByToken(token: string): Promise<OwnBooking | null> {
  if (!isCancelToken(token)) return null;

  const { data, error } = await serverClient()
    .from("bookings")
    .select(SELECT)
    .eq("cancel_token", token)
    .maybeSingle<Row>();

  if (error) {
    console.error("[cancellation] token lookup failed", error);
    return null;
  }
  return data ? present(data) : null;
}

/**
 * The bookings a device holds tokens for, upcoming only and newest slot last.
 *
 * Unknown tokens are dropped rather than reported. A device that kept a token
 * for a booking since purged learns nothing from the difference, and neither
 * does anyone probing with tokens they guessed.
 */
export async function findManyByToken(tokens: string[]): Promise<OwnBooking[]> {
  const clean = [...new Set(tokens.filter(isCancelToken))].slice(0, MAX_TOKENS);
  if (clean.length === 0) return [];

  const { data, error } = await serverClient()
    .from("bookings")
    .select(SELECT)
    .in("cancel_token", clean)
    .eq("status", "confirmed")
    // Slots that have already started are history to the player; the club keeps
    // them on the day board.
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .returns<Row[]>();

  if (error) {
    console.error("[cancellation] bulk lookup failed", error);
    return [];
  }
  return (data ?? []).map(present);
}

export type CancelOutcome =
  | { ok: true; booking: OwnBooking }
  | { ok: false; reason: "not-found" | "too-late" | "already-cancelled" | "error"; booking?: OwnBooking };

/**
 * Release a slot, by token.
 *
 * The window is re-checked here and not merely in the UI: the deadline the
 * client rendered may be minutes old by the time the button is pressed, and the
 * client is not a source of truth about the clock in any case.
 *
 * The write is guarded on `status = 'confirmed'`, so two taps on a flaky
 * connection cannot both report success — the second matches no row. Because
 * both booking constraints are partial on that same status, the slot is
 * bookable again the instant this lands.
 */
export async function cancelByToken(token: string): Promise<CancelOutcome> {
  const booking = await findByToken(token);
  if (!booking) return { ok: false, reason: "not-found" };
  if (booking.status === "cancelled") return { ok: false, reason: "already-cancelled", booking };
  if (!withinCancellationWindow(booking.startsAt)) {
    return { ok: false, reason: "too-late", booking };
  }

  const { data, error } = await serverClient()
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: "customer",
    })
    .eq("cancel_token", token)
    .eq("status", "confirmed")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[cancellation] update failed", error);
    return { ok: false, reason: "error", booking };
  }
  // No row matched: something cancelled it between the read above and here.
  if (!data) return { ok: false, reason: "already-cancelled", booking };

  return { ok: true, booking: { ...booking, status: "cancelled", cancellable: false } };
}
