-- AirFly database schema
-- Run in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles  (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- airports  (IATA dictionary, used for search + Mapbox coordinates)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.airports (
  code text primary key,               -- IATA code e.g. 'JFK'
  city text not null,
  name text not null,
  country text not null,
  region text not null,
  lat double precision not null,
  lng double precision not null
);

-- The network went worldwide, so region moved from the original
-- USA/Asia/UK/Other set to proper continents. Existing rows are migrated
-- before the new constraint is applied, so re-running this file on a
-- project seeded with the old values succeeds rather than failing the
-- check. Dubai moves to Middle East; the European rail/coach stations
-- previously filed under 'Other'/'UK' become Europe.
do $$
begin
  alter table public.airports drop constraint airports_region_check;
exception when undefined_object then null;
end $$;

update public.airports set region = 'North America' where region = 'USA';
update public.airports set region = 'Europe' where region in ('UK', 'Other');
update public.airports set region = 'Middle East' where code in ('DXB', 'DOH', 'AUH', 'RUH', 'TLV');

alter table public.airports add constraint airports_region_check
  check (region in ('North America', 'South America', 'Europe', 'Africa', 'Asia', 'Middle East', 'Oceania'));

-- ─────────────────────────────────────────────────────────────────────────
-- airlines
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.airlines (
  code text primary key,
  name text not null,
  color text not null default '#f97316',
  logo_url text
);

-- ─────────────────────────────────────────────────────────────────────────
-- flights  (mock scheduled flights)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_number text not null,
  airline_code text not null references public.airlines (code),
  from_code text not null references public.airports (code),
  to_code text not null references public.airports (code),
  depart_at timestamptz not null,
  arrive_at timestamptz not null,
  aircraft text not null default 'Boeing 787',
  cabin text not null default 'Economy' check (cabin in ('Economy', 'Premium Economy', 'Business', 'First')),
  price numeric(10, 2) not null,
  seats_total int not null default 180,
  seats_left int not null default 180,
  stops int not null default 0 check (stops in (0, 1, 2)),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'boarding', 'departed', 'in_air', 'landed', 'delayed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Idempotent — picks up `mode` on a project that already ran an earlier
-- version of this file (same pattern as the guest-checkout columns below).
-- Every existing row defaults to 'flight' so nothing already booked shifts
-- category; trains/buses are just flights-table rows with mode set.
alter table public.flights add column if not exists mode text not null default 'flight';
do $$
begin
  alter table public.flights drop constraint flights_mode_check;
exception when undefined_object then null;
end $$;
alter table public.flights add constraint flights_mode_check
  check (mode in ('flight', 'train', 'bus'));

-- Seats an admin has taken out of sale on a departure: crew rest, a block
-- held for a group, equipment out of service, or simply staging a demo so
-- a flight looks realistically sold. These sit alongside seats sold by
-- real bookings, and both are unavailable to a traveler for the same
-- reason — the seat is not free.
alter table public.flights add column if not exists blocked_seats text[] not null default '{}';

-- Airport-local time. Every departure and arrival clock time is rendered in
-- the airport's own zone: a flight leaving JFK at 09:00 leaves at 09:00 in
-- New York, and showing that as UTC (or in whatever zone the viewer's
-- browser happens to sit in) is simply the wrong number. Idempotent, and
-- backfilled below so an existing project picks it up.
alter table public.airports add column if not exists tz text;

update public.airports as a
set tz = v.tz
from (values
    ('ACC', 'Africa/Accra'),
    ('AKL', 'Pacific/Auckland'),
    ('AMS', 'Europe/Amsterdam'),
    ('ARN', 'Europe/Stockholm'),
    ('ATH', 'Europe/Athens'),
    ('ATL', 'America/New_York'),
    ('AUH', 'Asia/Dubai'),
    ('BCN', 'Europe/Madrid'),
    ('BER', 'Europe/Berlin'),
    ('BKK', 'Asia/Bangkok'),
    ('BNE', 'Australia/Brisbane'),
    ('BOG', 'America/Bogota'),
    ('BOM', 'Asia/Kolkata'),
    ('BOS', 'America/New_York'),
    ('BRU', 'Europe/Brussels'),
    ('CAI', 'Africa/Cairo'),
    ('CDG', 'Europe/Paris'),
    ('CGK', 'Asia/Jakarta'),
    ('CGN', 'Europe/Berlin'),
    ('CMN', 'Africa/Casablanca'),
    ('CPH', 'Europe/Copenhagen'),
    ('CPT', 'Africa/Johannesburg'),
    ('DEL', 'Asia/Kolkata'),
    ('DFW', 'America/Chicago'),
    ('DOH', 'Asia/Qatar'),
    ('DPS', 'Asia/Makassar'),
    ('DUB', 'Europe/Dublin'),
    ('DXB', 'Asia/Dubai'),
    ('EDI', 'Europe/London'),
    ('EZE', 'America/Argentina/Buenos_Aires'),
    ('FCO', 'Europe/Rome'),
    ('FRA', 'Europe/Berlin'),
    ('GRU', 'America/Sao_Paulo'),
    ('HAM', 'Europe/Berlin'),
    ('HKG', 'Asia/Hong_Kong'),
    ('HND', 'Asia/Tokyo'),
    ('ICN', 'Asia/Seoul'),
    ('IST', 'Europe/Istanbul'),
    ('JFK', 'America/New_York'),
    ('JNB', 'Africa/Johannesburg'),
    ('KUL', 'Asia/Kuala_Lumpur'),
    ('LAX', 'America/Los_Angeles'),
    ('LDN', 'Europe/London'),
    ('LGW', 'Europe/London'),
    ('LHR', 'Europe/London'),
    ('LIM', 'America/Lima'),
    ('LIS', 'Europe/Lisbon'),
    ('LOS', 'Africa/Lagos'),
    ('MAD', 'Europe/Madrid'),
    ('MAN', 'Europe/London'),
    ('MEL', 'Australia/Melbourne'),
    ('MEX', 'America/Mexico_City'),
    ('MIA', 'America/New_York'),
    ('MNL', 'Asia/Manila'),
    ('MUC', 'Europe/Berlin'),
    ('NBO', 'Africa/Nairobi'),
    ('NRT', 'Asia/Tokyo'),
    ('ORD', 'America/Chicago'),
    ('PAR', 'Europe/Paris'),
    ('PEK', 'Asia/Shanghai'),
    ('PER', 'Australia/Perth'),
    ('PRG', 'Europe/Prague'),
    ('PVG', 'Asia/Shanghai'),
    ('RUH', 'Asia/Riyadh'),
    ('SCL', 'America/Santiago'),
    ('SEA', 'America/Los_Angeles'),
    ('SFO', 'America/Los_Angeles'),
    ('SIN', 'Asia/Singapore'),
    ('SYD', 'Australia/Sydney'),
    ('TLV', 'Asia/Jerusalem'),
    ('TPE', 'Asia/Taipei'),
    ('VIE', 'Europe/Vienna'),
    ('YVR', 'America/Vancouver'),
    ('YYZ', 'America/Toronto'),
    ('ZRH', 'Europe/Zurich')
) as v (code, tz)
where a.code = v.code and (a.tz is null or a.tz <> v.tz);

-- Anything not in the list above (an airport added by hand through the
-- admin route form) falls back to UTC rather than to the server's zone,
-- so the value is at least explicit and stable.
update public.airports set tz = 'UTC' where tz is null;
alter table public.airports alter column tz set not null;
alter table public.airports alter column tz set default 'UTC';

-- Converts a wall-clock local time at an airport into the correct instant.
-- Seeds read far better this way, and more importantly they stop depending
-- on the server's timezone: `now() + time '21:35'` produced a different
-- real departure depending on when and where the seed happened to run.
create or replace function public.local_ts(p_code text, p_days int, p_time time)
returns timestamptz as $$
  select ((current_date + p_days) + p_time) at time zone coalesce(
    (select tz from public.airports where code = p_code), 'UTC'
  );
$$ language sql stable;

-- A departure is identified by its number and the pair of airports it
-- connects. Without this the seed had no conflict target, so re-running it
-- inserted a second copy of all 104 flights rather than refreshing them.
--
-- Any project that did run the old seed twice already holds those copies,
-- and the unique index below cannot be built over them. Duplicates are
-- collapsed first, keeping the oldest row of each group and removing only
-- copies nothing has booked — a duplicate carrying a booking is left in
-- place, and the index creation will report it rather than destroy it.
delete from public.flights f
where exists (
  select 1 from public.flights keep
  where keep.flight_number = f.flight_number
    and keep.from_code = f.from_code
    and keep.to_code = f.to_code
    and (keep.created_at, keep.id) < (f.created_at, f.id)
)
and not exists (select 1 from public.bookings b where b.flight_id = f.id);

create unique index if not exists flights_natural_key_idx
  on public.flights (flight_number, from_code, to_code);

create index if not exists flights_route_idx on public.flights (from_code, to_code, depart_at);
create index if not exists flights_mode_route_idx on public.flights (mode, from_code, to_code, depart_at);

-- ─────────────────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default upper(substr(md5(random()::text), 1, 6)),
  -- Guest checkout is the norm here — no sign-in is required to book a
  -- flight — so user_id is nullable and guest_email is how a booking gets
  -- looked up on /manage-booking and how refund eligibility is checked.
  user_id uuid references auth.users (id) on delete cascade,
  guest_email text,
  flight_id uuid not null references public.flights (id),
  passengers jsonb not null default '[]'::jsonb,   -- [{ name, email, seat }]
  seats text[] not null default '{}',
  cabin text not null default 'Economy',
  total_amount numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  constraint bookings_owner_present check (user_id is not null or guest_email is not null)
);

