import { renderEmailShell, renderInfoCard, escapeHtml } from "../shell";
import { formatCurrency } from "@/lib/utils";

export type AdminAlertKind =
  | "review_requested"
  | "gift_card_purchased"
  | "booking_confirmed"
  | "payment_failed";

const KIND_COPY: Record<AdminAlertKind, { title: string; lead: string; cta: string; path: string }> = {
  review_requested: {
    title: "Payment awaiting review",
    lead: "A customer submitted a payment that needs your approval before it completes.",
    cta: "Open review queue",
    path: "/admin/transactions",
  },
  gift_card_purchased: {
    title: "Gift card purchased",
    lead: "A gift card was bought and issued automatically.",
    cta: "View gift cards",
    path: "/admin/gift-cards",
  },
  booking_confirmed: {
    title: "New booking confirmed",
    lead: "A booking was paid for and confirmed automatically.",
    cta: "View bookings",
    path: "/admin/bookings",
  },
  payment_failed: {
    title: "Payment failed",
    lead: "A customer's payment was declined and they were offered an alternate method.",
    cta: "Open admin console",
    path: "/admin",
  },
};

// Operational alert sent to the admin address configured in Platform
// Settings — fires when a transaction is INITIATED, so the queue never
// depends on someone happening to have /admin/transactions open. Distinct
// from every other template here, all of which address the customer.
export function adminTransactionAlertEmail({
  kind,
  transactionType,
  amount,
  customerEmail,
  method,
  reference,
  siteUrl,
}: {
  kind: AdminAlertKind;
  transactionType: "booking" | "gift_card";
  amount: number;
  customerEmail?: string | null;
  method?: string | null;
  reference?: string | null;
  siteUrl?: string;
}) {
  const copy = KIND_COPY[kind];
  const base = siteUrl ?? "https://www.airfly.online";
  const typeLabel = transactionType === "booking" ? "Booking" : "Gift card";

  const rows: { label: string; value: string }[] = [
    { label: "Type", value: typeLabel },
    { label: "Amount", value: formatCurrency(amount) },
  ];
  if (method) rows.push({ label: "Method", value: method });
  if (customerEmail) rows.push({ label: "Customer", value: customerEmail });
  if (reference) rows.push({ label: "Reference", value: reference });

  return {
    subject: `[AirFly] ${copy.title} — ${typeLabel} ${formatCurrency(amount)}`,
    html: renderEmailShell({
      preheader: `${copy.title}: ${typeLabel} for ${formatCurrency(amount)}${
        customerEmail ? ` from ${customerEmail}` : ""
      }.`,
      icon: kind === "payment_failed" ? "warning" : kind === "review_requested" ? "shield" : "check",
      title: copy.title,
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          ${escapeHtml(copy.lead)}
        </div>
        ${renderInfoCard(rows)}`,
      button: { label: copy.cta, url: `${base}${copy.path}` },
      footerNote:
        "You're getting this because your address is set as the admin notification email in Platform Settings.",
      siteUrl,
    }),
  };
}
