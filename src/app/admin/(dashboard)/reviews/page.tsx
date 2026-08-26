import { getAdminReviews } from "@/lib/data";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add, feature, or remove testimonials — see instantly how they&apos;ll
        read on the site before deciding what goes live.
      </p>

      <div className="mt-6">
        <ReviewsManager initialReviews={reviews} />
      </div>
    </div>
  );
}
