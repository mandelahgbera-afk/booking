"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Star, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { createReview, deleteReview, toggleReviewFeatured } from "@/app/admin/(dashboard)/reviews/actions";
import type { AdminReview } from "@/lib/data";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop";

export const ReviewsManager = ({ initialReviews }: { initialReviews: AdminReview[] }) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    avatarUrl: "",
    quote: "",
    rating: 5,
    featured: true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createReview(form);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      // Optimistic prepend — good enough here since this list is short-lived
      // per admin session and a full refetch would just show the same thing.
      setReviews((prev) => [
        {
          id: `local-${Date.now()}`,
          name: form.name,
          role: form.role || null,
          avatar: form.avatarUrl || DEFAULT_AVATAR,
          quote: form.quote,
          rating: form.rating,
          featured: form.featured,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setForm({ name: "", role: "", avatarUrl: "", quote: "", rating: 5, featured: true });
      setShowForm(false);
    });
  };

  const remove = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setBusyId(null);
    });
  };

  const toggleFeatured = (id: string, next: boolean) => {
    setBusyId(id);
    startTransition(async () => {
      await toggleReviewFeatured(id, next);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, featured: next } : r)));
      setBusyId(null);
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {reviews.length} testimonial{reviews.length !== 1 ? "s" : ""} · featured ones show on the landing page &amp; /reviews
        </p>
        <Button onClick={() => setShowForm((v) => !v)} size="sm" className="gap-2">
          <Plus size={14} />
          {showForm ? "Cancel" : "Add testimonial"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submit}
            className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5"
          >
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Traveler name"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Role / label (e.g. Frequent Flyer)"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <input
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="Avatar image URL (optional)"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
            <textarea
              required
              rows={3}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="What did they say?"
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="p-0.5"
                  >
                    <Star
                      size={20}
                      className={n <= form.rating ? "text-orange-400" : "text-slate-200"}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                Feature on landing page
              </label>

              <Button type="submit" disabled={pending} size="sm" className="gap-2">
                {pending && <Loader2 size={14} className="animate-spin" />}
                Save testimonial
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-0.5 text-orange-400">
                {Array.from({ length: r.rating }).map((_, s) => (
                  <Star key={s} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  r.featured ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                )}
              >
                {r.featured ? "Featured" : "Hidden"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{r.quote}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                  <Image src={r.avatar} alt={r.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.role}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  disabled={busyId === r.id}
                  onClick={() => toggleFeatured(r.id, !r.featured)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50"
                  aria-label={r.featured ? "Unfeature" : "Feature"}
                >
                  {r.featured ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  disabled={busyId === r.id}
                  onClick={() => remove(r.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label="Delete"
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
