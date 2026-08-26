"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  PlaneTakeoff,
  Gift,
  Ticket,
  ArrowUpRight,
  Search,
  RotateCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StatusPill } from "./StatusPill";

export type DashboardBooking = {
  reference: string;
  status: string;
  total: number;
  createdAt: string;
  cabin: string;
  seats: string[];
  route: string;
  flightNumber: string;
};

const QUICK_ACTIONS = [
  { href: "/flights", label: "Search flights", icon: Search, tone: "gradient-primary text-white" },
  { href: "/gift-cards", label: "Buy a gift card", icon: Gift, tone: "bg-slate-900 text-white" },
  { href: "/manage-booking", label: "Manage a booking", icon: RotateCcw, tone: "bg-white text-slate-700 border border-slate-200" },
];

export const DashboardView = ({
  name,
  email,
  balance,
  bookings,
}: {
  name: string | null;
  email: string;
  balance: number;
  bookings: DashboardBooking[];
}) => {
  const firstName = (name || email.split("@")[0]).split(" ")[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-slate-400">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Hi, {firstName} 👋
          </h1>
        </motion.div>

        {/* Wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mt-6 overflow-hidden rounded-3xl gradient-primary p-6 text-white shadow-lg shadow-orange-500/25"
        >
          <div
            aria-hidden
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Wallet size={16} /> Wallet balance
            </div>
            <Link
              href="/gift-cards"
              className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur"
            >
              Top up <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="relative mt-3 text-4xl font-bold tracking-tight">
            {formatCurrency(balance)}
          </div>
          <div className="relative mt-1 text-xs text-white/70">{email}</div>
        </motion.div>

        {/* Quick actions — horizontally scrollable on mobile, like a native
            app's action tray, not a stacked list of buttons. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${a.tone}`}
            >
              <a.icon size={16} />
              {a.label}
            </Link>
          ))}
        </motion.div>

        {/* Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Your bookings</h2>
            <Link href="/manage-booking" className="text-xs font-medium text-orange-500">
              Manage
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <PlaneTakeoff size={22} className="text-slate-300" />
              <p className="text-sm text-slate-400">No bookings yet — your next trip starts here.</p>
              <Link
                href="/flights"
                className="rounded-full gradient-primary px-4 py-2 text-xs font-semibold text-white"
              >
                Search flights
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((b, i) => (
                <motion.div
                  key={b.reference}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Ticket size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{b.route}</span>
                      <StatusPill status={b.status} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      {b.flightNumber} · {b.reference} · {formatCurrency(b.total)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
