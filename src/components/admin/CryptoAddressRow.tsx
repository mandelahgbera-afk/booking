"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { QrCode } from "@/components/QrCode";
import { setCryptoAddress } from "@/app/admin/(dashboard)/crypto/actions";
import type { CryptoCoin } from "@/lib/data";

export const CryptoAddressRow = ({
  coin,
  label,
  symbol,
  initialAddress,
}: {
  coin: CryptoCoin;
  label: string;
  symbol: string;
  initialAddress: string | null;
}) => {
  const router = useRouter();
  const [value, setValue] = useState(initialAddress ?? "");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const trimmed = value.trim();

  const save = () => {
    startTransition(async () => {
      const res = await setCryptoAddress(coin, value);
      setFeedback(res.message);
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">
          {label} <span className="font-normal text-slate-400">({symbol})</span>
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`${symbol} receiving address`}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-orange-400"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            disabled={pending || !trimmed}
            onClick={save}
            className="flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : <Save size={12} />}
            {!pending && "Save"}
          </button>
          {feedback && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              {feedback === "Saved." && <Check size={12} className="text-emerald-500" />}
              {feedback}
            </span>
          )}
        </div>
      </div>

      {trimmed && (
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-3">
          <QrCode value={trimmed} size={120} />
        </div>
      )}
    </div>
  );
};
