"use server";

import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

// Only called when a session comes back immediately from signUp() (i.e.
// email confirmation is off in the Supabase project). When confirmation is
// required, Supabase's own "Confirm signup" template
// (supabase/email-templates/confirm-signup.html) is the first email the
// user gets instead — sending this one too, before they've confirmed
// anything, would be premature.
export async function sendWelcomeEmail(name: string, email: string) {
  const copy = welcomeEmail({ name });
  await sendEmail({ to: email, ...copy });
}
