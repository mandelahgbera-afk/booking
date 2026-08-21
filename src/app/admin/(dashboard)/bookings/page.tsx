import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { recentBookings } from "@/lib/admin-mock";

export default function AdminBookingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
      <p className="mt-1 text-sm text-slate-500">
        All reservations placed across the platform.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Passenger</th>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Flight</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.reference} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 font-mono text-xs font-semibold text-slate-700">
                    {b.reference}
                  </td>
                  <td className="p-4 text-slate-700">{b.passenger}</td>
                  <td className="p-4 text-slate-500">{b.route}</td>
                  <td className="p-4 text-slate-500">{b.flightNumber}</td>
                  <td className="p-4 text-slate-500">{b.date}</td>
                  <td className="p-4 font-semibold text-slate-900">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="p-4">
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
