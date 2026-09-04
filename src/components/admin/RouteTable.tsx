"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eraser, Search, Shuffle, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SeatController } from "@/components/admin/SeatController";
import { RouteStatusToggle } from "@/components/admin/RouteStatusToggle";
import { formatCurrency, cn } from "@/lib/utils";
import type { AdminFlightRoute } from "@/lib/data";
import {
  randomizeSeats,
  clearDemoOccupancy,
} from "@/app/admin/(dashboard)/flights/actions";

const MODE_LABEL: Record<string, string> = { flight: "Flight", train: "Train", bus: "Bus" };
const MODES = ["all", "flight", "train", "bus"] as const;
const STATUSES = ["all", "scheduled", "cancelled"] as const;

const DENSITY = [
  { label: "Light", value: 0.25, hint: "a quarter of free seats" },
  { label: "Busy", value: 0.5, hint: "half of free seats" },
  { label: "Nearly full", value: 0.85, hint: "most free seats" },
];

export const RouteTable = ({ routes }: { routes: AdminFlightRoute[] }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<(typeof MODES)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fill, setFill] = useState<"blocked" | "sold">("sold");
  const [density, setDensity] = useState(0.5);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, startBusy] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return routes.filter((r) => {
      if (mode !== "all" && r.mode !== mode) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      // Matches the things an admin actually types: a flight number, an
      // airport code, a city, or an operator.
      return [
        r.flightNumber,
        r.airline.name,
        r.from.code,
        r.to.code,
        r.from.city,
        r.to.city,
        `${r.from.code} ${r.to.code}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [routes, query, mode, status]);

  const allShownSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleAll = () => {
    setNote(null);
    setSelected((prev) => {
      const next = new Set(prev);
      // Only ever acts on what is currently visible, so a filter plus
      // "select all" cannot quietly pick up rows off-screen.
      if (allShownSelected) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setNote(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runFill = () => {
    startBusy(async () => {
      const res = await randomizeSeats([...selected], fill, density);
      if (!res.ok) {
        setNote({ ok: false, text: res.message ?? "Could not fill seats." });
        return;
      }
      setNote({
        ok: true,
        text: `${fill === "sold" ? "Sold" : "Blocked"} ${res.seats} seat(s) across ${res.routes} departure(s).`,
      });
      setSelected(new Set());
      router.refresh();
    });
  };

  const runClear = () => {
    startBusy(async () => {
      const res = await clearDemoOccupancy([...selected]);
      if (!res.ok) {
        setNote({ ok: false, text: res.message ?? "Could not clear." });
        return;
      }
      setNote({
        ok: true,
        text: `Released held seats and removed ${res.bookings} demo booking(s).`,
      });
      setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <div className="mt-6">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flight number, city, airport or operator…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-orange-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                mode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {m === "all" ? "All modes" : MODE_LABEL[m]}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {s === "all" ? "Any status" : s}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} of {routes.length} departures
        {selected.size > 0 && ` · ${selected.size} selected`}
      </p>

      {/* Bulk bar — only once something is selected */}
      {selected.size > 0 && (
        <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">
              {selected.size} selected
            </span>

            <div className="flex gap-1 rounded-lg border border-orange-200 bg-white p-1">
              {(["sold", "blocked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFill(f)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                    fill === f ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex gap-1 rounded-lg border border-orange-200 bg-white p-1">
              {DENSITY.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDensity(d.value)}
                  title={d.hint}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    density === d.value
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              onClick={runFill}
              disabled={busy}
              className="gradient-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/30 disabled:opacity-50"
            >
              <Shuffle size={13} />
              {busy ? "Working…" : `Randomize ${fill}`}
            </button>

            <button
              onClick={runClear}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Eraser size={13} /> Clear demo
            </button>

            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-slate-500 hover:underline"
            >
              Deselect
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            {fill === "sold"
              ? "Writes demo bookings and payments, so seats left and revenue move as they would in life. “Clear demo” removes them again."
              : "Withholds seats from sale without touching the ledger — crew rest, a group hold, or staging a departure."}
          </p>
        </div>
      )}

      {note && (
        <p
          className={cn(
            "mt-3 rounded-xl px-3 py-2 text-xs font-medium",
            note.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          )}
        >
          {note.text}
        </p>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">
                  <input
                    type="checkbox"
                    checked={allShownSelected}
                    onChange={toggleAll}
                    aria-label="Select all shown departures"
                    className="h-4 w-4 cursor-pointer accent-orange-500"
                  />
                </th>
                <th className="p-4 font-medium">Route</th>
                <th className="hidden md:table-cell p-4 font-medium">Mode</th>
                <th className="hidden md:table-cell p-4 font-medium">Operator</th>
                <th className="p-4 font-medium">From → To</th>
                <th className="hidden md:table-cell p-4 font-medium">Departs</th>
                <th className="hidden md:table-cell p-4 font-medium">Cabin</th>
                <th className="p-4 font-medium">Price</th>
                <th className="hidden md:table-cell p-4 font-medium">Seats left</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isSelected = selected.has(r.id);
                const sold = r.seatsTotal - r.seatsLeft;
                const pct = r.seatsTotal > 0 ? Math.round((sold / r.seatsTotal) * 100) : 0;
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-b border-slate-50 last:border-0 hover:bg-slate-50/60",
                      isSelected && "bg-orange-50/50"
                    )}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(r.id)}
                        aria-label={`Select ${r.flightNumber}`}
                        className="h-4 w-4 cursor-pointer accent-orange-500"
                      />
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-slate-700">
                      {r.flightNumber}
                    </td>
                    <td className="hidden md:table-cell p-4 text-slate-500">
                      {MODE_LABEL[r.mode] ?? r.mode}
                    </td>
                    <td className="hidden md:table-cell p-4 text-slate-500">{r.airline.name}</td>
                    <td className="p-4 text-slate-700">
                      {r.from.code} → {r.to.code}
                    </td>
                    <td className="hidden md:table-cell p-4 text-slate-500">
                      {new Date(r.departAt).toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell p-4 text-slate-500">{r.cabin}</td>
                    <td className="p-4 font-semibold text-slate-900">{formatCurrency(r.price)}</td>
                    <td className="hidden md:table-cell p-4">
                      <div className="text-slate-500">
                        {r.seatsLeft} / {r.seatsTotal}
                      </div>
                      {/* Occupancy is the thing an operator reads first, and
                          it is what the seat tools visibly move. */}
                      <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            pct >= 85 ? "bg-red-400" : pct >= 50 ? "bg-orange-400" : "bg-emerald-400"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <SeatController
                          flightId={r.id}
                          label={`${r.flightNumber} · ${r.from.code} → ${r.to.code}`}
                        />
                        <RouteStatusToggle id={r.id} status={r.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-sm text-slate-400">
                    {routes.length === 0
                      ? "No routes yet — add one above."
                      : "No departures match that search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
