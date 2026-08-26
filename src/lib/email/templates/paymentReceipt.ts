import { renderEmailShell, renderInfoCard } from "../shell";
import { formatCurrency } from "@/lib/utils";

export function paymentReceiptEmail({
  reference,
  method,
  transactionId,
  amount,
  date,
  siteUrl,
}: {
  reference: string;
  method: string;
  transactionId: string;
  amount: number;
  date: string;
  siteUrl?: string;
}) {
  return {
    subject: `Receipt — ${formatCurrency(amount)} for booking ${reference}`,
    html: renderEmailShell({
      preheader: `Payment of ${formatCurrency(amount)} received for booking ${reference}.`,
      icon: "receipt",
      title: "Payment received",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          This confirms your payment for booking <strong>${reference}</strong>. Keep this for your records.
        </div>
        ${renderInfoCard([
          { label: "Amount charged", value: formatCurrency(amount) },
          { label: "Payment method", value: method },
          { label: "Transaction ID", value: transactionId },
          { label: "Date", value: date },
        ])}`,
      button: { label: "View full receipt", url: `${siteUrl ?? "https://airfly.example"}/flights` },
      footerNote: "This is an automated receipt — no reply needed.",
      siteUrl,
    }),
  };
}