-- Idempotent — picks up the guest-checkout columns on a project that
-- already ran an earlier version of this file. Must run BEFORE the indexes
-- below, since create table above no-ops on an existing table and the
-- column wouldn't exist yet otherwise.
alter table public.bookings alter column user_id drop not null;
alter table public.bookings add column if not exists guest_email text;

create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_guest_email_idx on public.bookings (guest_email);
create index if not exists bookings_reference_idx on public.bookings (reference);

-- ─────────────────────────────────────────────────────────────────────────
-- payments  (simulated payment intents)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  guest_email text,
  amount numeric(10, 2) not null,
  method text not null default 'card' check (method in ('card', 'apple_pay', 'google_pay', 'paypal', 'split', 'wallet')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  simulated_outcome text check (simulated_outcome in ('success', 'pending', 'fail')),
  transaction_id text not null default ('sim_' || substr(md5(random()::text), 1, 12)),
  created_at timestamptz not null default now()
);

-- Idempotent — same guest-checkout support as bookings above.
alter table public.payments alter column user_id drop not null;
alter table public.payments add column if not exists guest_email text;
do $$
begin
  alter table public.payments drop constraint payments_method_check;
exception when undefined_object then null;
end $$;
alter table public.payments add constraint payments_method_check
  check (method in ('card', 'apple_pay', 'google_pay', 'paypal', 'split', 'wallet'));

