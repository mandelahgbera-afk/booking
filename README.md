# AirFly

A custom flight booking web app — Next.js 16 (App Router, Turbopack), Tailwind v4, Supabase, and Mapbox.

## Getting started locally

```bash
npm install
cp .env.example .env.local   # then fill in the values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully on
realistic mock data (`src/lib/mock-data.ts`, `src/lib/admin-mock.ts`) even
with `.env.local` empty — Supabase and Mapbox are progressive enhancements,
not hard requirements to browse the site.

## Environment variables

See [`.env.example`](.env.example) for the full list. Set the same keys in
**Vercel → Project → Settings → Environment Variables** (Production, Preview,
and Development) before deploying — the app reads them at runtime.

| Variable | Where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | [Mapbox account → Access tokens](https://account.mapbox.com/access-tokens) | Optional — falls back to a placeholder on `/flights` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API | Optional — falls back to mock data everywhere |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API | Optional — safe to expose, RLS does the real access control |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API | Not currently used by app code — reserved for future server-only jobs. Never expose with `NEXT_PUBLIC_` |

## Setting up Supabase

Run these three files, **in order**, in the Supabase SQL editor:

1. `supabase/reset.sql` — ⚠️ destructive. Drops everything in the `public`
   schema first. Only needed once, or if you need to wipe a project that has
   leftover tables from something else. Skip this on a genuinely fresh project.
2. `supabase/schema.sql` — tables, RLS policies, triggers. Safe to re-run.
3. `supabase/seed.sql` — realistic sample data (airports, flights, reviews, a
   few admin log entries).
4. `supabase/optimize.sql` — indexes matched to the app's actual query
   patterns (foreign keys, featured-reviews lookup, low-seat flights, etc.)
   plus an `analyze`. Run once after seeding; safe to re-run after any bulk
   data load.

Once `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set and
the schema exists, every page automatically switches from mock data to live
Supabase data — no code changes needed (see `src/lib/data.ts`).

## Admin access

`/admin` requires a signed-in user whose `profiles.role` is `'admin'` —
enforced twice: an optimistic "are you signed in" redirect in `src/proxy.ts`,
and the authoritative role check in `src/app/admin/(dashboard)/layout.tsx`.
Signed-out or non-admin visitors are bounced to `/admin/login`.

To create your first admin:

1. Supabase Dashboard → **Authentication → Users → Add user** — set an email
   and password there directly (not via this app, and not by pasting a
   password into a chat with an AI assistant).
2. Run in the SQL editor:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
3. Sign in at `/admin/login`.

If `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` aren't set yet,
`/admin` is reachable without login (there's nothing real to protect — it's
all mock data) and shows a banner saying so. The moment Supabase is
configured, the login gate applies automatically.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset:
   Next.js — no extra config needed).
2. Add the environment variables above under Project Settings.
3. Deploy. `src/proxy.ts` (Next 16's renamed Middleware) runs on Vercel's
   Edge Runtime automatically.

### Why this should stay fast on Vercel

- **No Postgres connection pooling to worry about.** Every Supabase call goes
  through PostgREST over HTTPS (`@supabase/supabase-js` / `@supabase/ssr`),
  not a raw `pg` connection — so there's no pooler/`PgBouncer` config needed,
  unlike Prisma-style direct-connection setups on serverless.
- **Public pages are statically generated + ISR-cached**, not re-rendered
  per request. `/` is fully static; `/flights` revalidates every 60s;
  `/booking/[id]` every 30s. This is only possible because public reads use
  a stateless client (`src/lib/supabase/public.ts`) with no `cookies()` call —
  using the cookie-bound server client anywhere forces a route dynamic.
- **`/admin/*` is explicitly `force-dynamic`** (set once, on the layout) so
  operational data (bookings, revenue, logs) is never served stale from cache.
- **Images** go through `next/image` with `remotePatterns` allow-listing
  Unsplash in `next.config.ts`, so Vercel's image optimizer handles resizing/
  format conversion instead of shipping full-size originals.
- **Indexes match real queries** — see `supabase/optimize.sql` for the
  reasoning behind each one.

## Project structure

- `src/app/(site)` — public site (landing, `/flights`, `/booking/[id]`), wrapped in `(site)/layout.tsx` (Navbar + Footer).
- `src/app/admin` — admin console, own sidebar shell, always dynamic.
- `src/lib/data.ts` — the only place pages should fetch flights/destinations/testimonials/settings from; handles the Supabase ↔ mock-data fallback.
- `src/lib/supabase/` — `public.ts` (stateless, public reads), `server.ts` (cookie-bound, for admin/user-scoped reads+writes), `client.ts` (browser).
- `supabase/` — `schema.sql`, `seed.sql`, `optimize.sql`, `reset.sql`.
