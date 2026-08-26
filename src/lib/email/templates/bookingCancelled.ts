import { renderEmailShell, renderInfoCard, escapeHtml } from "../shell";
import { formatCurrency } from "@/lib/utils";

export function bookingCancelledEmail({
  passengerName,
  reference,
  from,
  to,
  refundAmount,
  siteUrl,
}: {
  passengerName: string;
  reference: string;
  from: string;
  to: string;
  refundAmount: number;
  siteUrl?: string;
}) {
  return {
    subject: `Booking cancelled — ${reference}`,
    html: renderEmailShell({
      preheader: `Your booking ${reference} (${from} → ${to}) has been cancelled.`,
      icon: "warning",
      title: "Booking cancelled",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          Hi ${escapeHtml(passengerName)}, your booking has been cancelled as requested.
          ${refundAmount > 0 ? "A refund is on its way." : ""}
        </div>
        ${renderInfoCard([
          { label: "Reference", value: reference },
          { label: "Route", value: `${from} → ${to}` },
          { label: "Refund amount", value: formatCurrency(refundAmount) },
          { label: "Refund timing", value: "3–5 business days" },
        ])}`,
      button: { label: "Book a new flight", url: `${siteUrl ?? "https://airfly.example"}/flights` },
      footerNote: "Refunded to your original payment method automatically — no action needed.",
      siteUrl,
    }),
  };
}
