"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ShaderBackground } from "@/components/gift-cards/ShaderBackground";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Sign-in isn't connected yet — run supabase/schema.sql and add your Supabase keys to .env.local.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-24 sm:px-6">
      <ShaderBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-orange-500/30"
          >
            <LogIn size={24} />
          </motion.div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your bookings.</p>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to AirFly?{" "}
          <Link href="/signup" className="font-semibold text-orange-500 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
