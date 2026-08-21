import Image from "next/image";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/mock-data";

export const Testimonials = () => {
  const loop = [...testimonials, ...testimonials];

  return (
    <section className="overflow-hidden bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Testimonials
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What travelers are saying
        </h2>
      </div>

      <div className="group relative mt-12 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] gap-6 pl-6 group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="w-80 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm"
            >
              <div className="flex gap-0.5 text-orange-400">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
