import { renderEmailShell, renderInfoCard } from "../shell";
import { formatCurrency } from "@/lib/utils";

const RETRY_LABEL: Record<"wallet" | "crypto" | "card", string> = {
  wallet: "your AirFly wallet balance",
  crypto: "crypto",
  card: "a different card",
};

const SAME_METHOD_LABEL: Record<"wallet" | "crypto" | "card", string> = {
  wallet: "your AirFly wallet balance",
  crypto: "crypto",
  card: "your card",
};

// Sent when a simulated payment "fails" — either automatically (Platform
// Settings payment_mode) or via an admin's "Decline" / "Decline + recommend"
// in /admin/transactions.
//
// `sameMethod` distinguishes the two admin actions: a plain "Decline" means
// "this specific attempt didn't work, try again the same way" (a card
// declining once doesn't mean the card is bad), while "Decline + recommend
// X" means "switch payment methods entirely." Wording and the button label
// both reflect which one this is — "try again" vs "instead."
export function transactionFailedEmail({
  type,
  reference,
  amount,
  retryUrl,
  retryMethod,
  sameMethod = false,
}: {
  type: "booking" | "gift_card";
  reference: string;
  amount: number;
  retryUrl: string;
  retryMethod: "wallet" | "crypto" | "card";
  sameMethod?: boolean;
}) {
  const isBooking = type === "booking";
  const retryLabel = sameMethod ? SAME_METHOD_LABEL[retryMethod] : RETRY_LABEL[retryMethod];
  const actionPhrase = sameMethod ? `try again with ${retryLabel}` : `retry instantly using ${retryLabel} instead`;
  return {
    subject: isBooking
      ? `Payment didn't go through — retry booking ${reference}`
      : "Your gift card payment didn't go through",
    html: renderEmailShell({
      preheader: `Your payment didn't go through — ${actionPhrase}.`,
      icon: "warning",
      title: "Payment didn't go through",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          ${
            isBooking
              ? `Your payment was declined for this booking. No charge was made. You can ${actionPhrase}.`
              : `Your payment was declined for this gift card purchase. No charge was made. You can ${actionPhrase}.`
          }
        </div>
        ${renderInfoCard([
          { label: isBooking ? "Booking reference" : "Attempted purchase", value: reference },
          { label: "Amount", value: formatCurrency(amount) },
        ])}`,
      button: { label: sameMethod ? "Try again" : `Retry with ${retryLabel}`, url: retryUrl },
      footerNote: sameMethod
        ? "This link takes you straight back to checkout, ready to try again."
        : "This link takes you straight back to checkout with the alternate payment method ready to go.",
    }),
  };
}
