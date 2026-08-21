import { cookies } from "next/headers";

// A lightweight "who's redeeming" identity — no auth system exists yet, so a
// gift-card redemption just asks for an email and remembers it in a cookie,
// the same way most real gift-card flows let you check a balance without a
// full account. Once real auth lands, swap this for the session's user email.
export const WALLET_EMAIL_COOKIE = "airfly_wallet_email";
// Used only when Supabase isn't configured/reachable — keeps the wallet demo
// fully working (credit accrues, balance persists across visits) without a
// database, so the feature never feels broken while you're setting up Supabase.
export const WALLET_MOCK_BALANCE_COOKIE = "airfly_wallet_mock_balance";

export async function getWalletEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(WALLET_EMAIL_COOKIE)?.value ?? null;
}

export async function getMockWalletBalance(): Promise<number> {
  const store = await cookies();
  return Number(store.get(WALLET_MOCK_BALANCE_COOKIE)?.value ?? 0);
}
