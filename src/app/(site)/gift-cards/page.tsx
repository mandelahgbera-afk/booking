import { Gift, Sparkles, Wallet } from "lucide-react";
import { ShaderBackground } from "@/components/gift-cards/ShaderBackground";
import { PurchaseFlow } from "@/components/gift-cards/PurchaseFlow";
import { RedeemPanelWrapper } from "@/components/gift-cards/RedeemPanelWrapper";
import { RefundCard } from "@/components/gift-cards/RefundCard";
import { getWalletEmail } from "@/lib/wallet";
import { getWalletBalance } from "@/app/gift-cards/actions";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 0;

export default async function GiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ retry?: string }>;
}) {
  const [email, { retry }] = await Promise.all([getWalletEmail(), searchParams]);
  const balance = await getWalletBalance(email);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden px-6 pb-16 pt-32 text-center">
        <ShaderBackground />
        <div className="relative mx-auto max-w-2xl">
          <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-600">
            <Sparkles size={12} className="text-orange-500" /> Gift cards & wallet
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Give the gift of <span className="text-gradient">travel</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            Buy a gift card instantly, or scan/redeem one you&apos;ve received —
            credit lands in your wallet and works at checkout right away.
          </p>

          {email && (
            <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
                <Wallet size={16} />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-400">Wallet balance · {email}</div>
                <div className="text-lg font-bold text-slate-900">{formatCurrency(balance)}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 pb-12 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white">
            <Gift size={20} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">Buy a gift card</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick an amount, pay, and get a code + QR instantly.
            </p>
          </div>
          <PurchaseFlow isRetry={retry === "crypto"} />
        </div>

        <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Sparkles size={20} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">Redeem a gift card</h2>
            <p className="mt-1 text-sm text-slate-500">
              Scan a code with your camera, or type it in.
            </p>
          </div>
          <RedeemPanelWrapper initialEmail={email} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <RefundCard />
      </section>
    </div>
  );
}
