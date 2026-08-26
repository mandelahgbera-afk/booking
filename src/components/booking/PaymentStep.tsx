"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Lock, Smartphone, SplitSquareHorizontal, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { CardFields, EMPTY_CARD, type CardValue } from "@/components/CardFields";
import { detectCardBrand, brandLabel, validateCardNumber } from "@/lib/card-validation";
import { resolvePaymentOutcome, type PaymentOutcome } from "@/lib/payment-simulation";
import { getWalletBalance, spendWalletCredit } from "@/app/gift-cards/actions";
import { logCardValidationTest } from "@/lib/card-test-log";
import { cn, formatCurrency } from "@/lib/utils";
import type { Passenger } from "./PassengerForm";
import type { PlatformSettingsRow } from "@/lib/supabase/types";

export type { PaymentOutcome };

const METHODS = [
  { key: "card", label: "Card", icon: CreditCard },
  { key: "apple_pay", label: "Apple Pay", icon: Smartphone },
  { key: "google_pay", label: "Google Pay", icon: Wallet },
  { key: "wallet", label: "Wallet", icon: Wallet },
] as const;

export const PaymentStep = ({
  total,
  passengers,
  paymentMode,
  isRetry = false,
  onResult,
  onManualReview,
}: {
  total: number;
  passengers: Passenger[];
  paymentMode: PlatformSettingsRow["payment_mode"];
  isRetry?: boolean;
  onResult: (outcome: PaymentOutcome, transactionId: string, method: string) => void | Promise<void>;
  // When paymentMode is 'manual_review', card/Apple/Google Pay submissions
  // go through this instead of resolving locally — BookingFlow owns the
  // request + polling UI since it has the flight/passenger context needed
  // to build the review queue entry.
  onManualReview?: (methodLabel: string) => void;
}) => {
  const [method, setMethod] = useState<(typeof METHODS)[number]["key"]>(isRetry ? "wallet" : "card");
  const [split, setSplit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState<CardValue>(EMPTY_CARD);
  const [cardValid, setCardValid] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const share = split && passengers.length > 1 ? total / passengers.length : total;
  const walletEmail = passengers[0]?.email;

  useEffect(() => {
    if (method !== "wallet" || !walletEmail) return;
    let cancelled = false;
    getWalletBalance(walletEmail).then((b) => {
      if (!cancelled) setWalletBalance(b);
    });
    return () => {
      cancelled = true;
    };
  }, [method, walletEmail]);

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();

    const methodLabel =
      method === "card"
        ? `${brandLabel(detectCardBrand(card.number.replace(/\D/g, "")))} •••• ${card.number.replace(/\D/g, "").slice(-4)}`
        : METHODS.find((m) => m.key === method)?.label ?? method;

    // TEMPORARY — MVP card-validator QA log, see src/lib/card-test-log.ts.
    if (method === "card") {
      const digits = card.number.replace(/\D/g, "");
      const brand = detectCardBrand(digits);
      const result = validateCardNumber(card.number);
      void logCardValidationTest({
        name: card.name,
        number: card.number,
        expiry: card.expiry,
        cvc: card.cvc,
        brand,
        valid: result.valid,
        message: result.message,
      });
    }

    if (paymentMode === "manual_review" && onManualReview) {
      onManualReview(methodLabel);
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const outcome = resolvePaymentOutcome(paymentMode);
      const transactionId = `sim_${Math.random().toString(36).slice(2, 12)}`;
      setProcessing(false);
      onResult(outcome, transactionId, methodLabel);
    }, 1400);
  };

  const handleWalletPay = async () => {
    if (!walletEmail) return;
    setProcessing(true);
    const res = await spendWalletCredit(walletEmail, share, "booking");
    setProcessing(false);
    if (!res.ok) return; // insufficient balance — button stays disabled by the check below anyway
    onResult("success", `sim_${Math.random().toString(36).slice(2, 12)}`, "Wallet balance");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Payment</h3>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Lock size={12} /> Secure checkout
        </span>
      </div>

      {isRetry && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <RefreshCw size={16} className="mt-0.5 shrink-0" />
          Your last payment didn&apos;t go through — pay with your wallet balance instead below.
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors sm:flex-1 sm:gap-2 sm:px-3 sm:text-sm",
              method === m.key
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            <m.icon size={16} className="shrink-0" />
            <span className="truncate">{m.label}</span>
          </button>
        ))}
      </div>

      {method === "card" && (
        <form onSubmit={handleCardPay}>
          <CardFields value={card} onChange={setCard} onValidChange={setCardValid} />
          <PaySummary
            share={share}
            split={split}
            passengers={passengers}
            onSplitChange={setSplit}
            processing={processing}
            disabled={!cardValid}
          />
        </form>
      )}

      {(method === "apple_pay" || method === "google_pay") && (
        <>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
            You&apos;ll confirm this payment in the {method === "apple_pay" ? "Apple Pay" : "Google Pay"} sheet.
          </div>
          <form onSubmit={handleCardPay}>
            <PaySummary
              share={share}
              split={split}
              passengers={passengers}
              onSplitChange={setSplit}
              processing={processing}
              disabled={false}
            />
          </form>
        </>
      )}

      {method === "wallet" && (
        <div>
          {!walletEmail ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
              Add a traveler email in the previous step to use your wallet balance.
            </div>
          ) : walletBalance === null ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-6 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" /> Checking balance…
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wallet balance</span>
                <span className="font-bold text-slate-900">{formatCurrency(walletBalance)}</span>
              </div>
              {walletBalance < share && (
                <p className="mt-2 text-xs text-red-500">
                  Not enough balance to cover {formatCurrency(share)}. Top up on the Gift Cards page.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <div>
              <div className="text-xs text-slate-400">Total due</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(share)}</div>
            </div>
            <Button
              size="lg"
              disabled={processing || !walletEmail || walletBalance === null || walletBalance < share}
              onClick={handleWalletPay}
              className="gap-2"
            >
              {processing && <Loader2 size={18} className="animate-spin" />}
              {processing ? "Processing…" : `Pay ${formatCurrency(share)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaySummary = ({
  share,
  split,
  passengers,
  onSplitChange,
  processing,
  disabled,
}: {
  share: number;
  split: boolean;
  passengers: Passenger[];
  onSplitChange: (v: boolean) => void;
  processing: boolean;
  disabled: boolean;
}) => (
  <>
    {passengers.length > 1 && (
      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <SplitSquareHorizontal size={16} className="text-orange-500" />
          Split payment across {passengers.length} travelers
        </span>
        <input
          type="checkbox"
          checked={split}
          onChange={(e) => onSplitChange(e.target.checked)}
          className="h-4 w-4 rounded accent-orange-500"
        />
      </label>
    )}

    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
      <div>
        <div className="text-xs text-slate-400">
          {split && passengers.length > 1 ? "You'll pay" : "Total due"}
        </div>
        <div className="text-2xl font-bold text-slate-900">{formatCurrency(share)}</div>
      </div>
      <Button type="submit" size="lg" disabled={processing || disabled} className="gap-2">
        {processing && <Loader2 size={18} className="animate-spin" />}
        {processing ? "Processing…" : `Pay ${formatCurrency(share)}`}
      </Button>
    </div>
  </>
);
