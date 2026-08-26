import { renderEmailShell, renderInfoCard } from "../shell";
import { formatCurrency } from "@/lib/utils";

// Sent when a simulated card payment "fails" (admin-controlled, via
// Platform Settings payment_mode). The retry link always offers a
// different payment method than the one that just failed — wallet/gift-card
// balance for a flight, train, or bus booking; crypto for a gift card
// purchase — rather than just asking the traveler to try the same card
// again, which is what a real "this keeps failing" moment actually needs.
export function transactionFailedEmail({
  type,
  reference,
  amount,
  retryUrl,
}: {
  type: "booking" | "gift_card";
  reference: string;
  amount: number;
  retryUrl: string;
}) {
  const isBooking = type === "booking";
  return {
    subject: isBooking
      ? `Payment didn't go through — retry booking ${reference}`
      : "Your gift card payment didn't go through",
    html: renderEmailShell({
      preheader: isBooking
        ? "Your card was declined — retry with your wallet balance instead."
        : "Your card was declined — retry with crypto instead.",
      icon: "warning",
      title: "Payment didn't go through",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          ${
            isBooking
              ? "Your card was declined for this booking. No charge was made. You can retry instantly using your AirFly wallet balance instead of a card."
              : "Your card was declined for this gift card purchase. No charge was made. You can retry instantly by paying with crypto instead."
          }
        </div>
        ${renderInfoCard([
          { label: isBooking ? "Booking reference" : "Attempted purchase", value: reference },
          { label: "Amount", value: formatCurrency(amount) },
        ])}`,
      button: { label: isBooking ? "Retry with wallet balance" : "Retry with crypto", url: retryUrl },
      footerNote: "This link takes you straight back to checkout with the alternate payment method ready to go.",
    }),
  };
}
