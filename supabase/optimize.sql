-- Performance pass for the AirFly schema. Safe to re-run.
-- Run this AFTER schema.sql (and seed.sql if you're seeding).
--
-- Why this matters on Vercel specifically: every page in this app talks to
-- Supabase over PostgREST (HTTPS), not a raw Postgres connection — so there's
-- no connection-pooling problem to solve here (that's only an issue for
-- Prisma/pg-style direct connections from serverless functions). The real
-- levers are (1) indexes matching the app's actual query patterns, and
-- (2) not making Postgres re-plan/re-scan on every request — both handled
-- below, paired with the ISR caching already set up in the Next.js routes.

-- ─────────────────────────────────────────────────────────────────────────
-- Foreign-key columns Postgres does NOT auto-index. Every one of these is
-- joined or filtered on directly by src/lib/data.ts.
-- ─────────────────────────────────────────────────────────────────────────
create index if not exists flights_airline_idx on public.flights (airline_code);
create index if not exists flights_to_code_idx on public.flights (to_code);
create index if not exists bookings_flight_idx on public.bookings (flight_id);
create index if not exists payments_booking_idx on public.payments (booking_id);
create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists reviews_user_idx on public.reviews (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Query-shaped composite/partial indexes.
-- ─────────────────────────────────────────────────────────────────────────

-- getFlightOffers(): filters by route, always orders by depart_at.
-- (flights_route_idx from schema.sql already covers from_code+to_code+depart_at;
-- this one serves the common "just show me what's flying out of X soon" case.)
create index if not exists flights_from_depart_idx on public.flights (from_code, depart_at);

-- Admin dashboard / flights table: surfaces low-availability flights first.
create index if not exists flights_seats_left_idx on public.flights (seats_left)
  where seats_left < 10;

-- getTestimonials(): only ever queries is_featured = true, newest first.
create index if not exists reviews_featured_idx on public.reviews (created_at desc)
  where is_featured = true;

-- Admin bookings/payments views: newest first, filtered by status.
create index if not exists bookings_status_idx on public.bookings (status, created_at desc);
create index if not exists payments_status_idx on public.payments (status, created_at desc);

-- admin_logs already has admin_logs_created_idx from schema.sql — covers
-- the /admin/logs "most recent 50" query.

-- ─────────────────────────────────────────────────────────────────────────
-- Keep the planner's statistics fresh after a bulk seed/reset.
-- ─────────────────────────────────────────────────────────────────────────
analyze public.airports;
analyze public.airlines;
analyze public.flights;
analyze public.bookings;
analyze public.payments;
analyze public.reviews;
analyze public.platform_settings;
analyze public.admin_logs;
analyze public.gift_cards;
