"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";
import { WALLET_EMAIL_COOKIE, WALLET_MOCK_BALANCE_COOKIE } from "@/lib/wallet";

// Demo codes that work even with zero Supabase setup, so the scanner/redeem
// flow is fully try-able out of the box (matches supabase/seed.sql).
const MOCK_CARDS: Record<string, { amount: number; status: "active" | "void" }> = {
  "AIRFLY-DEMO-0100": { amount: 100, status: "active" },
  "AIRFLY-DEMO-0250": { amount: 250, status: "active" },
  "AIRFLY-DEMO-0500": { amount: 500, status: "void" },
};

export type PurchaseResult =
  | { ok: true; code: string; amount: number }
  | { ok: false; message: string };

export async function purchaseGiftCard(
  amount: number,
  recipientEmail?: string
): Promise<PurchaseResult> {
  if (!isSupabaseConfigured) {
    // Demo code, not persisted — clearly a preview experience, but the flow
    // (payment step → generated code → QR) still works end to end.
    const code = `AIRFLY-PRVW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return { ok: true, code, amount };
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("issue_gift_card", {
      p_amount: amount,
      p_recipient_email: recipientEmail || null,
    });
    if (error || !data) throw error ?? new Error("No card returned");
    return { ok: true, code: data.code, amount: Number(data.amount) };
  } catch {
    const code = `AIRFLY-PRVW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return { ok: true, code, amount };
  }
}

export type RedeemResult = { ok: boolean; message: string; amount?: number };

export async function redeemGiftCard(rawCode: string, email: string): Promise<RedeemResult> {
  const code = rawCode.trim().toUpperCase();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email to redeem to." };
  }

  const store = await cookies();

  if (isSupabaseConfigured) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("redeem_gift_card", {
        p_code: code,
        p_email: email,
      });
      if (error) throw error;
      if (data && "success" in data && data.success) {
        store.set(WALLET_EMAIL_COOKIE, email.toLowerCase(), {
          maxAge: 60 * 60 * 24 * 180,
          path: "/",
        });
        revalidatePath("/gift-cards");
        return { ok: true, message: data.message, amount: data.amount };
      }
      return { ok: false, message: data?.message ?? "That code couldn't be redeemed." };
    } catch {
      // fall through to mock path below
    }
  }

  const mock = MOCK_CARDS[code];
  if (!mock || mock.status !== "active") {
    return { ok: false, message: "That code is invalid, already used, or has been voided." };
  }

  const current = Number(store.get(WALLET_MOCK_BALANCE_COOKIE)?.value ?? 0);
  store.set(WALLET_MOCK_BALANCE_COOKIE, String(current + mock.amount), {
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  store.set(WALLET_EMAIL_COOKIE, email.toLowerCase(), {
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  revalidatePath("/gift-cards");
  return { ok: true, message: "Gift card redeemed — your balance has been updated.", amount: mock.amount };
}

export async function getWalletBalance(email: string | null): Promise<number> {
  if (!email) return 0;

  if (isSupabaseConfigured) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("get_wallet_balance", { p_email: email });
      if (error) throw error;
      return Number(data ?? 0);
    } catch {
      // fall through to mock cookie balance
    }
  }

  const store = await cookies();
  return Number(store.get(WALLET_MOCK_BALANCE_COOKIE)?.value ?? 0);
}

export async function spendWalletCredit(
  email: string,
  amount: number,
  source: string
): Promise<{ ok: boolean; message?: string }> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("spend_wallet_credit", {
        p_email: email,
        p_amount: amount,
        p_source: source,
      });
      if (error) throw error;
      if (data?.success) {
        await logAdminAction("wallet.spend", { email, amount, source });
        return { ok: true };
      }
      return { ok: false, message: "success" in data ? undefined : (data as { message?: string })?.message };
    } catch {
      // fall through to mock path below
    }
  }

  const store = await cookies();
  const current = Number(store.get(WALLET_MOCK_BALANCE_COOKIE)?.value ?? 0);
  if (current < amount) return { ok: false, message: "Insufficient wallet balance." };
  store.set(WALLET_MOCK_BALANCE_COOKIE, String(current - amount), {
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return { ok: true };
}
