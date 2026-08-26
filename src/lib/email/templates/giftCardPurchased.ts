import { renderEmailShell, renderInfoCard, escapeHtml } from "../shell";
import { formatCurrency } from "@/lib/utils";

// Sent to the RECIPIENT of a gift card (may be the buyer themself, or
// someone they gifted it to via the recipient email at purchase time).
export function giftCardPurchasedEmail({
  code,
  amount,
  fromName,
  siteUrl,
}: {
  code: string;
  amount: number;
  fromName?: string;
  siteUrl?: string;
}) {
  const gifted = Boolean(fromName);
  return {
    subject: gifted
      ? `${fromName} sent you a ${formatCurrency(amount)} AirFly gift card 🎁`
      : `Your ${formatCurrency(amount)} AirFly gift card is ready`,
    html: renderEmailShell({
      preheader: `Gift card code ${code} — worth ${formatCurrency(amount)} toward any AirFly booking.`,
      icon: "gift",
      title: gifted ? "You've got a gift card!" : "Your gift card is ready",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          ${
            gifted
              ? `<strong>${escapeHtml(fromName!)}</strong> sent you a ${formatCurrency(amount)} AirFly gift card. Redeem it in seconds — scan the code in-app or enter it manually.`
              : `Here's your ${formatCurrency(amount)} gift card. Redeem it toward any booking, or forward this email to gift it to someone else.`
          }
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td class="bg-soft" style="background-color:#f8fafc; border:1px dashed #f97316; border-radius:14px; padding:18px 32px;">
              <span style="font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size:22px; font-weight:800; letter-spacing:3px; color:#ea580c;">${code}</span>
            </td>
          </tr>
        </table>

        ${renderInfoCard([{ label: "Value", value: formatCurrency(amount) }, { label: "Expires", value: "Never" }])}`,
      button: { label: "Redeem gift card", url: `${siteUrl ?? "https://airfly.example"}/gift-cards` },
      footerNote: "Keep this code private — anyone with it can redeem the balance.",
      siteUrl,
    }),
  };
}
