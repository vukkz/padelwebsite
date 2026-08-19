export type Court = {
  id: string;
  name: string;
  display_order: number;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  court_id: string;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_phone: string;
  price_rsd: number;
  status: BookingStatus;
  is_recurring: boolean;
  created_at: string;
  /** Unguessable capability token — the only proof of ownership that exists. */
  cancel_token: string;
  cancelled_at: string | null;
  cancelled_by: "customer" | "admin" | null;
};

/**
 * One booking as the device that made it is allowed to see it.
 *
 * Deliberately not a `Booking`: the token buys a view of *this* reservation, so
 * the phone number that was typed into the form is not echoed back. Nothing on
 * the cancellation screen needs it, and a token in a shared screenshot should
 * not hand over a phone number with it.
 */
export type OwnBooking = {
  token: string;
  courtName: string;
  /** "utorak, 18. avgust 2026." */
  dateLabel: string;
  /** "15:30 – 17:00" */
  timeRange: string;
  priceLabel: string;
  customerName: string;
  startsAt: string;
  status: BookingStatus;
  /** False once the free-cancellation window has closed, or already cancelled. */
  cancellable: boolean;
};

export type BlockedSlot = {
  id: string;
  court_id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  recurrence_id: string | null;
  created_at: string;
};

/** What the public grid renders for a single court × slot cell. */
export type SlotStatus = "free" | "taken" | "blocked" | "past";

export type PublicSlotCell = {
  courtId: string;
  time: string;
  startsAt: string;
  endsAt: string;
  priceRsd: number;
  status: SlotStatus;
};
