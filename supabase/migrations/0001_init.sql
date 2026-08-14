-- Padel House — initial schema.
-- Run in the Supabase SQL Editor, or via `npx supabase db push` on a linked project.

-- Needed for the exclusion constraint below: lets us mix an equality check on a
-- uuid with a range overlap check in the same GiST index.
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- courts
-- ---------------------------------------------------------------------------
create table if not exists courts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  display_order int  not null default 0
);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table if not exists bookings (
  id             uuid primary key default gen_random_uuid(),
  court_id       uuid not null references courts(id) on delete cascade,
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  customer_name  text not null,
  customer_phone text not null,
  price_rsd      int  not null check (price_rsd >= 0),
  status         text not null default 'confirmed'
                   check (status in ('confirmed', 'cancelled')),
  is_recurring   boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint bookings_time_order check (ends_at > starts_at)
);

-- THE double-booking guard.
--
-- One confirmed booking per court per start instant, enforced by the database
-- itself. Two concurrent requests for the same slot both reach the INSERT; the
-- second one fails with SQLSTATE 23505 and the API turns that into a clean
-- "termin je upravo rezervisan" message. There is deliberately no
-- check-then-insert in application code — that pattern has a race window
-- between the SELECT and the INSERT that no amount of UI logic can close.
--
-- Partial on status='confirmed' so cancelling a booking immediately frees the
-- slot for rebooking, while the cancelled row stays in the table as history.
create unique index if not exists bookings_court_start_confirmed_uniq
  on bookings (court_id, starts_at)
  where status = 'confirmed';

-- Defense in depth: the unique index only catches an *identical* starts_at.
-- A request crafted with an off-grid start (say 08:45) would slip past it and
-- still overlap the 08:00–09:30 booking. This exclusion constraint rejects any
-- overlap of the [starts_at, ends_at) range on the same court.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_no_overlap'
  ) then
    alter table bookings add constraint bookings_no_overlap
      exclude using gist (
        court_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status = 'confirmed');
  end if;
end $$;

create index if not exists bookings_starts_at_idx on bookings (starts_at);
create index if not exists bookings_court_time_idx on bookings (court_id, starts_at);

-- ---------------------------------------------------------------------------
-- blocked_slots  (stalni termini + održavanje)
-- ---------------------------------------------------------------------------
create table if not exists blocked_slots (
  id            uuid primary key default gen_random_uuid(),
  court_id      uuid not null references courts(id) on delete cascade,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  reason        text not null,
  -- Groups the occurrences of one weekly series so the owner can manage and
  -- delete "Utorkom u 15:30, sep–dec" as a single thing instead of 14 loose
  -- rows. Null for one-off blocks.
  recurrence_id uuid,
  created_at    timestamptz not null default now(),
  constraint blocked_slots_time_order check (ends_at > starts_at)
);

-- A court can't be blocked twice for the same instant.
create unique index if not exists blocked_slots_court_start_uniq
  on blocked_slots (court_id, starts_at);

create index if not exists blocked_slots_court_time_idx
  on blocked_slots (court_id, starts_at);
create index if not exists blocked_slots_recurrence_idx
  on blocked_slots (recurrence_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
-- Every query in this app runs server-side with the service_role key, which
-- bypasses RLS. Enabling RLS with no policies at all means the anon and
-- authenticated keys can read nothing — even if one ever leaked into a client
-- bundle, customer names and phone numbers stay unreachable.
alter table courts        enable row level security;
alter table bookings      enable row level security;
alter table blocked_slots enable row level security;
