"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import { Check, Copy, CreditCard, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { CardFields, type CardValue } from "@/components/CardFields";
import { cn, formatCurrency } from "@/lib/utils";
import { purchaseGiftCard } from "@/app/gift-cards/actions";

const TIERS = [50, 100, 250, 500];

type Step = "amount" | "payment" | "success";

export const PurchaseFlow = () => {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [issued, setIssued] = useState<{ code: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState<CardValue>({ name: "", number: "", expiry: "", cvc: "" });
  const [cardValid, setCardValid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await purchaseGiftCard(effectiveAmount, buyerEmail, recipientEmail || undefined);
      if (res.ok) {
        setIssued({ code: res.code, amount: res.amount });
        setStep("success");
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f97316", "#ea580c", "#3b82f6"],
        });
      }
    });
  };

  useEffect(() => {
    if (step === "success" && issued && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, issued.code, {
        width: 176,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff00" },
      });
    }
  }, [step, issued]);

  const copyCode = () => {
    if (!issued) return;
    navigator.clipboard?.writeText(issued.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (step === "success" && issued) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Check size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {formatCurrency(issued.amount)} gift card ready
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Scan this at redeem, or share the code below.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <canvas ref={canvasRef} className="mx-auto" />
          <button
            onClick={copyCode}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 font-mono text-sm font-bold tracking-wider text-slate-900 hover:bg-slate-100"
          >
            {issued.code}
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setStep("amount");
            setIssued(null);
            setRecipientEmail("");
          }}
        >
          Buy another
        </Button>
      </motion.div>
    );
  }

  if (step === "payment") {
    return (
      <form onSubmit={handlePay} className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-500">Gift card amount</span>
          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(effectiveAmount)}
          </span>
        </div>

        <input
          required
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="Your email (we'll send the code here)"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Recipient email (optional — for gifting)"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />

        <CardFields value={card} onChange={setCard} onValidChange={setCardValid} />

        <Button
          type="submit"
          size="lg"
          disabled={pending || !cardValid || !buyerEmail.includes("@")}
          className="w-full gap-2"
        >
          {pending && <Loader2 size={18} className="animate-spin" />}
          {pending ? "Processing…" : `Pay ${formatCurrency(effectiveAmount)}`}
        </Button>
        <button
          type="button"
          onClick={() => setStep("amount")}
          className="text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setAmount(t);
              setCustomAmount("");
            }}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              amount === t && !customAmount
                ? "border-orange-500 bg-orange-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <Gift size={16} className="text-orange-500" />
            <div className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(t)}</div>
          </button>
        ))}
      </div>

      <input
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="Custom amount"
        inputMode="numeric"
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
      />

      <Button
        size="lg"
        className="w-full gap-2"
        disabled={effectiveAmount <= 0}
        onClick={() => setStep("payment")}
      >
        <CreditCard size={18} />
        Continue with {formatCurrency(effectiveAmount || 0)}
      </Button>
    </div>
  );
};
