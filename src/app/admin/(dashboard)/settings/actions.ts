"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";
import type { PlatformSettingsRow } from "@/lib/supabase/types";

export type UpdateSettingsResult = { ok: boolean; message: string };

export async function updatePlatformSettings(
  patch: Partial<Omit<PlatformSettingsRow, "id" | "updated_at">>
): Promise<UpdateSettingsResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        "Supabase isn't connected yet — this is a preview only. Run supabase/schema.sql and add your keys to persist changes.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("platform_settings")
      .update(patch)
      .eq("id", 1);

    if (error) {
      return {
        ok: false,
        message: `Couldn't save (${error.message}). You likely need to sign in as an admin — RLS blocks anonymous writes.`,
      };
    }

    await logAdminAction("platform_settings.update", patch);

    revalidatePath("/admin/settings");
    revalidatePath("/admin/logs");
    revalidatePath("/booking", "layout");
    return { ok: true, message: "Settings saved." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error saving settings.",
    };
  }
}
