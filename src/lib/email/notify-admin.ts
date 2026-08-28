import "server-only";
import { sendEmail } from "@/lib/email/send";
import { adminTransactionAlertEmail, type AdminAlertKind } from "@/lib/email/templates";
import { getPlatformSettings } from "@/lib/data";

const siteUrl = process.env.NEXT_SITE_URL || "http://localhost:3000";

// Fire-and-forget operational alert to the admin address in Platform
// Settings. Never throws and never blocks the customer's transaction — if
// no address is configured, this is a silent no-op by design, so the
// feature is opt-in rather than something that breaks checkout when unset.
export async function notifyAdminOfTransaction(input: {
  kind: AdminAlertKind;
  transactionType: "booking" | "gift_card";
  amount: number;
  customerEmail?: string | null;
  method?: string | null;
  reference?: string | null;
}) {
  try {
    const settings = await getPlatformSettings();
    const to = settings.admin_notification_email?.trim();
    if (!to || !to.includes("@")) return;

    const copy = adminTransactionAlertEmail({ ...input, siteUrl });
    const res = await sendEmail({ to, ...copy });
    if (!res.ok) {
      console.warn(`[admin-alert] ${input.kind} alert to ${to} didn't send: ${res.error}`);
    }
  } catch (err) {
    console.error("[admin-alert] failed:", err);
  }
}
