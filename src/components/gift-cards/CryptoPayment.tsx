"use client";

import { useState } from "react";
import { AlertTriangle, Bitcoin, Check, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { QrCode } from "@/components/QrCode";
import { cn, formatCurrency } from "@/lib/utils";
import type { CryptoCoin } from "@/lib/data";

// Rough display-only conversion so the buyer sees roughly how much crypto
// to send — not a live price feed, same MVP-illustrative approach used
// elsewhere in this app.
const COINS = [
  { key: "usdt_bep20", label: "USDT (BEP20)", symbol: "USDT", rate: 1 },
  { key: "eth", label: "Ethereum", symbol: "ETH", rate: 0.0003 },
  { key: "sol", label: "Solana", symbol: "SOL", rate: 0.0069 },
] as const;

export const CryptoPayment = ({
  amount,
  addresses,
  onConfirmed,
  disabledReason,
  onBlocked,
}: {
  amount: number;
  addresses: Record<CryptoCoin, string | null>;
  onConfirmed: () => void;
  // Why this click can't proceed yet (e.g. no buyer email). The button
  // stays CLICKABLE on purpose: a disabled button gives zero feedback, so
  // a buyer who hasn't filled the email in experiences it as "the button
  // is broken" rather than "I missed a field". Clicking now always does
  // something visible — see onBlocked.
  disabledReason?: string;
  onBlocked?: () => void;
}) => {
  const [coin, setCoin] = useState<CryptoCoin>("usdt_bep20");
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = COINS.find((c) => c.key === coin)!;
  const address = addresses[coin];
  const cryptoAmount = (amount * selected.rate).toFixed(coin === "usdt_bep20" ? 2 : 6);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConfirm = () => {
    if (disabledReason) {
      onBlocked?.();
      return;
    }
    setConfirming(true);
    // Crypto is the guaranteed-success alt path in this simulation — the
    // point of offering it after a card failure is that it resolves.
    setTimeout(() => {
      setConfirming(false);
      onConfirmed();
    }, 1600);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {COINS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCoin(c.key)}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm",
              coin === c.key
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            {c.symbol}
          </button>
        ))}
      </div>

      {!address ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <AlertTriangle size={18} className="text-amber-500" />
          <p className="text-sm text-slate-500">
            {selected.label} isn&apos;t set up for payments yet — pick another coin or pay by card.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <QrCode value={address} size={148} />
          <div>
            <div className="text-lg font-bold text-slate-900">
              {cryptoAmount} {selected.symbol}
            </div>
            <div className="text-xs text-slate-400">≈ {formatCurrency(amount)}</div>
          </div>
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-left font-mono text-[11px] text-slate-500 hover:bg-slate-100"
          >
            <span className="break-all">{address}</span>
            {copied ? (
              <Check size={13} className="shrink-0 text-emerald-500" />
            ) : (
              <Copy size={13} className="shrink-0 text-slate-400" />
            )}
          </button>
        </div>
      )}

      <Button
        onClick={handleConfirm}
        size="lg"
        disabled={confirming || !address}
        className="w-full gap-2"
      >
        {confirming ? <Loader2 size={18} className="animate-spin" /> : <Bitcoin size={18} />}
        {confirming ? "Confirming on-chain…" : "I've sent the payment"}
      </Button>
      {disabledReason ? (
        <p className="flex items-center justify-center gap-1.5 text-xs text-amber-600">
          <AlertTriangle size={12} /> {disabledReason}
        </p>
      ) : (
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <CheckCircle2 size={12} /> We&apos;ll confirm your payment automatically
        </p>
      )}
    </div>
  );
};
