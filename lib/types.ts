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
  /** Only set for blocked cells — e.g. "Stalni termin — firma Delta". */
  blockReason?: string;
};
