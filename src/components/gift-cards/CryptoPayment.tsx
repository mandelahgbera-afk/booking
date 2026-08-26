"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Bitcoin, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { cn, formatCurrency } from "@/lib/utils";

const COINS = [
  { key: "btc", label: "Bitcoin", symbol: "BTC", rate: 0.0000094 },
  { key: "eth", label: "Ethereum", symbol: "ETH", rate: 0.00027 },
  { key: "usdc", label: "USDC", symbol: "USDC", rate: 1 },
] as const;

// Deterministic-looking fake address so it doesn't jump around on re-render.
function fakeAddress(coin: string) {
  const seed = coin === "btc" ? "bc1q" : coin === "eth" ? "0x" : "0x";
  const chars = "0123456789abcdef";
  let out = seed;
  for (let i = 0; i < (coin === "btc" ? 38 : 40); i++) {
    out += chars[Math.floor(Math.random() * chars.length) % chars.length];
  }
  return out;
}

export const CryptoPayment = ({
  amount,
  onConfirmed,
}: {
  amount: number;
  onConfirmed: () => void;
}) => {
  const [coin, setCoin] = useState<(typeof COINS)[number]["key"]>("btc");
  const [address] = useState(() => ({ btc: fakeAddress("btc"), eth: fakeAddress("eth"), usdc: fakeAddress("usdc") }));
  const [confirming, setConfirming] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selected = COINS.find((c) => c.key === coin)!;
  const cryptoAmount = (amount * selected.rate).toFixed(coin === "usdc" ? 2 : 6);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, address[coin], {
        width: 148,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff00" },
      });
    }
  }, [coin, address]);

  const handleConfirm = () => {
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
              "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              coin === c.key
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            {c.symbol}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <canvas ref={canvasRef} />
        <div>
          <div className="text-lg font-bold text-slate-900">
            {cryptoAmount} {selected.symbol}
          </div>
          <div className="text-xs text-slate-400">≈ {formatCurrency(amount)}</div>
        </div>
        <div className="w-full rounded-lg bg-white px-3 py-2 font-mono text-[11px] text-slate-500 break-all">
          {address[coin]}
        </div>
      </div>

      <Button onClick={handleConfirm} size="lg" disabled={confirming} className="w-full gap-2">
        {confirming ? <Loader2 size={18} className="animate-spin" /> : <Bitcoin size={18} />}
        {confirming ? "Confirming on-chain…" : "I've sent the payment"}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <CheckCircle2 size={12} /> We&apos;ll confirm your payment automatically
      </p>
    </div>
  );
};
