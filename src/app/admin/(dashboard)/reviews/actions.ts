"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";

export async function createReview({
  name,
  role,
  avatarUrl,
  quote,
  rating,
  featured,
}: {
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  featured: boolean;
}): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist testimonials." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reviews").insert({
      name,
      role: role || null,
      avatar_url: avatarUrl || null,
      quote,
      rating,
      is_featured: featured,
    });
    if (error) throw error;

    await logAdminAction("reviews.create", { name, rating, featured });
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    revalidatePath("/reviews");
    return { ok: true, message: "Testimonial added." };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `${err.message} — you likely need an authenticated admin session.`
          : "Failed to add testimonial.",
    };
  }
}

export async function deleteReview(id: string): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;

    await logAdminAction("reviews.delete", { id });
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    revalidatePath("/reviews");
    return { ok: true, message: "Deleted." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to delete." };
  }
}

export async function toggleReviewFeatured(
  id: string,
  featured: boolean
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reviews").update({ is_featured: featured }).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/reviews");
    revalidatePath("/");
    revalidatePath("/reviews");
    return { ok: true, message: "Updated." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to update." };
  }
}
