// TEMPORARY — MVP card-validator QA tool. Lists every card entered at
// checkout (raw, unmasked) so an admin can compare our client-side
// validator's verdict against Stripe test-card outcomes. Delete this page,
// actions.ts, src/components/admin/CardTestRowActions.tsx,
// src/lib/card-test-log.ts, and the card_validation_tests table/function
// in supabase/schema.sql once validator testing is done.

import { AlertTriangle } from "lucide-react";
import { getAdminCardTests } from "@/lib/data";
import { DeleteCardTestButton, ClearAllCardTestsButton } from "@/components/admin/CardTestRowActions";

export default async function AdminCardTestsPage() {
  const tests = await getAdminCardTests();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Card Validator QA</h1>
          <p className="mt-1 text-sm text-slate-500">
            Raw card input from checkout, for comparing against Stripe test-card outcomes. Use test
            card numbers only.
          </p>
        </div>
        {tests.length > 0 && <ClearAllCardTestsButton />}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        Temporary MVP tool — this page and its underlying table will be deleted once validator
        testing is complete. Never enter a real card number here.
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Card number</th>
                <th className="p-4 font-medium">Expiry</th>
                <th className="p-4 font-medium">CVC</th>
                <th className="p-4 font-medium">Brand</th>
                <th className="p-4 font-medium">Billing address</th>
                <th className="p-4 font-medium">Validator result</th>
                <th className="p-4 font-medium">Logged</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 text-slate-700">{t.cardholderName || "—"}</td>
                  <td className="p-4 font-mono text-xs text-slate-700">{t.cardNumber}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">{t.expiry || "—"}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">{t.cvc || "—"}</td>
                  <td className="p-4 text-slate-500 uppercase text-xs">{t.detectedBrand || "—"}</td>
                  <td className="p-4 text-xs text-slate-500">
                    {t.billingAddress ? (
                      <>
                        {t.billingAddress}
                        <br />
                        {[t.billingCity, t.billingPostalCode, t.billingCountry].filter(Boolean).join(", ")}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        t.clientValid
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                          : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                      }
                    >
                      {t.clientValid ? "Valid" : t.clientMessage || "Invalid"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <DeleteCardTestButton id={t.id} />
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-slate-400">
                    No card tests logged yet — submit a card at checkout to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
