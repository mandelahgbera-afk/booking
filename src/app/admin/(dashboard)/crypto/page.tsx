import { AlertTriangle } from "lucide-react";
import { getCryptoAddresses } from "@/lib/data";
import { CryptoAddressRow } from "@/components/admin/CryptoAddressRow";

const COINS = [
  { key: "usdt_bep20", label: "USDT", symbol: "USDT (BEP20)" },
  { key: "eth", label: "Ethereum", symbol: "ETH" },
  { key: "sol", label: "Solana", symbol: "SOL" },
] as const;

export default async function AdminCryptoPage() {
  const addresses = await getCryptoAddresses();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Crypto Addresses</h1>
      <p className="mt-1 text-sm text-slate-500">
        Receiving addresses shown to buyers at crypto checkout, each with an auto-generated,
        watermarked QR. Shared per-coin addresses for now — unique addresses per buyer/session
        are a planned upgrade, not what this page does yet.
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        Double-check every address before saving — paste it directly from your wallet, don&apos;t
        retype it. A wrong address sends funds somewhere unrecoverable.
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {COINS.map((c) => (
          <CryptoAddressRow
            key={c.key}
            coin={c.key}
            label={c.label}
            symbol={c.symbol}
            initialAddress={addresses[c.key]}
          />
        ))}
      </div>
    </div>
  );
}
