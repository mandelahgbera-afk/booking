"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";
import type { CryptoCoin } from "@/lib/data";

export async function setCryptoAddress(
  coin: CryptoCoin,
  address: string
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist changes." };
  }
  const trimmed = address.trim();
  if (!trimmed) return { ok: false, message: "Address can't be empty." };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("crypto_addresses")
      .upsert({ coin, address: trimmed, updated_by: user?.email ?? "admin", updated_at: new Date().toISOString() });
    if (error) throw error;

    await logAdminAction("crypto_addresses.update", { coin });
    revalidatePath("/admin/crypto");
    revalidatePath("/gift-cards");
    return { ok: true, message: "Saved." };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `${err.message} — you likely need an authenticated admin session (RLS blocks anonymous writes).`
          : "Failed to save address.",
    };
  }
}
