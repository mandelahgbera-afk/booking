import { flightOffers } from "@/lib/mock-data";

const STATUSES = ["On Time", "Boarding", "On Time", "Delayed", "On Time", "Departed"] as const;

const STATUS_STYLE: Record<(typeof STATUSES)[number], string> = {
  "On Time": "text-emerald-400",
  Boarding: "text-blue-400",
  Delayed: "text-amber-400",
  Departed: "text-slate-500",
};

export const DeparturesBoard = () => {
  const rows = flightOffers.map((o, i) => ({
    ...o,
    status: STATUSES[i % STATUSES.length],
  }));
  const loop = [...rows, ...rows];

  return (
    <section className="border-y border-slate-800 bg-slate-950 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Live departures
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500">{rows.length} flights in the board</span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-black/40 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="flex shrink-0 animate-[marquee_55s_linear_infinite] gap-0 group-hover:[animation-play-state:paused]">
            {loop.map((f, i) => (
              <div
                key={`${f.id}-${i}`}
                className="flex w-[280px] shrink-0 items-center gap-3 border-r border-slate-800/80 px-5 py-4 font-mono"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: f.airline.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-100">
                    {f.from.code}
                    <span className="text-slate-600">→</span>
                    {f.to.code}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {f.flightNumber} &middot; {f.departTime}
                  </div>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[f.status]}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
