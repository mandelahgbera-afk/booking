"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { adminIssueGiftCard } from "@/app/admin/(dashboard)/gift-cards/actions";

export const IssueGiftCardForm = () => {
  const router = useRouter();
  const [amount, setAmount] = useState("100");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await adminIssueGiftCard(Number(amount), email || undefined);
          setFeedback(res.ok ? `Issued ${res.code} — ${res.message}` : res.message);
          if (res.ok) {
            setEmail("");
            router.refresh();
          }
        });
      }}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div>
        <label className="text-xs font-medium text-slate-400">Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          className="mt-1 block w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400">Recipient email (optional)</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="someone@example.com"
          className="mt-1 block w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
      </div>
      <Button type="submit" disabled={pending} className="gap-2">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
        Issue card
      </Button>
      {feedback && <span className="text-xs text-slate-500">{feedback}</span>}
    </form>
  );
};
