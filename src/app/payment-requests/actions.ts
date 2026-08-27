"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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
  // Every downstream consumer of this request (approve/decline/notification
  // emails) assumes a real address exists — reject here instead of creating
  // a request with nowhere for its outcome email to go.
  if (!email || !email.includes("@")) {
    return { ok: false, message: "A valid email is required." };
  }
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("create_payment_request", {
      p_type: type,
      p_email: email,
      p_amount: amount,
      p_metadata: metadata,
    });
    if (error || !data) return { ok: false, message: error?.message ?? "Failed to submit for review." };
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
