"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/Button";

function formatCode(raw: string) {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = cleaned.startsWith("AIRFLY") ? cleaned.slice(6) : cleaned;
  const groups = body.match(/.{1,4}/g) ?? [];
  return ["AIRFLY", ...groups.slice(0, 2)].join("-");
}

export const CodeEntry = ({
  onSubmit,
  pending,
}: {
  onSubmit: (code: string) => void;
  pending: boolean;
}) => {
  const [value, setValue] = useState("AIRFLY-");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className="flex w-full max-w-sm flex-col items-center gap-4"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
        <Ticket size={18} className="text-orange-500" />
        <input
          value={value}
          onChange={(e) => setValue(formatCode(e.target.value))}
          placeholder="AIRFLY-XXXX-XXXX"
          maxLength={16}
          className="w-48 bg-transparent font-mono text-lg font-bold tracking-wider text-slate-900 outline-none placeholder:text-slate-300"
        />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Checking…" : "Redeem code"}
      </Button>
    </form>
  );
};
