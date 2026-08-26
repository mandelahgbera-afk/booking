"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/Button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { sendWelcomeEmail } from "./actions";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      router.push("/");
      router.refresh();
      return;
    }

    // Email confirmation is required — Supabase sent a confirmation link.
    setCheckEmail(true);
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-6 py-32">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Check your email</h1>
          <p className="mt-2 text-sm text-slate-500">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-orange-500 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-6 py-32">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white">
            <UserPlus size={20} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Faster checkout, saved travelers, booking history.</p>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />
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
      </div>
    </div>
  );
}
