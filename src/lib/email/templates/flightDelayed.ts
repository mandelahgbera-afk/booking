import { renderEmailShell, renderInfoCard } from "../shell";

export function flightDelayedEmail({
  reference,
  flightNumber,
  from,
  to,
  oldDepartTime,
  newDepartTime,
  siteUrl,
}: {
  reference: string;
  flightNumber: string;
  from: string;
  to: string;
  oldDepartTime: string;
  newDepartTime: string;
  siteUrl?: string;
}) {
  return {
    subject: `Update: ${flightNumber} (${from} → ${to}) is delayed`,
    html: renderEmailShell({
      preheader: `${flightNumber} now departs ${newDepartTime} instead of ${oldDepartTime}.`,
      icon: "warning",
      title: "Your flight is delayed",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          Heads up — there's a schedule change on your upcoming flight. Your booking reference and seat are unaffected.
        </div>
        ${renderInfoCard([
          { label: "Reference", value: reference },
          { label: "Flight", value: `${flightNumber} · ${from} → ${to}` },
          { label: "Original departure", value: oldDepartTime },
          { label: "New departure", value: newDepartTime },
        ])}`,
      button: { label: "View booking details", url: `${siteUrl ?? "https://airfly.example"}/flights` },
      footerNote: "We'll keep you posted if anything else changes before departure.",
      siteUrl,
    }),
  };
}
