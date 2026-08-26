"use server";

// TEMPORARY — MVP-only helper. Logs whatever is typed into the checkout
// card form to public.card_validation_tests so an admin can compare our
// client-side validator's verdict (src/lib/card-validation.ts) against
// Stripe's own test-card outcomes. Use Stripe TEST card numbers only —
// never a real card. Delete this file, the log_card_validation_test SQL
// function, and src/app/admin/(dashboard)/card-tests/ once validator
// testing is done.

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CardBrand } from "@/lib/card-validation";

export async function logCardValidationTest(input: {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  brand: CardBrand;
  valid: boolean;
  message?: string;
  // Billing address — Stripe verifies these too (AVS), so the QA log needs
  // them to be a real comparison point, not just the card number itself.
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = createPublicClient();
    await supabase.rpc("log_card_validation_test", {
      p_name: input.name,
      p_number: input.number,
      p_expiry: input.expiry,
      p_cvc: input.cvc,
      p_brand: input.brand,
      p_valid: input.valid,
      p_message: input.message ?? null,
      p_address: input.address ?? null,
      p_city: input.city ?? null,
      p_postal_code: input.postalCode ?? null,
      p_country: input.country ?? null,
    });
  } catch {
    // Best-effort — never block checkout over a QA log write.
  }
}
