import "server-only";
import { Resend } from "resend";
import { getPlatformSettings } from "@/lib/data";

// Real email sending, via Resend — gated behind the admin's
// `email_notifications_enabled` toggle in Platform Settings, the same
// "admin panel is the conditional controller in front of every simulated
// trigger" pattern as `payment_mode`. Every call is best-effort: if the
// toggle is off, RESEND_API_KEY isn't set, or the send fails, this logs and
// returns { ok: false } instead of throwing — an email failing to send
// should never break a booking, a gift card purchase, or a signup.

const FROM_ADDRESS = process.env.EMAIL_FROM || "AirFly <onboarding@resend.dev>";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

let client: Resend | null = null;
function getClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  console.log(`[email] sendEmail called: "${subject}" to ${to}`);
  const settings = await getPlatformSettings();
  console.log(`[email] email_notifications_enabled=${settings.email_notifications_enabled} isEmailConfigured=${isEmailConfigured} from=${FROM_ADDRESS}`);
  if (!settings.email_notifications_enabled) {
    console.warn(`[email] Disabled in Platform Settings — skipped "${subject}" to ${to}`);
    return { ok: false, error: "Email notifications are turned off in Platform Settings." };
  }

  if (!isEmailConfigured) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return { ok: false, error: "Email sending isn't configured yet (RESEND_API_KEY missing)." };
  }

  try {
    const { data, error } = await getClient().emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) {
      console.error(`[email] Resend rejected "${subject}" to ${to}:`, error);
      return { ok: false, error: error.message };
    }
    console.log(`[email] Resend accepted "${subject}" to ${to} — id=${data?.id}`);
    return { ok: true };
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
