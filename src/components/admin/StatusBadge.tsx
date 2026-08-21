import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-600",
  completed: "bg-emerald-50 text-emerald-600",
  boarding: "bg-blue-50 text-blue-600",
  scheduled: "bg-slate-100 text-slate-500",
  pending: "bg-amber-50 text-amber-600",
  delayed: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-500",
  failed: "bg-red-50 text-red-500",
  refunded: "bg-purple-50 text-purple-500",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
      STYLES[status] ?? "bg-slate-100 text-slate-500"
    )}
  >
    {status}
  </span>
);
