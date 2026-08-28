"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { notifyAdminOfTransaction } from "@/lib/email/notify-admin";

// Shared by booking checkout and gift-card checkout — both submit into the
// same manual-review queue an admin works through at /admin/transactions.

export async function submitPaymentRequest(
  type: "booking" | "gift_card",
  email: string,
  amount: number,
  metadata: Record<string, unknown>
): Promise<{ ok: boolean; id?: string; message?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Manual review needs Supabase configured." };
  }
  // Email is optional: the buyer's pending screen polls for the outcome, so
  // an open tab receives the code (or the decline) without one. It's only
  // how we reach them if they close the tab — resolvePaymentRequestAction
  // skips notification cleanly when it's absent.
  const normalizedEmail = email && email.includes("@") ? email : "";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("create_payment_request", {
      p_type: type,
      p_email: normalizedEmail,
      p_amount: amount,
      p_metadata: metadata,
    });
    if (error || !data) return { ok: false, message: error?.message ?? "Failed to submit for review." };

    // Alert the admin that something is waiting on them, so the queue
    // doesn't depend on someone having /admin/transactions open.
    await notifyAdminOfTransaction({
      kind: "review_requested",
      transactionType: type,
      amount,
      customerEmail: normalizedEmail || null,
      method: (metadata.method as string) ?? null,
    });

    return { ok: true, id: data };
  } catch {
    return { ok: false, message: "Failed to submit for review." };
  }
}

export type PaymentRequestPoll = {
  status: "pending" | "approved" | "declined" | "declined_alt" | "not_found";
  altRecommendation: "wallet" | "crypto" | "card" | null;
  result: Record<string, unknown> | null;
};

export async function pollPaymentRequest(id: string): Promise<PaymentRequestPoll> {
  if (!isSupabaseConfigured) return { status: "not_found", altRecommendation: null, result: null };
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("get_payment_request_status", { p_id: id });
    if (error || !data) return { status: "not_found", altRecommendation: null, result: null };
    return { status: data.status, altRecommendation: data.alt_recommendation, result: data.result };
  } catch {
    return { status: "not_found", altRecommendation: null, result: null };
  }
}
