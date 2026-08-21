"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, QrCode, Keyboard, XCircle, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import { cn, formatCurrency } from "@/lib/utils";
import { redeemGiftCard } from "@/app/gift-cards/actions";
import { ScannerPanel } from "./ScannerPanel";
import { CodeEntry } from "./CodeEntry";
import { Button } from "@/components/Button";

type Mode = "scan" | "manual";
type Phase = "email" | "redeem" | "success" | "error";

export const RedeemPanel = ({
  initialEmail,
  onRedeemed,
}: {
  initialEmail: string | null;
  onRedeemed: () => void;
}) => {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phase, setPhase] = useState<Phase>(initialEmail ? "redeem" : "email");
  const [mode, setMode] = useState<Mode>("scan");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ message: string; amount?: number } | null>(null);

  const handleRedeem = (code: string) => {
    startTransition(async () => {
      const res = await redeemGiftCard(code, email);
      setResult({ message: res.message, amount: res.amount });
      if (res.ok) {
        setPhase("success");
        confetti({
          particleCount: 90,
          spread: 75,
          startVelocity: 32,
          origin: { y: 0.6 },
          colors: ["#f97316", "#ea580c", "#3b82f6", "#fbbf24"],
        });
        onRedeemed();
      } else {
        setPhase("error");
      }
    });
  };

  if (phase === "email") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email.includes("@")) setPhase("redeem");
        }}
        className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white">
          <Mail size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Where should we credit this?
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            We&apos;ll attach your gift card balance to this email — no account needed.
          </p>
        </div>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </form>
    );
  }

  if (phase === "success" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            +{formatCurrency(result.amount ?? 0)} added
          </h3>
          <p className="mt-1 text-sm text-slate-500">{result.message}</p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setPhase("redeem");
            setResult(null);
          }}
        >
          Redeem another
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex gap-2 rounded-full border border-slate-200 bg-white p-1">
        <ModeButton icon={QrCode} active={mode === "scan"} onClick={() => setMode("scan")}>
          Scan
        </ModeButton>
        <ModeButton icon={Keyboard} active={mode === "manual"} onClick={() => setMode("manual")}>
          Enter code
        </ModeButton>
      </div>

      <AnimatePresence mode="wait">
        {phase === "error" && result && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex w-full max-w-sm items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <XCircle size={16} className="shrink-0" />
            {result.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === "scan" ? (
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <ScannerPanel onDetected={handleRedeem} />
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CodeEntry onSubmit={handleRedeem} pending={pending} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ModeButton = ({
  icon: Icon,
  active,
  onClick,
  children,
}: {
  icon: typeof QrCode;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
      active ? "gradient-primary text-white" : "text-slate-500 hover:bg-slate-100"
    )}
  >
    <Icon size={14} />
    {children}
  </button>
);
