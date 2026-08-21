"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { airports, type Airport } from "@/lib/mock-data";

export const AirportPicker = ({
  label,
  icon,
  code,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  code: string;
  onSelect: (airport: Airport) => void;
}) => {
  const selected = airports.find((a) => a.code === code) ?? airports[0];
  const [query, setQuery] = useState(`${selected.city} (${selected.code})`);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Re-sync the display text when `code` changes from outside (e.g. the
  // swap button) — adjusted during render per React's guidance, rather than
  // in an effect, to avoid an extra render pass.
  const [prevCode, setPrevCode] = useState(code);
  if (code !== prevCode) {
    setPrevCode(code);
    setQuery(`${selected.city} (${selected.code})`);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.toLowerCase();
  const matches = airports
    .filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    )
    .slice(0, 6);

  return (
    <div ref={rootRef} className="relative min-w-0 rounded-xl px-3 py-2 transition-colors hover:bg-white">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <input
        value={query}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => {
          // If nothing was picked, snap back to the last valid selection.
          if (!airports.some((a) => `${a.city} (${a.code})`.toLowerCase() === query.toLowerCase())) {
            setTimeout(() => setQuery(`${selected.city} (${selected.code})`), 100);
          }
        }}
        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
      />

      {open && matches.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {matches.map((a) => (
            <button
              key={a.code}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(a);
                setQuery(`${a.city} (${a.code})`);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-orange-50"
            >
              <MapPin size={14} className="shrink-0 text-orange-400" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-slate-900">
                  {a.city}, {a.country}
                </span>
                <span className="block truncate text-xs text-slate-400">{a.name}</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">{a.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
