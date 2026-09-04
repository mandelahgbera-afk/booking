"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Armchair, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFlightSeatMap,
  setBlockedSeats,
  type SeatMapState,
} from "@/app/admin/(dashboard)/flights/actions";

// Mirrors the traveler-facing seat map exactly. If the two grids disagree,
// an admin blocks 4C and the traveler never sees a 4C to be blocked from.
const ROWS = 8;
const COLS = ["A", "B", "C", "D", "E", "F"];

export const SeatController = ({
  flightId,
  label,
}: {
  flightId: string;
  label: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<SeatMapState | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, startSaving] = useTransition();

  // Loading is kicked off by the click that opens the panel rather than by
  // an effect watching `open`: opening is the user's action, so this is a
  // straightforward event handler and not a state cascade during commit.
  const openPanel = async () => {
    setOpen(true);
    setError(null);
    setLoading(true);
    try {
      const s = await getFlightSeatMap(flightId);
      setState(s);
      setBlocked(new Set(s.blocked));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const bookedSet = new Set(state?.booked ?? []);

  const toggle = (seat: string) => {
    // A sold seat belongs to a traveler; blocking it would put two claims
    // on one seat, so the database refuses it and so does this.
    if (bookedSet.has(seat)) return;
    setError(null);
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(seat)) next.delete(seat);
      else next.add(seat);
      return next;
    });
  };

  const save = () => {
    startSaving(async () => {
      const res = await setBlockedSeats(flightId, [...blocked]);
      if (!res.ok) {
        setError(res.message ?? "Could not save.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
      >
        <Armchair size={12} /> Seats
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Seat control</h3>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close seat control"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
                <Loader2 size={15} className="animate-spin" /> Loading seat map…
              </div>
            )}

            {!loading && state && (
              <>
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-slate-100" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-orange-500" /> Blocked by you
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-slate-300" /> Sold
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  {Array.from({ length: ROWS }, (_, r) => r + 1).map((row) => (
                    <div key={row} className="flex items-center justify-center gap-1.5">
                      <span className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 text-[10px] font-bold text-slate-400">
                        {row}
                      </span>
                      {COLS.map((col, i) => {
                        const seat = `${row}${col}`;
                        const isBooked = bookedSet.has(seat);
                        const isBlocked = blocked.has(seat);
                        return (
                          <button
                            key={seat}
                            type="button"
                            disabled={isBooked}
                            onClick={() => toggle(seat)}
                            title={isBooked ? `${seat} — sold to a traveler` : seat}
                            className={cn(
                              "h-7 w-7 rounded-md text-[10px] font-semibold transition-all",
                              i === 2 && "mr-2",
                              isBooked && "cursor-not-allowed bg-slate-300 text-slate-500",
                              !isBooked && isBlocked && "bg-orange-500 text-white shadow-sm",
                              !isBooked && !isBlocked && "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                  {state.seatsLeft} of {state.seatsTotal} seats left on this departure ·{" "}
                  {bookedSet.size} sold · {blocked.size} blocked
                </div>

                {error && (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="gradient-primary flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save seats"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
