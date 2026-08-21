// Whether real Supabase credentials are configured. Every data-access helper
// checks this first and falls back to mock data when it's false, so the app
// is fully browsable before a Supabase project is wired up.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
