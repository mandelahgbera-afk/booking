"use server";

import { sendEmail } from "@/lib/email/send";
import { contactAutoReplyEmail } from "@/lib/email/templates";
import { logAdminAction } from "@/lib/data";

export async function submitContactMessage({
  name,
  email,
  topic,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  // Visible in /admin/logs so a real support workflow has somewhere to
  // pick this up — there's no ticketing system yet, this is the queue.
  await logAdminAction("contact.submitted", { name, email, topic, message });

  const reply = contactAutoReplyEmail({ name });
  await sendEmail({ to: email, ...reply });

  return { ok: true };
}
