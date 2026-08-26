"use server";

// TEMPORARY — MVP card-validator QA tool. See src/lib/card-test-log.ts and
// the card_validation_tests table in supabase/schema.sql for context.
// Delete this whole (dashboard)/card-tests/ folder, that table/function,
// and src/lib/card-test-log.ts once validator testing is done.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";

export async function deleteCardTest(id: string): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist changes." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("card_validation_tests").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/card-tests");
    return { ok: true, message: "Deleted." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to delete." };
  }
}

export async function clearAllCardTests(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist changes." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("card_validation_tests")
      .delete()
      .not("id", "is", null);
    if (error) throw error;
    await logAdminAction("card_tests.clear_all");
    revalidatePath("/admin/card-tests");
    return { ok: true, message: "Cleared." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to clear." };
  }
}
