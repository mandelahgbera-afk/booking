import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { isSupabaseConfigured } from "./env";

// Stateless client for PUBLIC reads only (destinations, flights, testimonials,
// platform_settings) — no cookies, no per-request auth. Using this instead of
// the cookie-bound server client is what lets pages like `/` and `/flights`
// stay statically generated + ISR-cached on Vercel rather than being forced
// into per-request dynamic rendering (Next.js treats any use of `cookies()`
// as an opt-out of static rendering). Never use this for anything gated by
// RLS to a specific user or admin — use `@/lib/supabase/server` for that.
let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createPublicClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  if (!cached) {
    cached = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return cached;
}
