import { getAdminGiftCards } from "@/lib/data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { IssueGiftCardForm } from "@/components/admin/IssueGiftCardForm";
import { VoidGiftCardButton } from "@/components/admin/VoidGiftCardButton";
import { formatCurrency } from "@/lib/utils";

export default async function AdminGiftCardsPage() {
  const cards = await getAdminGiftCards();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Gift Cards</h1>
      <p className="mt-1 text-sm text-slate-500">
        Issue, track, and void gift cards. Redemptions credit the buyer&apos;s wallet automatically.
      </p>

      <div className="mt-6">
        <IssueGiftCardForm />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="hidden md:table-cell p-4 font-medium">Issued by</th>
                <th className="hidden md:table-cell p-4 font-medium">Recipient</th>
                <th className="hidden md:table-cell p-4 font-medium">Redeemed by</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 font-mono text-xs font-semibold text-slate-700">{c.code}</td>
                  <td className="p-4 font-semibold text-slate-900">{formatCurrency(c.amount)}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{c.issuedBy}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{c.recipientEmail ?? "—"}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{c.redeemedEmail ?? "—"}</td>
                  <td className="p-4">
                    <StatusBadge
                      status={
                        c.status === "active" ? "scheduled" : c.status === "redeemed" ? "completed" : "cancelled"
                      }
                    />
                  </td>
                  <td className="p-4">{c.status === "active" && <VoidGiftCardButton id={c.id} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
