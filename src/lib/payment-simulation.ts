import type { PlatformSettingsRow } from "@/lib/supabase/types";

export type PaymentOutcome = "success" | "pending" | "fail";

// Shared by both checkout flows (booking + gift card purchase) so the
// admin's payment_mode setting controls every simulated card payment the
// same way, in one place.
export function resolvePaymentOutcome(mode: PlatformSettingsRow["payment_mode"]): PaymentOutcome {
  switch (mode) {
    case "simulate_pending":
      return "pending";
    case "simulate_fail":
      return "fail";
    case "random": {
      const r = Math.random();
      if (r < 0.15) return "fail";
      if (r < 0.3) return "pending";
      return "success";
    }
    default:
      return "success";
  }
}
