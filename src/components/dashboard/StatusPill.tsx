const STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-500",
  refunded: "bg-purple-50 text-purple-500",
};

export const StatusPill = ({ status }: { status: string }) => (
  <span
    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
      STYLES[status] ?? "bg-slate-100 text-slate-500"
    }`}
  >
    {status}
  </span>
);
