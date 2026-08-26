"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/Button";
import { ShaderBackground } from "@/components/gift-cards/ShaderBackground";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { sendWelcomeEmail } from "./actions";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Sign-up isn't connected yet — run supabase/schema.sql and add your Supabase keys to .env.local."
      );
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setPending(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off for this project — signed in immediately.
      sendWelcomeEmail(name, email);
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Email confirmation is required — Supabase sent a confirmation link.
    setCheckEmail(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-24 sm:px-6">
      <ShaderBackground />

      <AnimatePresence mode="wait">
        {checkEmail ? (
          <motion.div
            key="check-email"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500"
            >
              <CheckCircle2 size={26} />
            </motion.div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
              account, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-semibold text-orange-500 hover:underline"
            >
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.7, rotate: 8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-orange-500/30"
              >
                <UserPlus size={24} />
              </motion.div>
              <h1 className="mt-4 text-xl font-bold text-slate-900">Create your account</h1>
              <p className="mt-1 text-sm text-slate-500">
                Faster checkout, saved travelers, booking history.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="rounded-2xl border border-slate-200 px-4 py-3.5 text-base outline-none transition-colors focus:border-orange-400 sm:text-sm"
              />
              <input
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-2xl border border-slate-200 px-4 py-3.5 text-base outline-none transition-colors focus:border-orange-400 sm:text-sm"
              />
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 6 characters)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-11 text-base outline-none transition-colors focus:border-orange-400 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button type="submit" size="lg" disabled={pending} className="mt-2 gap-2">
                {pending && <Loader2 size={16} className="animate-spin" />}
                {pending ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-orange-500 hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
