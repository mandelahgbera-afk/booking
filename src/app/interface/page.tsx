"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/Button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

// One-time bootstrap page: claim the admin role for your own account. Safe
// to leave live permanently — claim_first_admin() (supabase/schema.sql)
// only succeeds while zero admins exist anywhere in the system, and fails
// cleanly with a clear message every time after that. Not linked from any
// nav on purpose; visit it directly at /interface.
export default function InterfacePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"signin" | "signup" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ok: boolean; message: string } | null>(null);

  const claim = async () => {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("claim_first_admin");
    if (rpcError) {
      setDone({ ok: false, message: rpcError.message });
      return;
    }
    setDone({ ok: data.success, message: data.message });
  };

  const handleSignIn = async () => {
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured yet — set up your env vars first.");
      return;
    }

    setPending("signin");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(null);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    await claim();
  };

  const handleSignUp = async () => {
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured yet — set up your env vars first.");
      return;
    }
    if (!name.trim()) {
      setError("Enter a name to create a new account.");
      return;
    }

    setPending("signup");
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setPending(null);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      setError(
        "Account created, but your Supabase project requires email confirmation first. Confirm it, then come back and use \"Sign in & claim\" below."
      );
      return;
    }
    await claim();
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              done.ok ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
            }`}
          >
            {done.ok ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">
            {done.ok ? "You're an admin now" : "Couldn't claim admin"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{done.message}</p>
          <Link href={done.ok ? "/admin" : "/admin/login"}>
            <Button size="lg" className="mt-6 w-full">
              {done.ok ? "Go to admin console" : "Go to admin login"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white">
            <KeyRound size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Claim admin access</h1>
          <p className="mt-1 text-sm text-slate-500">
            One-time setup. Only works while no admin account exists yet.
          </p>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name (only needed if creating an account)"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />

          <Button
            onClick={handleSignIn}
            size="lg"
            disabled={pending !== null || !email || !password}
            className="gap-2"
          >
            {pending === "signin" && <Loader2 size={16} className="animate-spin" />}
            Sign in & claim admin
          </Button>
          <Button
            onClick={handleSignUp}
            variant="secondary"
            size="lg"
            disabled={pending !== null || !email || !password}
            className="gap-2"
          >
            {pending === "signup" && <Loader2 size={16} className="animate-spin" />}
            Create account & claim admin
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <PlaneTakeoff size={12} />
          AirFly setup
        </div>
      </div>
    </div>
  );
}
