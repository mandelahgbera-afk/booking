import { PlaneTakeoff, TrainFront, Bus } from "lucide-react";
import { flightOffers, transitOffers } from "@/lib/mock-data";

const STATUSES = ["On Time", "Boarding", "On Time", "Delayed", "On Time", "Departed"] as const;

const STATUS_STYLE: Record<(typeof STATUSES)[number], string> = {
  "On Time": "text-emerald-400",
  Boarding: "text-blue-400",
  Delayed: "text-amber-400",
  Departed: "text-slate-500",
};

const MODE_ICON = { flight: PlaneTakeoff, train: TrainFront, bus: Bus };

type BoardRow = {
  key: string;
  mode: "flight" | "train" | "bus";
  from: string;
  to: string;
  label: string;
  departTime: string;
  color: string;
  status: (typeof STATUSES)[number];
};

export const DeparturesBoard = () => {
  const flightRows: BoardRow[] = flightOffers.map((o) => ({
    key: o.id,
    mode: "flight",
    from: o.from.code,
    to: o.to.code,
    label: o.flightNumber,
    departTime: o.departTime,
    color: o.airline.color,
    status: "On Time",
  }));

  const transitRows: BoardRow[] = transitOffers.map((t) => ({
    key: t.id,
    mode: t.mode,
    from: t.from,
    to: t.to,
    label: t.id,
    departTime: t.departTime,
    color: t.mode === "train" ? "#3b82f6" : "#a855f7",
    status: "On Time",
  }));

  // Interleave transit rows among flights instead of blocking them
  // together, so the board reads as one busy multi-modal terminal.
  const merged: BoardRow[] = [];
  let ti = 0;
  flightRows.forEach((f, i) => {
    merged.push(f);
    if (i % 2 === 1 && ti < transitRows.length) merged.push(transitRows[ti++]);
  });
  merged.push(...transitRows.slice(ti));

  const rows = merged.map((r, i) => ({ ...r, status: STATUSES[i % STATUSES.length] }));
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
          <span className="font-mono text-xs text-slate-500">
            {rows.length} departures &middot; flights, trains &amp; buses
          </span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-black/40 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="flex shrink-0 animate-[marquee_22s_linear_infinite] gap-0 group-hover:[animation-play-state:paused]">
            {loop.map((r, i) => {
              const Icon = MODE_ICON[r.mode];
              return (
                <div
                  key={`${r.key}-${i}`}
                  className="flex w-[280px] shrink-0 items-center gap-3 border-r border-slate-800/80 px-5 py-4 font-mono"
                >
                  <Icon size={14} className="shrink-0" style={{ color: r.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-100">
                      <span className="truncate">{r.from}</span>
                      <span className="shrink-0 text-slate-600">→</span>
                      <span className="truncate">{r.to}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-500">
                      {r.label} &middot; {r.departTime}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
