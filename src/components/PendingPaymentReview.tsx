"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { pollPaymentRequest, type PaymentRequestPoll } from "@/app/payment-requests/actions";

// The "manual review" payment mode's waiting screen — polls every 2.5s so
// the UI updates the moment an admin decides, with no reload. Copy is
// deliberately generic ("verifying") rather than exposing that a human is
// reviewing it — this is a simulated backend standing in for a real one,
// and should read like any other payment processor's brief hold, not like
// a support queue.
export const PendingPaymentReview = ({
  requestId,
  onApproved,
  onDeclined,
}: {
  requestId: string;
  onApproved: (result: Record<string, unknown> | null) => void;
  onDeclined: (altRecommendation: "wallet" | "crypto" | "card" | null) => void;
}) => {
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;
    let cancelled = false;

    const tick = async () => {
      const res: PaymentRequestPoll = await pollPaymentRequest(requestId);
      if (cancelled || settled.current) return;

      if (res.status === "approved") {
        settled.current = true;
        onApproved(res.result);
      } else if (res.status === "declined" || res.status === "declined_alt") {
        settled.current = true;
        onDeclined(res.altRecommendation);
      }
    };

    const interval = setInterval(tick, 2500);
    tick(); // check immediately too, don't wait a full interval on mount

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white p-10 text-center">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500"
      >
        <ShieldCheck size={28} />
      </motion.div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Verifying your payment</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          This usually takes just a moment — this page updates automatically, no need to refresh.
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="h-1.5 w-1.5 rounded-full bg-orange-400"
          />
        ))}
      </div>
    </div>
  );
};
