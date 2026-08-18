-- Padel House — self-serve cancellation.
-- Run in the Supabase SQL Editor, or via `npx supabase db push` on a linked project.

-- ---------------------------------------------------------------------------
-- bookings.cancel_token
-- ---------------------------------------------------------------------------
-- There are no accounts, and the only identity captured at booking time is a
-- name and a phone number. Neither proves ownership: phone numbers are known to
-- other people and guessable in bulk, so "type your number to see your
-- bookings" would let anyone cancel anyone's court.
--
-- So the booking carries an unguessable token instead, handed to the device
-- that made the booking. Holding the token *is* the proof — the same shape as
-- an unsubscribe link. Losing it costs a phone call to the club, which is the
-- situation everyone is in today anyway.
--
-- Volatile default, so Postgres rewrites the table and evaluates gen_random_uuid()
-- once per existing row rather than stamping them all with one shared value.
alter table bookings
  add column if not exists cancel_token uuid not null default gen_random_uuid();

-- The token is the sole credential on the cancellation path and is looked up on
-- every request there, so: unique, and indexed.
create unique index if not exists bookings_cancel_token_uniq
  on bookings (cancel_token);

-- ---------------------------------------------------------------------------
-- Who cancelled, and when
-- ---------------------------------------------------------------------------
-- The day board already lists cancelled rows. These two say whether the player
-- released the slot themselves or staff did it at the desk — which is the
-- difference between "the system is working" and "we are still doing this by
-- phone", and the club cannot tell them apart without it.
alter table bookings
  add column if not exists cancelled_at timestamptz;

alter table bookings
  add column if not exists cancelled_by text
    check (cancelled_by is null or cancelled_by in ('customer', 'admin'));

-- Backfill: any row already cancelled before this migration was cancelled by
-- staff, since that was the only route that existed.
update bookings
  set cancelled_by = 'admin',
      cancelled_at = coalesce(cancelled_at, created_at)
  where status = 'cancelled' and cancelled_by is null;
