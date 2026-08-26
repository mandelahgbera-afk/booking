import { renderEmailShell, renderInfoCard } from "../shell";
import { formatCurrency } from "@/lib/utils";

export function giftCardRedeemedEmail({
  amount,
  newBalance,
  siteUrl,
}: {
  amount: number;
  newBalance: number;
  siteUrl?: string;
}) {
  return {
    subject: `${formatCurrency(amount)} added to your AirFly wallet`,
    html: renderEmailShell({
      preheader: `Your gift card was redeemed — new wallet balance: ${formatCurrency(newBalance)}.`,
      icon: "check",
      title: "Gift card redeemed",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          Your gift card has been added to your wallet and is ready to use at checkout on any booking.
        </div>
        ${renderInfoCard([
          { label: "Credit added", value: formatCurrency(amount) },
          { label: "New wallet balance", value: formatCurrency(newBalance) },
        ])}`,
      button: { label: "Book with your wallet", url: `${siteUrl ?? "https://airfly.example"}/flights` },
      footerNote: "Wallet credit never expires and can be split across travelers at checkout.",
      siteUrl,
    }),
  };
}
