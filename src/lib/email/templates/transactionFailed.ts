import { renderEmailShell, renderInfoCard } from "../shell";
import { formatCurrency } from "@/lib/utils";

const RETRY_LABEL: Record<"wallet" | "crypto" | "card", string> = {
  wallet: "your AirFly wallet balance",
  crypto: "crypto",
  card: "a different card",
};

// Sent when a simulated payment "fails" — either automatically (Platform
// Settings payment_mode) or via an admin's "Decline" / "Decline + recommend"
// in /admin/transactions. `retryMethod` always names whichever method the
// buyer did NOT just try: wallet for a booking, and for a gift card, the
// opposite of whichever the buyer actually attempted — card failing
// recommends crypto, crypto failing recommends card — never assumed.
export function transactionFailedEmail({
  type,
  reference,
  amount,
  retryUrl,
  retryMethod,
}: {
  type: "booking" | "gift_card";
  reference: string;
  amount: number;
  retryUrl: string;
  retryMethod: "wallet" | "crypto" | "card";
}) {
  const isBooking = type === "booking";
  const retryLabel = RETRY_LABEL[retryMethod];
  return {
    subject: isBooking
      ? `Payment didn't go through — retry booking ${reference}`
      : "Your gift card payment didn't go through",
    html: renderEmailShell({
      preheader: `Your payment didn't go through — retry with ${retryLabel} instead.`,
      icon: "warning",
      title: "Payment didn't go through",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          ${
            isBooking
              ? `Your payment was declined for this booking. No charge was made. You can retry instantly using ${retryLabel} instead.`
              : `Your payment was declined for this gift card purchase. No charge was made. You can retry instantly by paying with ${retryLabel} instead.`
          }
        </div>
        ${renderInfoCard([
          { label: isBooking ? "Booking reference" : "Attempted purchase", value: reference },
          { label: "Amount", value: formatCurrency(amount) },
        ])}`,
      button: { label: `Retry with ${retryLabel}`, url: retryUrl },
      footerNote: "This link takes you straight back to checkout with the alternate payment method ready to go.",
    }),
  };
}
