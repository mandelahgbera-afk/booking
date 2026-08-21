"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { isSupabaseConfigured } from "./env";

// Browser-side Supabase client. Only call this when isSupabaseConfigured is
// true — components should fall back to mock data otherwise.
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
