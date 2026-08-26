import { getPendingPaymentRequests } from "@/lib/data";
import { TransactionQueue } from "@/components/admin/TransactionQueue";

export default async function AdminTransactionsPage() {
  const requests = await getPendingPaymentRequests();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Transaction Review</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Only relevant when Platform Settings → payment mode is set to{" "}
        <strong>Manual review</strong>. Each card payment lands here instead of
        auto-resolving — approve it, decline it, or decline with a recommended
        alternate payment method. The traveler&apos;s screen updates within a few
        seconds, no reload needed on their end.
      </p>

      <div className="mt-6">
        <TransactionQueue initialRequests={requests} />
      </div>
    </div>
  );
}
