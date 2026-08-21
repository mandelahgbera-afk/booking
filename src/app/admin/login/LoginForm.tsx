"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, PlaneTakeoff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deniedReason = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    deniedReason === "not_admin"
      ? "That account doesn't have admin access. Set profiles.role = 'admin' for it in Supabase, then sign in again."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured — the admin console is open without login in preview mode.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white">
            <PlaneTakeoff size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Admin console</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in with your admin account.</p>
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@airfly.example"
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
          <Button type="submit" size="lg" disabled={pending} className="mt-2 gap-2">
            {pending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          No account yet? Create one in Supabase → Authentication → Users, then set that
          user&apos;s <code className="rounded bg-slate-100 px-1">profiles.role</code> to{" "}
          <code className="rounded bg-slate-100 px-1">&apos;admin&apos;</code>.
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
