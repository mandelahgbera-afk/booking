"use client";

import { useState } from "react";
import { CreditCard, Loader2, Lock, Smartphone, SplitSquareHorizontal, Wallet } from "lucide-react";
import { Button } from "@/components/Button";
import { cn, formatCurrency } from "@/lib/utils";
import type { Passenger } from "./PassengerForm";
import type { PlatformSettingsRow } from "@/lib/supabase/types";

export type PaymentOutcome = "success" | "pending" | "fail";

const METHODS = [
  { key: "card", label: "Card", icon: CreditCard },
  { key: "apple_pay", label: "Apple Pay", icon: Smartphone },
  { key: "google_pay", label: "Google Pay", icon: Wallet },
] as const;

function resolveOutcome(mode: PlatformSettingsRow["payment_mode"]): PaymentOutcome {
  switch (mode) {
    case "simulate_pending":
      return "pending";
    case "simulate_fail":
      return "fail";
    case "random": {
      const r = Math.random();
      if (r < 0.15) return "fail";
      if (r < 0.3) return "pending";
      return "success";
    }
    default:
      return "success";
  }
}

export const PaymentStep = ({
  total,
  passengers,
  paymentMode,
  onResult,
}: {
  total: number;
  passengers: Passenger[];
  paymentMode: PlatformSettingsRow["payment_mode"];
  onResult: (outcome: PaymentOutcome, transactionId: string) => void;
}) => {
  const [method, setMethod] = useState<(typeof METHODS)[number]["key"]>("card");
  const [split, setSplit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });

  const share = split && passengers.length > 1 ? total / passengers.length : total;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      const outcome = resolveOutcome(paymentMode);
      const transactionId = `sim_${Math.random().toString(36).slice(2, 12)}`;
      setProcessing(false);
      onResult(outcome, transactionId);
    }, 1400);
  };

  return (
    <form onSubmit={handlePay} className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Payment</h3>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Lock size={12} /> Simulated · no real charge
        </span>
      </div>

      <div className="mb-5 flex gap-2">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              method === m.key
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            <m.icon size={16} />
            {m.label}
          </button>
        ))}
      </div>

      {method === "card" && (
        <div className="flex flex-col gap-3">
          <input
            required
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
            placeholder="Name on card"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
          />
          <input
            required
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            maxLength={19}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-orange-400"
          />
          <div className="flex gap-3">
            <input
              required
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: e.target.value })}
              placeholder="MM/YY"
              className="w-1/2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-orange-400"
            />
            <input
              required
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              placeholder="CVC"
              inputMode="numeric"
              maxLength={4}
              className="w-1/2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-orange-400"
            />
          </div>
        </div>
      )}

      {method !== "card" && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
          You&apos;ll confirm this payment in the {method === "apple_pay" ? "Apple Pay" : "Google Pay"} sheet (simulated).
        </div>
      )}

      {passengers.length > 1 && (
        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <SplitSquareHorizontal size={16} className="text-orange-500" />
            Split payment across {passengers.length} travelers
          </span>
          <input
            type="checkbox"
            checked={split}
            onChange={(e) => setSplit(e.target.checked)}
            className="h-4 w-4 rounded accent-orange-500"
          />
        </label>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <div>
          <div className="text-xs text-slate-400">
            {split && passengers.length > 1 ? "You'll pay" : "Total due"}
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(share)}
          </div>
        </div>
        <Button type="submit" size="lg" disabled={processing} className="gap-2">
          {processing && <Loader2 size={18} className="animate-spin" />}
          {processing ? "Processing…" : `Pay ${formatCurrency(share)}`}
        </Button>
      </div>
    </form>
  );
};
