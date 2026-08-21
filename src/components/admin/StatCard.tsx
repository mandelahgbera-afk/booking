import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  delta,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  tone?: "default" | "warning";
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={16} />
        </div>
        <span
          className={cn(
            "text-[11px] font-semibold",
            tone === "warning" ? "text-amber-500" : "text-emerald-500"
          )}
        >
          {delta}
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
};
