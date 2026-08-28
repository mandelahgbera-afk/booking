"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePlatformSettings } from "@/app/admin/(dashboard)/settings/actions";
import type { PlatformSettingsRow } from "@/lib/supabase/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Quick automated presets — resolve every card payment the same way,
// instantly, useful for demoing a specific flow (e.g. "what does a decline
// email look like") without babysitting a review queue.
const AUTO_MODES: { value: PlatformSettingsRow["payment_mode"]; label: string; hint: string }[] = [
  { value: "simulate_success", label: "Always succeed", hint: "Every payment resolves as successful." },
  { value: "simulate_pending", label: "Always pending", hint: "Every payment sits in a pending state." },
  { value: "simulate_fail", label: "Always fail", hint: "Every payment is declined — useful for testing error states." },
  { value: "random", label: "Randomized", hint: "Mostly succeeds, with some pending/failed for realism." },
];

export const PlatformSettingsForm = ({ settings }: { settings: PlatformSettingsRow }) => {
  const [form, setForm] = useState(settings);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState(settings.admin_notification_email ?? "");

  const save = (patch: Partial<PlatformSettingsRow>) => {
    const next = { ...form, ...patch };
    setForm(next);
    startTransition(async () => {
      const result = await updatePlatformSettings(patch);
      setFeedback(result);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {!isSupabaseConfigured && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <Info size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Running on mock data</p>
            <p className="mt-1 text-amber-600">
              Changes below preview instantly but won&apos;t persist until Supabase
              credentials are set in <code className="rounded bg-amber-100 px-1">.env.local</code>{" "}
              and <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code> has been run.
            </p>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl p-4 text-sm",
            feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          )}
        >
          {feedback.ok ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <p>{feedback.message}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Mock payment gateway</h2>
        <p className="mt-1 text-xs text-slate-400">
          Controls how every card checkout on the site resolves, without touching a real processor.
        </p>

        <button
          disabled={pending}
          onClick={() => save({ payment_mode: "manual_review" })}
          className={cn(
            "mt-4 flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors disabled:opacity-60",
            form.payment_mode === "manual_review"
              ? "border-orange-500 bg-orange-50"
              : "border-dashed border-slate-300 hover:border-slate-400"
          )}
        >
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-orange-500" />
          <div>
            <div className="text-sm font-semibold text-slate-900">Manual review (recommended)</div>
            <div className="mt-1 text-xs text-slate-500">
              Every card payment holds as pending until you approve, decline, or
              decline with an alternate-payment recommendation for that specific
              transaction, from the{" "}
              <Link href="/admin/transactions" className="font-medium text-orange-600 underline">
                Transaction Review
              </Link>{" "}
              queue. The traveler&apos;s screen updates live, no reload.
            </div>
          </div>
        </button>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quick presets — auto-resolve instantly
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AUTO_MODES.map((mode) => (
              <button
                key={mode.value}
                disabled={pending}
                onClick={() => save({ payment_mode: mode.value })}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors disabled:opacity-60",
                  form.payment_mode === mode.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="text-sm font-semibold text-slate-900">{mode.label}</div>
                <div className="mt-1 text-xs text-slate-500">{mode.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <button
          disabled={pending}
          onClick={() => save({ payment_mode: "live" })}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors disabled:opacity-60",
            form.payment_mode === "live"
              ? "border-orange-500 bg-orange-50"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Live (Stripe)</div>
            <div className="mt-1 text-xs text-slate-500">
              Not yet connected — reserved for the real payment gateway, independent of the mock modes above.
            </div>
          </div>
          <ArrowRight size={16} className="shrink-0 text-slate-300" />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Platform toggles</h2>

        <div className="mt-4 flex flex-col divide-y divide-slate-100">
          <ToggleRow
            label="Booking enabled"
            description="Turn off to stop new bookings platform-wide."
            checked={form.booking_enabled}
            disabled={pending}
            onChange={(v) => save({ booking_enabled: v })}
          />
          <ToggleRow
            label="Maintenance mode"
            description="Shows a maintenance message on booking pages."
            checked={form.maintenance_mode}
            disabled={pending}
            onChange={(v) => save({ maintenance_mode: v })}
          />
          <ToggleRow
            label="Email notifications"
            description="Master switch for every transactional email — booking confirmations, receipts, gift card purchase/redeem, welcome, contact replies. Off means nothing sends, full stop."
            checked={form.email_notifications_enabled}
            disabled={pending}
            onChange={(v) => save({ email_notifications_enabled: v })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Admin notifications</h2>
        <p className="mt-1 text-xs text-slate-400">
          Where operational alerts go when a transaction is initiated — a payment landing in the
          review queue, a gift card bought, a booking confirmed, a payment declined. Leave blank to
          send none.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={adminEmail}
            disabled={pending}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="ops@yourcompany.com"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
          />
          <button
            type="button"
            disabled={pending || adminEmail === (form.admin_notification_email ?? "")}
            onClick={() => save({ admin_notification_email: adminEmail.trim() || null })}
            className="shrink-0 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
        {form.admin_notification_email && (
          <p className="mt-2 text-xs text-slate-400">
            Currently alerting{" "}
            <span className="font-medium text-slate-600">{form.admin_notification_email}</span>.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Service fee</h2>
        <p className="mt-1 text-xs text-slate-400">
          Percentage added on top of fares at checkout.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={form.service_fee_percent}
            disabled={pending}
            onChange={(e) => setForm({ ...form, service_fee_percent: Number(e.target.value) })}
            onMouseUp={(e) =>
              save({ service_fee_percent: Number((e.target as HTMLInputElement).value) })
            }
            className="flex-1 accent-orange-500"
          />
          <span className="w-14 text-right text-sm font-bold text-slate-900">
            {form.service_fee_percent}%
          </span>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
    <div>
      <div className="text-sm font-medium text-slate-900">{label}</div>
      <div className="text-xs text-slate-400">{description}</div>
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
        checked ? "bg-orange-500" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  </label>
);
