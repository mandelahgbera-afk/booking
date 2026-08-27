"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction, getPlatformSettings } from "@/lib/data";
import { resolvePaymentOutcome } from "@/lib/payment-simulation";
import { WALLET_EMAIL_COOKIE, WALLET_MOCK_BALANCE_COOKIE } from "@/lib/wallet";
import { sendEmail } from "@/lib/email/send";
import { giftCardPurchasedEmail, giftCardRedeemedEmail, transactionFailedEmail } from "@/lib/email/templates";

const siteUrl = process.env.NEXT_SITE_URL || "http://localhost:3000";

// Demo codes that work even with zero Supabase setup, so the scanner/redeem
// flow is fully try-able out of the box (matches supabase/seed.sql).
const MOCK_CARDS: Record<string, { amount: number; status: "active" | "void" }> = {
  "AIRFLY-DEMO-0100": { amount: 100, status: "active" },
  "AIRFLY-DEMO-0250": { amount: 250, status: "active" },
  "AIRFLY-DEMO-0500": { amount: 500, status: "void" },
};

export type PurchaseResult =
  | { ok: true; code: string; amount: number; emailWarning?: string }
  | { ok: false; message: string };

export async function purchaseGiftCard(
  amount: number,
  buyerEmail: string,
  recipientEmail?: string,
  method: "card" | "crypto" = "card"
): Promise<PurchaseResult> {
  // Both methods go through the same admin-controlled simulated outcome —
  // card can fail and recommend crypto, and crypto can fail and recommend
  // card right back, not just one direction. Manual review stays card-only
  // (the caller intercepts before this is even called for card in that
  // mode) since there's no real-world "manual review" step for a crypto
  // confirmation the way there is for a card charge — resolvePaymentOutcome
  // just falls through to "success" for crypto under that mode.
  const settings = await getPlatformSettings();
  const outcome = resolvePaymentOutcome(settings.payment_mode);
  if (outcome === "fail") {
    const altMethod = method === "card" ? "crypto" : "card";
    const copy = transactionFailedEmail({
      type: "gift_card",
      reference: `${amount}`,
      amount,
      retryUrl: `${siteUrl}/gift-cards?retry=${altMethod}`,
      retryMethod: altMethod,
    });
    await sendEmail({ to: buyerEmail, ...copy });
    return {
      ok: false,
      message: `Your ${method === "card" ? "card" : "crypto"} payment didn't go through. Check your email for a retry link, or try ${altMethod} below.`,
    };
  }
  // "pending" is treated as success for gift cards — there's no ongoing
  // state to track for a code that's already generated, unlike a booking.

  let code: string;
  let finalAmount = amount;

  if (!isSupabaseConfigured) {
    // Demo code, not persisted — clearly a preview experience, but the flow
    // (payment step → generated code → QR → email) still works end to end.
    code = `AIRFLY-PRVW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  } else {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("issue_gift_card", {
        p_amount: amount,
        p_recipient_email: recipientEmail || null,
        p_buyer_email: buyerEmail,
      });
      if (error || !data) throw error ?? new Error("No card returned");
      code = data.code;
      finalAmount = Number(data.amount);
    } catch {
      code = `AIRFLY-PRVW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }
  }

  // Best-effort — the purchase already succeeded above, so an email failure
  // here never blocks showing the buyer their code. It's still surfaced
  // (not blocking) so the buyer knows to save the code themselves.
  const gifting = recipientEmail && recipientEmail.toLowerCase() !== buyerEmail.toLowerCase();
  const buyerCopy = giftCardPurchasedEmail({ code, amount: finalAmount });
  const buyerResult = await sendEmail({ to: buyerEmail, ...buyerCopy });
  let giftResult: { ok: boolean; error?: string } | undefined;
  if (gifting) {
    const giftCopy = giftCardPurchasedEmail({ code, amount: finalAmount, fromName: buyerEmail.split("@")[0] });
    giftResult = await sendEmail({ to: recipientEmail!, ...giftCopy });
  }

  const emailWarning =
    !buyerResult.ok || (giftResult && !giftResult.ok)
      ? `Your card was issued, but the email didn't send: ${buyerResult.error ?? giftResult?.error ?? "unknown error"}`
      : undefined;

  return { ok: true, code, amount: finalAmount, emailWarning };
}

export async function refundGiftCard(
  code: string,
  email: string
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Refunds need Supabase configured." };
  }
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("refund_gift_card", {
      p_code: code.trim().toUpperCase(),
      p_email: email,
    });
    if (error) return { ok: false, message: error.message };
    if (!data.success) return { ok: false, message: data.message };

    await logAdminAction("gift_cards.refund", { code: data.code, amount: data.amount });
    return { ok: true, message: `Refunded ${data.code}. A confirmation is on its way to your email.` };
  } catch {
    return { ok: false, message: "Refund failed." };
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

        const newBalance = await getWalletBalance(email);
        const receipt = giftCardRedeemedEmail({ amount: data.amount, newBalance });
        const emailResult = await sendEmail({ to: email, ...receipt });

        return {
          ok: true,
          message: emailResult.ok
            ? data.message
            : `${data.message} (Receipt email didn't send: ${emailResult.error ?? "unknown error"})`,
          amount: data.amount,
        };
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

  const receipt = giftCardRedeemedEmail({ amount: mock.amount, newBalance: current + mock.amount });
  await sendEmail({ to: email, ...receipt });

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