-- ─────────────────────────────────────────────────────────────────────────
-- Booking functions — guest checkout, so these are SECURITY DEFINER and
-- enforce ownership via guest_email themselves rather than relying on
-- auth.uid() (see the "no public policy" note on bookings/payments above).
-- ─────────────────────────────────────────────────────────────────────────

-- Called once payment succeeds. Writes the booking + its payment row in one
-- shot so a booking can never exist without a matching payment record.
-- Parameter renamed (p_total_amount -> p_expected_amount). Postgres will
-- not rename a parameter via create or replace, so the old definition is
-- dropped explicitly; the signature itself is unchanged.
drop function if exists public.create_booking(uuid, text, jsonb, text[], text, numeric, text, text);

-- Books seats with real inventory integrity. Everything that decides
-- whether this booking is allowed happens behind a row lock on the flight,
-- so concurrent checkouts for the same flight are serialized rather than
-- racing each other.
--
-- Three things this deliberately does NOT trust the caller for:
--   * the price — recomputed from flights.price and the current service
--     fee, because the old signature took the browser's number and wrote
--     it straight to payments (a crafted request bought any fare for $1)
--   * seat availability — checked against seats already sold on this
--     flight, so two people cannot both be confirmed into 12A
--   * remaining capacity — seats_left is now actually decremented, where
--     before it was seeded once and never written again
--
-- p_expected_amount is what the browser believed the total was. It is
-- compared against the server's figure and rejected on mismatch, so a
-- stale price (fare changed while the traveler sat on the payment step)
-- surfaces as an explicit error instead of silently charging a different
-- number than the one displayed.
create or replace function public.create_booking(
  p_flight_id uuid,
  p_guest_email text,
  p_passengers jsonb,
  p_seats text[],
  p_cabin text,
  p_expected_amount numeric,
  p_method text,
  p_transaction_id text
)
returns jsonb as $$
declare
  v_booking public.bookings;
  v_flight public.flights;
  v_uid uuid := auth.uid();
  v_seat_count int;
  v_fee numeric;
  v_total numeric;
  v_clash text[];
