import Image from "next/image";
import { Star } from "lucide-react";
import { getTestimonials } from "@/lib/data";

export default async function AdminReviewsPage() {
  const reviews = await getTestimonials();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
      <p className="mt-1 text-sm text-slate-500">
        Featured testimonials shown on the landing page.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex gap-0.5 text-orange-400">
              {Array.from({ length: r.rating }).map((_, s) => (
                <Star key={s} size={13} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full">
                <Image src={r.avatar} alt={r.name} fill className="object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-400">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
