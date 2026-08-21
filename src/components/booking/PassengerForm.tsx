"use client";

import { Minus, Plus, User } from "lucide-react";

export type Passenger = { name: string; email: string };

export const PassengerForm = ({
  passengers,
  onChange,
}: {
  passengers: Passenger[];
  onChange: (p: Passenger[]) => void;
}) => {
  const addPassenger = () => {
    if (passengers.length >= 6) return;
    onChange([...passengers, { name: "", email: "" }]);
  };

  const removePassenger = () => {
    if (passengers.length <= 1) return;
    onChange(passengers.slice(0, -1));
  };

  const update = (index: number, field: keyof Passenger, value: string) => {
    onChange(
      passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Travelers</h3>
        <div className="flex items-center gap-3 rounded-full border border-slate-200 px-2 py-1">
          <button
            type="button"
            onClick={removePassenger}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <Minus size={14} />
          </button>
          <span className="w-4 text-center text-sm font-semibold text-slate-900">
            {passengers.length}
          </span>
          <button
            type="button"
            onClick={addPassenger}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {passengers.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[auto_1fr_1fr]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-white">
              <User size={16} />
            </div>
            <input
              value={p.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder={`Passenger ${i + 1} full name`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
            <input
              value={p.email}
              onChange={(e) => update(i, "email", e.target.value)}
              placeholder="Email"
              type="email"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
