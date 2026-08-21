import Image from "next/image";
import { Star } from "lucide-react";
import { getTestimonials } from "@/lib/data";
import { stats } from "@/lib/mock-data";

export const revalidate = 3600;

export default async function ReviewsPage() {
  const reviews = await getTestimonials();
  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-16 pt-32 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Traveler stories
        </span>
        <h1 className="mx-auto mt-2 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          What it&apos;s actually like to fly AirFly
        </h1>
        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-sm">
          <div className="flex gap-0.5 text-orange-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-900">{avgRating} average</span>
          <span className="text-sm text-slate-400">· {stats[0].value} travelers</span>
        </div>
      </div>

      <section className="mx-auto max-w-5xl columns-1 gap-6 px-6 py-16 sm:columns-2 lg:columns-3">
        {reviews.concat(reviews).map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className="mb-6 break-inside-avoid rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="flex gap-0.5 text-orange-400">
              {Array.from({ length: r.rating }).map((_, s) => (
                <Star key={s} size={13} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{r.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src={r.avatar} alt={r.name} fill className="object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
