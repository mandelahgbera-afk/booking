"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Check, CreditCard, Gift, Loader2, PlaneTakeoff, X, Wallet, Bitcoin, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchPendingRequests, resolvePaymentRequestAction } from "@/app/admin/(dashboard)/transactions/actions";

type PendingRequest = {
  id: string;
  type: "booking" | "gift_card";
  email: string;
  amount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export const TransactionQueue = ({ initialRequests }: { initialRequests: PendingRequest[] }) => {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingRequests().then(setRequests);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Only drop the request from the list — and thus only treat the decision
  // as handled — once the server confirms it actually went through. Before
  // this, a failed RPC call (e.g. an admin session RLS rejects) still made
  // the row disappear, silently: no booking/gift-card side effect, no
  // email, and nothing telling the admin it didn't work.
  const resolve = (
    id: string,
    decision: "approved" | "declined" | "declined_alt",
    alt?: "wallet" | "crypto" | "card"
  ) => {
    setBusyId(id);
    setErrors((prev) => ({ ...prev, [id]: "" }));
    startTransition(async () => {
      const res = await resolvePaymentRequestAction(id, decision, alt);
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        if (res.message) setNotice(res.message);
      } else {
        setErrors((prev) => ({ ...prev, [id]: res.message || "That didn't go through — try again." }));
      }
      setBusyId(null);
    });
  };

  if (requests.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
        <RefreshCw size={18} />
        Nothing waiting on review — this list checks for new ones every few seconds.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <span className="flex items-start gap-2">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} className="shrink-0 font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}
      {requests.map((r) => {
        // Booking always recommends wallet. Gift card recommends whichever
        // method the buyer *didn't* use — crypto if they paid by card, card
        // if they paid by crypto — instead of always assuming crypto.
        const giftMethod = (r.metadata.method as "card" | "crypto" | undefined) ?? "card";
        const alt: "wallet" | "crypto" | "card" =
          r.type === "booking" ? "wallet" : giftMethod === "crypto" ? "card" : "crypto";
        const AltIcon = alt === "wallet" ? Wallet : alt === "crypto" ? Bitcoin : CreditCard;

        return (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  {r.type === "booking" ? <PlaneTakeoff size={16} /> : <Gift size={16} />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {r.type === "booking"
                      ? `${(r.metadata.fromCode as string) ?? "?"} → ${(r.metadata.toCode as string) ?? "?"} · ${(r.metadata.flightNumber as string) ?? ""}`
                      : `Gift card purchase · ${giftMethod}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    {r.email} · {new Date(r.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(r.amount)}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                disabled={pending && busyId === r.id}
                onClick={() => resolve(r.id, "approved")}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {busyId === r.id && pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Approve
              </button>
              <button
                disabled={pending && busyId === r.id}
                onClick={() => resolve(r.id, "declined")}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={14} />
                Decline
              </button>
              <button
                disabled={pending && busyId === r.id}
                onClick={() => resolve(r.id, "declined_alt", alt)}
                className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-100 disabled:opacity-50"
              >
                <AltIcon size={14} />
                Decline + recommend {alt}
              </button>
            </div>

            {errors[r.id] && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                {errors[r.id]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
