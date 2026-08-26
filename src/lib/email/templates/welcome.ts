import { renderEmailShell, escapeHtml } from "../shell";

export function welcomeEmail({ name, siteUrl }: { name: string; siteUrl?: string }) {
  const firstName = name.split(" ")[0] || "there";
  return {
    subject: "Welcome to AirFly ✈️",
    html: renderEmailShell({
      preheader: "Your account is ready — here's what to do first.",
      icon: "wave",
      title: `Welcome aboard, ${firstName}`,
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          Your AirFly account is ready. Compare fares across the USA, Asia, and the UK,
          save travelers for faster checkout, and track every booking in one place.
        </div>`,
      button: { label: "Search your first flight", url: `${siteUrl ?? "https://airfly.example"}/flights` },
      footerNote: `Sent to confirm your new AirFly account, ${escapeHtml(name)}.`,
      siteUrl,
    }),
  };
}
