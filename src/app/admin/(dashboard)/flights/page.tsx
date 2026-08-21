import { getFlightOffers } from "@/lib/data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";

export default async function AdminFlightsPage() {
  const offers = await getFlightOffers();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Flights</h1>
      <p className="mt-1 text-sm text-slate-500">
        Scheduled flights available for booking.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Flight</th>
                <th className="p-4 font-medium">Airline</th>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Departs</th>
                <th className="p-4 font-medium">Cabin</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Seats left</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 font-mono text-xs font-semibold text-slate-700">
                    {o.flightNumber}
                  </td>
                  <td className="p-4 text-slate-500">{o.airline.name}</td>
                  <td className="p-4 text-slate-700">
                    {o.from.code} → {o.to.code}
                  </td>
                  <td className="p-4 text-slate-500">{o.departTime}</td>
                  <td className="p-4 text-slate-500">{o.cabin}</td>
                  <td className="p-4 font-semibold text-slate-900">
                    {formatCurrency(o.price)}
                  </td>
                  <td className="p-4 text-slate-500">{o.seatsLeft}</td>
                  <td className="p-4">
                    <StatusBadge status={o.seatsLeft < 5 ? "delayed" : "scheduled"} />
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