begin
  -- Lock the flight for the rest of this transaction. Every availability
  -- decision below depends on it, so this is what makes the check-then-act
  -- sequence safe under concurrency.
  select * into v_flight
  from public.flights
  where id = p_flight_id
  for update;

  if v_flight.id is null then
    return jsonb_build_object('success', false, 'message', 'That flight is no longer available.');
  end if;

  if v_flight.status in ('cancelled', 'departed', 'in_air', 'landed') then
    return jsonb_build_object('success', false, 'message', 'That departure is no longer open for booking.');
  end if;

  -- Seats are optional (not every mode assigns them), so capacity is driven
  -- by the passenger count and seats are validated only when supplied.
  v_seat_count := greatest(jsonb_array_length(coalesce(p_passengers, '[]'::jsonb)), 1);

  if v_flight.seats_left < v_seat_count then
    return jsonb_build_object(
      'success', false,
      'message', format('Only %s seat(s) left on this departure.', v_flight.seats_left)
    );
  end if;

  -- Already-sold seats on this flight. Array overlap is safe here because
  -- the flight row above is locked, so no competing booking can commit
  -- between this check and the insert below.
  if array_length(p_seats, 1) > 0 then
    -- Sold seats and seats an admin has withdrawn from sale are both
    -- unavailable, and for the traveler they fail identically.
    select array_agg(distinct s) into v_clash
    from (
      select unnest(b.seats) as s
      from public.bookings b
      where b.flight_id = p_flight_id and b.status in ('pending', 'confirmed')
      union
      select unnest(v_flight.blocked_seats)
    ) taken
    where s = any (p_seats);

    if v_clash is not null and array_length(v_clash, 1) > 0 then
      return jsonb_build_object(
        'success', false,
        'message', format('Seat(s) %s have just been taken. Please pick another.', array_to_string(v_clash, ', '))
      );
    end if;
  end if;

  -- Authoritative price. Mirrors the breakdown shown at checkout
  -- (per-seat fare x travelers, plus the platform service fee) but is
  -- derived entirely from server-side state.
  select coalesce(service_fee_percent, 0) into v_fee from public.platform_settings where id = 1;
  v_total := round(v_flight.price * v_seat_count * (1 + coalesce(v_fee, 0) / 100));

  if p_expected_amount is not null and round(p_expected_amount) <> v_total then
    return jsonb_build_object(
      'success', false,
      'message', 'The fare for this departure has changed since this request was made. Review the new total and try again.',
      'expected', p_expected_amount,
      'actual', v_total
    );
  end if;

  insert into public.bookings (user_id, guest_email, flight_id, passengers, seats, cabin, total_amount, status)
  values (v_uid, lower(p_guest_email), p_flight_id, p_passengers, p_seats, p_cabin, v_total, 'confirmed')
  returning * into v_booking;

  insert into public.payments (booking_id, user_id, guest_email, amount, method, status, simulated_outcome, transaction_id)
  values (v_booking.id, v_uid, lower(p_guest_email), v_total, p_method, 'completed', 'success', p_transaction_id);

  -- The inventory movement this function previously never performed.
  update public.flights
  set seats_left = seats_left - v_seat_count
  where id = p_flight_id;

  return jsonb_build_object(
    'success', true,
    'reference', v_booking.reference,
    'id', v_booking.id,
    'total', v_total
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.create_booking(uuid, text, jsonb, text[], text, numeric, text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Seat control
-- ─────────────────────────────────────────────────────────────────────────

-- Every seat unavailable on a departure, whichever way it became
-- unavailable. This replaces the earlier bookings-only version.
create or replace function public.get_taken_seats(p_flight_id uuid)
returns text[] as $$
  select coalesce(
    (
      select array_agg(distinct seat)
      from (
        select unnest(b.seats) as seat
        from public.bookings b
        where b.flight_id = p_flight_id
          and b.status in ('pending', 'confirmed')
        union
        select unnest(f.blocked_seats)
        from public.flights f
        where f.id = p_flight_id
      ) all_seats
    ),
    '{}'::text[]
  );
$$ language sql stable security definer set search_path = public;

grant execute on function public.get_taken_seats(uuid) to anon, authenticated;

-- Splits the two so the admin seat map can show sold seats as immovable
-- and blocked seats as the ones it is allowed to toggle.
create or replace function public.get_seat_map(p_flight_id uuid)
returns jsonb as $$
  select jsonb_build_object(
    'booked', coalesce((
      select array_agg(distinct s)
      from public.bookings b, unnest(b.seats) s
      where b.flight_id = p_flight_id and b.status in ('pending', 'confirmed')
    ), '{}'::text[]),
    'blocked', coalesce((
      select blocked_seats from public.flights where id = p_flight_id
    ), '{}'::text[]),
    'seats_left', (select seats_left from public.flights where id = p_flight_id),
    'seats_total', (select seats_total from public.flights where id = p_flight_id)
  );
$$ language sql stable security definer set search_path = public;

grant execute on function public.get_seat_map(uuid) to anon, authenticated;

-- Admin-only. Refuses to block a seat that is already sold, so the two
-- lists can never disagree about who holds a seat.
create or replace function public.set_blocked_seats(p_flight_id uuid, p_seats text[])
returns jsonb as $$
declare
  v_conflict text[];
begin
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'message', 'Not authorised.');
  end if;

  select array_agg(distinct s) into v_conflict
  from public.bookings b, unnest(b.seats) s
  where b.flight_id = p_flight_id
    and b.status in ('pending', 'confirmed')
    and s = any (coalesce(p_seats, '{}'::text[]));

  if v_conflict is not null and array_length(v_conflict, 1) > 0 then
    return jsonb_build_object(
      'success', false,
      'message', format('Seat(s) %s are already sold to a traveler and cannot be blocked.',
                        array_to_string(v_conflict, ', '))
    );
  end if;

  update public.flights
  set blocked_seats = coalesce(p_seats, '{}'::text[])
  where id = p_flight_id;

  if not found then
    return jsonb_build_object('success', false, 'message', 'No such departure.');
  end if;

  return jsonb_build_object('success', true, 'blocked', coalesce(p_seats, '{}'::text[]));
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.set_blocked_seats(uuid, text[]) to authenticated;

-- Makes the seat-overlap lookup above an index scan rather than a scan of
-- every booking on the flight.
create index if not exists bookings_seats_gin_idx on public.bookings using gin (seats);

-- Looks up a booking by reference + the email that booked it — the only
-- credential a guest has, so this is how /manage-booking works without
-- requiring sign-in. Never leaks whether a reference exists at all if the
-- email doesn't match it, same anti-enumeration shape as redeem_gift_card.
create or replace function public.get_booking_by_reference(p_reference text, p_email text)
returns jsonb as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking
  from public.bookings
  where reference = upper(trim(p_reference))
    and (guest_email = lower(p_email) or user_id = auth.uid());

  if v_booking.id is null then
    return jsonb_build_object('success', false, 'message', 'No booking found for that reference and email.');
  end if;

  return jsonb_build_object(
    'success', true,
    'id', v_booking.id,
    'reference', v_booking.reference,
    'flight_id', v_booking.flight_id,
    'total_amount', v_booking.total_amount,
    'status', v_booking.status,
    'created_at', v_booking.created_at,
    'seats', to_jsonb(v_booking.seats),
    'cabin', v_booking.cabin
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.get_booking_by_reference(text, text) to anon, authenticated;

-- Self-service refund — only within the same ownership check as lookup
-- above, only for a 'confirmed' booking, and only once 24h have passed
-- since booking (mirrors the 24h free-cancellation window described on
-- /terms). Also flips the matching payment row so the ledger stays honest.
create or replace function public.refund_booking(p_reference text, p_email text)
returns jsonb as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking
  from public.bookings
  where reference = upper(trim(p_reference))
    and (guest_email = lower(p_email) or user_id = auth.uid());

  if v_booking.id is null then
    return jsonb_build_object('success', false, 'message', 'No booking found for that reference and email.');
  end if;

  if v_booking.status <> 'confirmed' then
    return jsonb_build_object('success', false, 'message', 'This booking is not eligible for a refund.');
  end if;

  if v_booking.created_at > now() - interval '24 hours' then
    return jsonb_build_object(
      'success', false,
      'message', 'Refunds open 24 hours after booking. Check back soon.'
    );
  end if;

  update public.bookings set status = 'refunded' where id = v_booking.id;
  update public.payments set status = 'failed' where booking_id = v_booking.id;

  return jsonb_build_object('success', true, 'amount', v_booking.total_amount, 'reference', v_booking.reference);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.refund_booking(text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- reviews  (landing page testimonials, editable from admin)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  role text,
  avatar_url text,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- platform_settings  (single-row admin control table)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),   -- enforce singleton row
  payment_mode text not null default 'simulate_success'
    check (payment_mode in ('simulate_success', 'simulate_pending', 'simulate_fail', 'random', 'manual_review', 'live')),
  maintenance_mode boolean not null default false,
  booking_enabled boolean not null default true,
  service_fee_percent numeric(5, 2) not null default 3.5,
  -- Master gate in front of every simulated transactional email (booking
  -- confirmations, receipts, gift card purchase/redeem, welcome, contact
  -- auto-reply). Mirrors payment_mode: the admin panel is the single
  -- conditional controller in front of these triggers, standing in for the
  -- real approval/business logic a production system would have.
  email_notifications_enabled boolean not null default true,
  -- Where operational alerts go when a transaction is initiated (a payment
  -- lands in the review queue, a gift card is bought, a booking confirms).
  -- Null/blank simply means nobody is alerted — never an error.
  admin_notification_email text,
  updated_at timestamptz not null default now()
);

-- Idempotent — picks up admin_notification_email on a project that already
-- ran an earlier version of this file.
alter table public.platform_settings add column if not exists admin_notification_email text;

-- Idempotent — picks up new columns/constraint changes on a project that
-- already ran an earlier version of this file, without needing a reset.
alter table public.platform_settings add column if not exists email_notifications_enabled boolean not null default true;
do $$
begin
  alter table public.platform_settings drop constraint platform_settings_payment_mode_check;
exception when undefined_object then null;
end $$;
alter table public.platform_settings add constraint platform_settings_payment_mode_check
  check (payment_mode in ('simulate_success', 'simulate_pending', 'simulate_fail', 'random', 'manual_review', 'live'));

insert into public.platform_settings (id) values (1)
  on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- gift_cards
-- All public interaction (purchase + redeem + balance lookup) goes through
-- the security-definer functions below, not direct table access — the
-- table itself has no public RLS policy at all.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'USD',
  status text not null default 'active' check (status in ('active', 'redeemed', 'void')),
  recipient_email text,
  buyer_email text,   -- who paid for it — needed to check refund eligibility
  issued_by text not null default 'purchase',   -- 'purchase' | 'admin:<name>'
  redeemed_email text,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Idempotent — picks up buyer_email on a project that already ran an
-- earlier version of this file. Must run BEFORE the indexes below, same
-- reasoning as the bookings table above.
alter table public.gift_cards add column if not exists buyer_email text;

create index if not exists gift_cards_status_idx on public.gift_cards (status);
create index if not exists gift_cards_redeemed_email_idx on public.gift_cards (redeemed_email);
create index if not exists gift_cards_buyer_email_idx on public.gift_cards (buyer_email);

-- Generates a human-friendly code like AIRFLY-7K2M-9QRT.
create or replace function public.generate_gift_card_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I ambiguity
  part1 text := '';
  part2 text := '';
  i int;
begin
  for i in 1..4 loop
    part1 := part1 || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
    part2 := part2 || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
  end loop;
  return 'AIRFLY-' || part1 || '-' || part2;
end;
$$ language plpgsql volatile;

-- Public purchase flow: anyone can call this to mint an active gift card.
-- issued_by is hardcoded to 'purchase' here (never trusts a client-supplied
-- value), so this can't be used to forge an admin-issued card.
create or replace function public.issue_gift_card(
  p_amount numeric,
  p_recipient_email text default null,
  p_buyer_email text default null
)
returns public.gift_cards as $$
declare
  v_code text;
  v_row public.gift_cards;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Invalid amount';
  end if;

  loop
    v_code := public.generate_gift_card_code();
    begin
      insert into public.gift_cards (code, amount, recipient_email, buyer_email, issued_by)
      values (v_code, p_amount, p_recipient_email, lower(p_buyer_email), 'purchase')
      returning * into v_row;
      exit;
    exception when unique_violation then
      -- extremely unlikely code collision — try again
    end;
  end loop;

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.issue_gift_card(numeric, text, text) to anon, authenticated;

-- Self-service refund — mirrors refund_booking's shape: same 24h window,
-- same "prove ownership via the email that paid for it" check. Only works
-- while the card is still unredeemed (status = 'active') — once spent, the
-- value's gone, so there's nothing left to refund.
create or replace function public.refund_gift_card(p_code text, p_email text)
returns jsonb as $$
declare
  v_row public.gift_cards;
begin
  select * into v_row
  from public.gift_cards
  where code = upper(trim(p_code)) and buyer_email = lower(p_email);

  if v_row.id is null then
    return jsonb_build_object('success', false, 'message', 'No gift card found for that code and email.');
  end if;

  if v_row.status <> 'active' then
    return jsonb_build_object('success', false, 'message', 'This gift card has already been used or refunded.');
  end if;

  if v_row.created_at > now() - interval '24 hours' then
    return jsonb_build_object(
      'success', false,
      'message', 'Refunds open 24 hours after purchase. Check back soon.'
    );
  end if;

  update public.gift_cards set status = 'void' where id = v_row.id;

  return jsonb_build_object('success', true, 'amount', v_row.amount, 'code', v_row.code);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.refund_gift_card(text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- wallet_transactions
-- A simple ledger (credits from redeemed gift cards, debits from spending
-- balance at checkout) rather than a single mutable "balance" column — so
-- the balance is always derivable/auditable, and spending is race-safe.
-- No public policies; only touched via the security-definer functions below.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  type text not null check (type in ('credit', 'debit')),
  amount numeric(10, 2) not null check (amount > 0),
  source text not null,   -- e.g. 'gift_card:AIRFLY-XXXX-XXXX' or 'booking:8F3K2A'
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_email_idx on public.wallet_transactions (email);

alter table public.wallet_transactions enable row level security;
drop policy if exists "wallet_transactions_admin_all" on public.wallet_transactions;
create policy "wallet_transactions_admin_all" on public.wallet_transactions
  for all using (public.is_admin()) with check (public.is_admin());

-- Atomic redeem: single UPDATE ... WHERE status = 'active' prevents any
-- double-redeem race condition, and returns a clean structured result the
-- UI can show directly (never exposes whether a code "doesn't exist" vs.
-- "already redeemed" differently, so codes can't be enumerated).
create or replace function public.redeem_gift_card(p_code text, p_email text)
returns jsonb as $$
declare
  v_row public.gift_cards;
begin
  if p_email is null or p_email = '' then
    return jsonb_build_object('success', false, 'message', 'An email is required to redeem.');
  end if;

  update public.gift_cards
  set status = 'redeemed', redeemed_email = lower(p_email), redeemed_at = now()
  where code = upper(trim(p_code)) and status = 'active'
  returning * into v_row;

  if v_row.id is null then
    return jsonb_build_object(
      'success', false,
      'message', 'That code is invalid, already used, or has been voided.'
    );
  end if;

  insert into public.wallet_transactions (email, type, amount, source)
  values (lower(p_email), 'credit', v_row.amount, 'gift_card:' || v_row.code);

  return jsonb_build_object(
    'success', true,
    'amount', v_row.amount,
    'currency', v_row.currency,
    'message', 'Gift card redeemed — your balance has been updated.'
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.redeem_gift_card(text, text) to anon, authenticated;

-- Wallet balance = sum(credits) - sum(debits). Only ever returns an
-- aggregate number, never raw rows, so this is safe to expose without a
-- broader select policy.
create or replace function public.get_wallet_balance(p_email text)
returns numeric as $$
  select coalesce(sum(case when type = 'credit' then amount else -amount end), 0)
  from public.wallet_transactions
  where email = lower(p_email);
$$ language sql security definer set search_path = public stable;

grant execute on function public.get_wallet_balance(text) to anon, authenticated;

-- Atomic spend: re-checks balance and inserts the debit in one transaction
-- so two concurrent checkouts can't both spend the same last dollar.
create or replace function public.spend_wallet_credit(p_email text, p_amount numeric, p_source text)
returns jsonb as $$
declare
  v_balance numeric;
begin
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'message', 'Invalid amount.');
  end if;

  select public.get_wallet_balance(p_email) into v_balance;

  if v_balance < p_amount then
    return jsonb_build_object('success', false, 'message', 'Insufficient wallet balance.');
  end if;

  insert into public.wallet_transactions (email, type, amount, source)
  values (lower(p_email), 'debit', p_amount, p_source);

  return jsonb_build_object('success', true, 'remaining', v_balance - p_amount);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.spend_wallet_credit(text, numeric, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- admin_logs  (audit trail of admin actions, shown on /admin/logs)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users (id) on delete set null,
  admin_name text,               -- denormalized snapshot, survives user deletion
  action text not null,          -- e.g. 'platform_settings.update'
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_logs_created_idx on public.admin_logs (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- payment_requests  ("manual review" payment mode)
-- Only used when platform_settings.payment_mode = 'manual_review'. Instead
-- of an admin-picked blanket outcome auto-resolving every card payment,
-- each one lands here as 'pending' and an admin decides it individually —
-- approve, decline, or decline-with-alt-payment-recommendation (wallet for
-- a booking, crypto for a gift card). The client polls
-- get_payment_request_status() every couple seconds while pending, so the
-- checkout screen updates the moment an admin acts, with no page reload —
-- true Postgres Realtime broadcasting was considered but rejected: it needs
-- an RLS SELECT policy permissive enough for an anonymous guest to read
-- their own row, and RLS can't scope "only if you already know the UUID" —
-- "using (true)" would let anyone list every pending transaction's email
-- and amount. Short-interval polling through a narrow RPC avoids that
-- entirely, at the cost of true instant push (a couple seconds instead of
-- milliseconds) — a fine trade for this.
-- ─────────────────────────────────────────────────────────────────────────
-- ─────────────────────────────────────────────────────────────────────────
-- crypto_addresses — admin-managed receiving addresses shown at checkout.
-- Shared addresses for now (one per coin); per-buyer/per-session unique
-- addresses are a future upgrade, not this table's job.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.crypto_addresses (
  coin text primary key check (coin in ('usdt_bep20', 'eth', 'sol')),
  address text not null,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.crypto_addresses enable row level security;

-- Public read — buyers (including guests) need this to render the QR/address
-- at checkout. Writes are admin-only.
drop policy if exists "crypto_addresses_public_read" on public.crypto_addresses;
create policy "crypto_addresses_public_read" on public.crypto_addresses
  for select using (true);

drop policy if exists "crypto_addresses_admin_write" on public.crypto_addresses;
create policy "crypto_addresses_admin_write" on public.crypto_addresses
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('booking', 'gift_card')),
  email text not null,
  amount numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'declined_alt')),
  alt_recommendation text check (alt_recommendation in ('wallet', 'crypto', 'card')),
  metadata jsonb not null default '{}'::jsonb,   -- offer/passengers/seats/etc, or gift card amount+recipient+method
  result jsonb,                                  -- populated on approve: { reference } or { code }
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Idempotent — 'card' is a newer alt_recommendation value (a crypto gift
-- card purchase under manual review now recommends switching back to
-- card, not just card -> crypto), so a project that ran an earlier
-- version of this file has the narrower constraint and needs it widened.
do $$
begin
  alter table public.payment_requests drop constraint payment_requests_alt_recommendation_check;
exception when undefined_object then null;
end $$;
alter table public.payment_requests add constraint payment_requests_alt_recommendation_check
  check (alt_recommendation in ('wallet', 'crypto', 'card'));

create index if not exists payment_requests_status_idx on public.payment_requests (status, created_at);

alter table public.payment_requests enable row level security;

-- Admin-only direct table access — everything else goes through the
-- functions below, same shape as gift_cards/bookings above.
drop policy if exists "payment_requests_admin_all" on public.payment_requests;
create policy "payment_requests_admin_all" on public.payment_requests
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.create_payment_request(
  p_type text,
  p_email text,
  p_amount numeric,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_id uuid;
begin
  insert into public.payment_requests (type, email, amount, metadata)
  values (p_type, lower(p_email), p_amount, p_metadata)
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.create_payment_request(text, text, numeric, jsonb) to anon, authenticated;

-- Narrow, poll-safe status read — never returns another request's email or
-- amount, only what the polling client needs to update its own UI.
create or replace function public.get_payment_request_status(p_id uuid)
returns jsonb as $$
declare
  v public.payment_requests;
begin
  select * into v from public.payment_requests where id = p_id;
  if v.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object(
    'status', v.status,
    'alt_recommendation', v.alt_recommendation,
    'result', v.result
  );
end;
$$ language plpgsql security definer set search_path = public stable;

grant execute on function public.get_payment_request_status(uuid) to anon, authenticated;

-- Admin decision. Only transitions status/alt_recommendation — the actual
-- side effect (creating the booking, issuing the gift card) happens
-- app-side via the existing create_booking / issue_gift_card functions
-- using the metadata returned here, then set_payment_request_result below
-- stores the outcome for the polling client to pick up.
create or replace function public.resolve_payment_request(
  p_id uuid,
  p_decision text,
  p_alt text default null
)
returns jsonb as $$
declare
  v_req public.payment_requests;
begin
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'message', 'Admin only.');
  end if;
  if p_decision not in ('approved', 'declined', 'declined_alt') then
    return jsonb_build_object('success', false, 'message', 'Invalid decision.');
  end if;

  select * into v_req from public.payment_requests where id = p_id and status = 'pending';
  if v_req.id is null then
    return jsonb_build_object('success', false, 'message', 'Request not found or already resolved.');
  end if;

  update public.payment_requests
  set status = p_decision, alt_recommendation = p_alt, resolved_at = now()
  where id = p_id;

  return jsonb_build_object(
    'success', true,
    'type', v_req.type,
    'email', v_req.email,
    'amount', v_req.amount,
    'metadata', v_req.metadata
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.resolve_payment_request(uuid, text, text) to authenticated;

create or replace function public.set_payment_request_result(p_id uuid, p_result jsonb)
returns void as $$
begin
  if not public.is_admin() then
    return;
  end if;
  update public.payment_requests set result = p_result where id = p_id;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.set_payment_request_result(uuid, jsonb) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- TEMPORARY — card validator QA log (MVP only, delete after testing)
--
-- Captures whatever is typed into the checkout card form (use Stripe TEST
-- card numbers only, e.g. 4242 4242 4242 4242 — never a real card) so an
-- admin can compare our client-side validator's verdict against what
-- Stripe's own test cards report, and confirm src/lib/card-validation.ts
-- is accurate before the real payment processor goes in. Once that's
-- confirmed, drop this table + function and delete
-- src/app/admin/(dashboard)/card-tests/ and src/lib/card-test-log.ts.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.card_validation_tests (
  id uuid primary key default gen_random_uuid(),
  cardholder_name text,
  card_number text not null,
  expiry text,
  cvc text,
  detected_brand text,
  client_valid boolean not null,
  client_message text,
  billing_address text,
  billing_city text,
  billing_postal_code text,
  billing_country text,
  created_at timestamptz not null default now()
);

-- Idempotent — picks up the billing-address columns on a project that
-- already ran an earlier version of this table (Stripe verifies these via
-- AVS, so the QA log needs them too to be a real comparison point).
alter table public.card_validation_tests add column if not exists billing_address text;
alter table public.card_validation_tests add column if not exists billing_city text;
alter table public.card_validation_tests add column if not exists billing_postal_code text;
alter table public.card_validation_tests add column if not exists billing_country text;

alter table public.card_validation_tests enable row level security;

drop policy if exists "card_validation_tests_admin_all" on public.card_validation_tests;
create policy "card_validation_tests_admin_all" on public.card_validation_tests
  for all using (public.is_admin()) with check (public.is_admin());

-- Drop the old 7-arg signature before recreating with the billing-address
-- params — Postgres treats a changed parameter list as a new overload
-- rather than a replacement, so without this a re-run of this file would
-- leave two versions of the function behind.
drop function if exists public.log_card_validation_test(text, text, text, text, text, boolean, text);

create or replace function public.log_card_validation_test(
  p_name text,
  p_number text,
  p_expiry text,
  p_cvc text,
  p_brand text,
  p_valid boolean,
  p_message text default null,
  p_address text default null,
  p_city text default null,
  p_postal_code text default null,
  p_country text default null
)
returns void as $$
begin
  insert into public.card_validation_tests
    (cardholder_name, card_number, expiry, cvc, detected_brand, client_valid, client_message,
     billing_address, billing_city, billing_postal_code, billing_country)
  values (p_name, p_number, p_expiry, p_cvc, p_brand, p_valid, p_message,
          p_address, p_city, p_postal_code, p_country);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.log_card_validation_test(
  text, text, text, text, text, boolean, text, text, text, text, text
) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at trigger helper
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_platform_settings_updated_at on public.platform_settings;
create trigger set_platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- new-user hook: auto-create a profile row
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.airports enable row level security;
alter table public.airlines enable row level security;
alter table public.flights enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.platform_settings enable row level security;
alter table public.admin_logs enable row level security;
alter table public.gift_cards enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles: users read/update their own row; admins read/update all
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Hardening: the policy above lets a user update their OWN row (so they can
-- edit their name/avatar/phone), but without this trigger that would also
-- let any signed-in user set their own role to 'admin' via a direct API
-- call — the USING clause has no column-level restriction. This trigger
-- blocks any role change made by a non-admin, full stop. The only sanctioned
-- way to become the first admin is claim_first_admin() below, which is
-- SECURITY DEFINER and enforces its own "only if zero admins exist" rule.
create or replace function public.prevent_self_role_escalation()
returns trigger as $$
begin
  -- auth.uid() is null for anything running outside a normal end-user API
  -- request — the SQL editor, the Supabase CLI, a service-role connection,
  -- a migration. That's already a fully-trusted context (only reachable by
  -- the project owner or privileged server-side code), so it's exempt.
  -- What this actually guards against is a signed-in, non-admin user
  -- promoting themselves via the public API — that's the only case where
  -- auth.uid() is both non-null and not an admin.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an admin can change a profile''s role.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

-- Bootstrap path for the very first admin — lets a signed-in user claim the
-- admin role themselves, but ONLY while zero admins exist anywhere in the
-- system. Used by the one-time /interface setup page. Safe to leave in
-- place permanently: it becomes a no-op the moment any admin exists.
create or replace function public.claim_first_admin()
returns jsonb as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'message', 'Not signed in.');
  end if;

  if exists (select 1 from public.profiles where role = 'admin') then
    return jsonb_build_object('success', false, 'message', 'An admin account already exists.');
  end if;

  update public.profiles set role = 'admin' where id = v_uid;

  return jsonb_build_object('success', true, 'message', 'You are now an admin.');
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.claim_first_admin() to authenticated;

-- airports / airlines / flights / reviews: public read, admin write
drop policy if exists "airports_public_read" on public.airports;
create policy "airports_public_read" on public.airports for select using (true);
drop policy if exists "airports_admin_write" on public.airports;
create policy "airports_admin_write" on public.airports for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "airlines_public_read" on public.airlines;
create policy "airlines_public_read" on public.airlines for select using (true);
drop policy if exists "airlines_admin_write" on public.airlines;
create policy "airlines_admin_write" on public.airlines for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "flights_public_read" on public.flights;
create policy "flights_public_read" on public.flights for select using (true);
drop policy if exists "flights_admin_write" on public.flights;
create policy "flights_admin_write" on public.flights for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);
drop policy if exists "reviews_owner_insert" on public.reviews;
create policy "reviews_owner_insert" on public.reviews for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "reviews_admin_write" on public.reviews;
create policy "reviews_admin_write" on public.reviews for update using (public.is_admin());
drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews for delete using (public.is_admin());

