"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";
import { refundGiftCard } from "@/app/gift-cards/actions";

// Self-service refund — only succeeds for the buyer's own unredeemed card,
// and only once 24h have passed since purchase (see refund_gift_card in
// supabase/schema.sql). Deliberately not gated on any "admin approval"
// language here — the eligibility check IS the approval, enforced by the
// database function itself.
export const RefundCard = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="w-full rounded-3xl border border-dashed border-slate-300 bg-white p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <RotateCcw size={16} className="text-slate-400" />
        Request a refund
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Available 24 hours after purchase, for unredeemed cards only.
      </p>

      {result && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
            result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          {result.message}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await refundGiftCard(code, email);
            setResult(res);
          });
        }}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="AIRFLY-XXXX-XXXX"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-orange-400"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email used to buy it"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
        />
        <Button type="submit" disabled={pending} className="gap-2 whitespace-nowrap">
          {pending && <Loader2 size={16} className="animate-spin" />}
          Request refund
        </Button>
      </form>
    </div>
  );
};
