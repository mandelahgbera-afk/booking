"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/Button";

export const ContactForm = () => {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-10 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Message sent</h3>
            <p className="max-w-xs text-sm text-slate-500">
              Thanks for reaching out — our support team typically replies within a few hours.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-2 text-sm font-medium text-orange-500 hover:underline"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                await new Promise((r) => setTimeout(r, 900));
                setSent(true);
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <select
              required
              defaultValue=""
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none focus:border-orange-400"
            >
              <option value="" disabled>
                What&apos;s this about?
              </option>
              <option>Booking help</option>
              <option>Refund or cancellation</option>
              <option>Gift cards</option>
              <option>Partnership</option>
              <option>Something else</option>
            </select>
            <textarea
              required
              rows={5}
              placeholder="How can we help?"
              className="resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
            <Button type="submit" size="lg" disabled={pending} className="gap-2 self-start">
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {pending ? "Sending…" : "Send message"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
