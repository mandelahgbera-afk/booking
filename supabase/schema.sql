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
  region text not null check (region in ('USA', 'Asia', 'UK', 'Other')),
  lat double precision not null,
  lng double precision not null
);

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

create index if not exists flights_route_idx on public.flights (from_code, to_code, depart_at);

-- ─────────────────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default upper(substr(md5(random()::text), 1, 6)),
  user_id uuid not null references auth.users (id) on delete cascade,
  flight_id uuid not null references public.flights (id),
  passengers jsonb not null default '[]'::jsonb,   -- [{ name, email, seat }]
  seats text[] not null default '{}',
  cabin text not null default 'Economy',
  total_amount numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- payments  (simulated payment intents)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(10, 2) not null,
  method text not null default 'card' check (method in ('card', 'apple_pay', 'google_pay', 'paypal', 'split')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  simulated_outcome text check (simulated_outcome in ('success', 'pending', 'fail')),
  transaction_id text not null default ('sim_' || substr(md5(random()::text), 1, 12)),
  created_at timestamptz not null default now()
);

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
    check (payment_mode in ('simulate_success', 'simulate_pending', 'simulate_fail', 'random', 'live')),
  maintenance_mode boolean not null default false,
  booking_enabled boolean not null default true,
  service_fee_percent numeric(5, 2) not null default 3.5,
  -- Master gate in front of every simulated transactional email (booking
  -- confirmations, receipts, gift card purchase/redeem, welcome, contact
  -- auto-reply). Mirrors payment_mode: the admin panel is the single
  -- conditional controller in front of these triggers, standing in for the
  -- real approval/business logic a production system would have.
  email_notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Idempotent — picks up new columns on a project that already ran an
-- earlier version of this file, without needing a reset.
alter table public.platform_settings add column if not exists email_notifications_enabled boolean not null default true;

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
  issued_by text not null default 'purchase',   -- 'purchase' | 'admin:<name>'
  redeemed_email text,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists gift_cards_status_idx on public.gift_cards (status);
create index if not exists gift_cards_redeemed_email_idx on public.gift_cards (redeemed_email);

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
create or replace function public.issue_gift_card(p_amount numeric, p_recipient_email text default null)
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
      insert into public.gift_cards (code, amount, recipient_email, issued_by)
      values (v_code, p_amount, p_recipient_email, 'purchase')
      returning * into v_row;
      exit;
    exception when unique_violation then
      -- extremely unlikely code collision — try again
    end;
  end loop;

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.issue_gift_card(numeric, text) to anon, authenticated;

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

-- bookings: owner + admin only
drop policy if exists "bookings_owner_or_admin_select" on public.bookings;
create policy "bookings_owner_or_admin_select" on public.bookings
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "bookings_owner_insert" on public.bookings;
create policy "bookings_owner_insert" on public.bookings
  for insert with check (auth.uid() = user_id);
drop policy if exists "bookings_owner_or_admin_update" on public.bookings;
create policy "bookings_owner_or_admin_update" on public.bookings
  for update using (auth.uid() = user_id or public.is_admin());

-- payments: owner + admin only
drop policy if exists "payments_owner_or_admin_select" on public.payments;
create policy "payments_owner_or_admin_select" on public.payments
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "payments_owner_insert" on public.payments;
create policy "payments_owner_insert" on public.payments
  for insert with check (auth.uid() = user_id);
drop policy if exists "payments_admin_update" on public.payments;
create policy "payments_admin_update" on public.payments
  for update using (public.is_admin());

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
