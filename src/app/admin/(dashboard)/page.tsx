import { PlaneTakeoff, Ticket, Users, DollarSign, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import {
  adminStats,
  revenueSeries,
  flightStatusBreakdown,
  recentBookings,
} from "@/lib/admin-mock";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Flight Operations Dashboard</h1>
        <p className="text-sm text-slate-500">
          Monitor flights, bookings, and revenue in real time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={PlaneTakeoff}
          label="Active flights"
          value={adminStats.activeFlights.value.toLocaleString()}
          delta={adminStats.activeFlights.delta}
        />
        <StatCard
          icon={Ticket}
          label="Bookings today"
          value={adminStats.bookingsToday.value.toLocaleString()}
          delta={adminStats.bookingsToday.delta}
        />
        <StatCard
          icon={Users}
          label="Passengers checked in"
          value={adminStats.passengersCheckedIn.value.toLocaleString()}
          delta={adminStats.passengersCheckedIn.delta}
        />
        <StatCard
          icon={DollarSign}
          label="Revenue today"
          value={formatCurrency(adminStats.revenueToday.value)}
          delta={adminStats.revenueToday.delta}
        />
        <StatCard
          icon={AlertTriangle}
          label="Delayed flights"
          value={adminStats.delayedFlights.value.toString()}
          delta={adminStats.delayedFlights.delta}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Revenue analytics</h2>
            <span className="text-xs text-slate-400">Hourly · Today</span>
          </div>
          <RevenueChart data={revenueSeries} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-sm font-semibold text-slate-900">Flight status</h2>
          <div className="flex flex-col gap-3">
            {flightStatusBreakdown.map((s) => {
              const total = flightStatusBreakdown.reduce((a, b) => a + b.count, 0);
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-semibold text-slate-900">{s.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent bookings</h2>
          <a href="/admin/bookings" className="text-xs font-medium text-orange-500 hover:underline">
            View all
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Passenger</th>
                <th className="pb-3 font-medium">Route</th>
                <th className="pb-3 font-medium">Flight</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.reference} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-mono text-xs font-semibold text-slate-700">
                    {b.reference}
                  </td>
                  <td className="py-3 text-slate-700">{b.passenger}</td>
                  <td className="py-3 text-slate-500">{b.route}</td>
                  <td className="py-3 text-slate-500">{b.flightNumber}</td>
                  <td className="py-3 font-semibold text-slate-900">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