-- bookings: signed-in owners can read their own rows; admins get full
-- access. No public insert/update policy at all — guest checkout is the
-- norm here, so all creation/lookup/refund goes through the SECURITY
-- DEFINER functions below (create_booking, get_booking_by_reference,
-- refund_booking), which enforce guest_email ownership themselves instead
-- of relying on auth.uid().
drop policy if exists "bookings_owner_or_admin_select" on public.bookings;
create policy "bookings_owner_or_admin_select" on public.bookings
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "bookings_owner_insert" on public.bookings;
drop policy if exists "bookings_admin_all" on public.bookings;
create policy "bookings_admin_all" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- payments: same shape as bookings — admin-only direct table access,
-- everything else via functions.
drop policy if exists "payments_owner_or_admin_select" on public.payments;
create policy "payments_owner_or_admin_select" on public.payments
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "payments_owner_insert" on public.payments;
drop policy if exists "payments_admin_update" on public.payments;
drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- platform_settings: public read (client needs payment_mode / booking_enabled), admin write
drop policy if exists "platform_settings_public_read" on public.platform_settings;
create policy "platform_settings_public_read" on public.platform_settings for select using (true);
drop policy if exists "platform_settings_admin_write" on public.platform_settings;
create policy "platform_settings_admin_write" on public.platform_settings for update using (public.is_admin());

-- admin_logs: admin-only read and write
drop policy if exists "admin_logs_admin_select" on public.admin_logs;
create policy "admin_logs_admin_select" on public.admin_logs for select using (public.is_admin());
drop policy if exists "admin_logs_admin_insert" on public.admin_logs;
create policy "admin_logs_admin_insert" on public.admin_logs for insert with check (public.is_admin());

-- gift_cards: no public policies — all public access goes through the
-- security-definer functions above. Admin gets full table access for the
-- /admin/gift-cards console.
drop policy if exists "gift_cards_admin_all" on public.gift_cards;
create policy "gift_cards_admin_all" on public.gift_cards for all using (public.is_admin()) with check (public.is_admin());
