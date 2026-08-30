import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { adminPayments } from "@/lib/admin-mock";

const METHOD_LABEL: Record<string, string> = {
  card: "Card",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  paypal: "PayPal",
  split: "Split payment",
};

export default function AdminPaymentsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
      <p className="mt-1 text-sm text-slate-500">
        Simulated payment intents. Outcomes are controlled by Platform Settings.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Booking ref</th>
                <th className="hidden md:table-cell p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="hidden md:table-cell p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminPayments.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 font-mono text-xs font-semibold text-slate-700">
                    {p.reference}
                  </td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{METHOD_LABEL[p.method]}</td>
                  <td className="p-4 font-semibold text-slate-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{p.date}</td>
                  <td className="p-4">
                    <StatusBadge status={p.status} />
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
