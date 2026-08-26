import { renderEmailShell, escapeHtml } from "../shell";

export function contactAutoReplyEmail({ name, siteUrl }: { name: string; siteUrl?: string }) {
  const firstName = name.split(" ")[0] || "there";
  return {
    subject: "We got your message",
    html: renderEmailShell({
      preheader: "Thanks for reaching out — we typically reply within a few hours.",
      icon: "mail",
      title: "Message received",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          Thanks, ${escapeHtml(firstName)} — our support team has your message and typically replies within a
          few hours. For urgent booking issues, live chat in the app is fastest.
        </div>`,
      button: { label: "Visit help center", url: `${siteUrl ?? "https://airfly.example"}/contact` },
      footerNote: "This is an automatic confirmation — a real reply is on its way separately.",
      siteUrl,
    }),
  };
}
