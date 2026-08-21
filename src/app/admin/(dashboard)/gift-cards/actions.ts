"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AIRFLY-${part()}-${part()}`;
}

export async function adminIssueGiftCard(
  amount: number,
  recipientEmail?: string
): Promise<{ ok: boolean; code?: string; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      ok: true,
      code: generateCode(),
      message: "Preview only — connect Supabase to persist issued cards.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gift_cards")
      .insert({
        code: generateCode(),
        amount,
        recipient_email: recipientEmail || null,
        issued_by: "admin",
        status: "active",
      })
      .select()
      .single();

    if (error || !data) throw error ?? new Error("insert failed");

    await logAdminAction("gift_cards.issue", { code: data.code, amount });
    revalidatePath("/admin/gift-cards");
    return { ok: true, code: data.code, message: "Gift card issued." };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `${err.message} — you likely need an authenticated admin session (RLS blocks anonymous writes).`
          : "Failed to issue gift card.",
    };
  }
}

export async function adminVoidGiftCard(id: string): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist changes." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("gift_cards")
      .update({ status: "void" })
      .eq("id", id)
      .eq("status", "active");
    if (error) throw error;

    await logAdminAction("gift_cards.void", { id });
    revalidatePath("/admin/gift-cards");
    return { ok: true, message: "Card voided." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to void card." };
  }
}
