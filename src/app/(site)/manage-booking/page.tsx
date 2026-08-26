"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search, Ticket } from "lucide-react";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/utils";
import { lookupBooking, requestBookingRefund, type BookingLookup } from "../booking/[id]/actions";

export default function ManageBookingPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [refunding, startRefundTransition] = useTransition();
  const [booking, setBooking] = useState<BookingLookup | null>(null);
  const [refundResult, setRefundResult] = useState<{ ok: boolean; message: string } | null>(null);
  // Captured once per lookup rather than read live during render, per
  // React's purity rules — a coarse "has 24h passed" check doesn't need to
  // tick live anyway.
  const [now] = useState(() => Date.now());

  const eligibleAt =
    booking?.ok && booking.status === "confirmed"
      ? new Date(new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000)
      : null;
  const refundOpen = eligibleAt ? eligibleAt.getTime() <= now : false;

  return (
    <div className="mx-auto max-w-lg px-6 pb-24 pt-32">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white">
          <Ticket size={22} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Manage your booking</h1>
        <p className="mt-2 text-sm text-slate-500">
          Look up a booking with your reference and the email you booked with.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setRefundResult(null);
          startTransition(async () => {
            setBooking(await lookupBooking(reference, email));
          });
        }}
        className="mt-8 flex flex-col gap-3"
      >
        <input
          required
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          placeholder="Booking reference (e.g. 8F3K2A)"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono outline-none focus:border-orange-400"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email used to book"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />
        <Button type="submit" size="lg" disabled={pending} className="gap-2">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {pending ? "Looking up…" : "Find booking"}
        </Button>
      </form>

      {booking && !booking.ok && (
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {booking.message}
        </div>
      )}

      {booking?.ok && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Reference</div>
              <div className="font-mono text-lg font-bold text-slate-900">{booking.reference}</div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
              {booking.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
            <div>
              <div className="text-xs text-slate-400">Cabin</div>
              <div className="font-medium text-slate-900">{booking.cabin}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Seats</div>
              <div className="font-medium text-slate-900">{booking.seats.join(", ") || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total paid</div>
              <div className="font-medium text-slate-900">{formatCurrency(booking.total)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Booked</div>
              <div className="font-medium text-slate-900">
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {booking.status === "confirmed" && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              {refundResult ? (
                <div
                  className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                    refundResult.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {refundResult.ok ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  )}
                  {refundResult.message}
                </div>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    disabled={!refundOpen || refunding}
                    onClick={() =>
                      startRefundTransition(async () => {
                        setRefundResult(await requestBookingRefund(reference, email));
                      })
                    }
                  >
                    {refunding && <Loader2 size={16} className="animate-spin" />}
                    {refundOpen ? "Request refund" : "Refund opens 24h after booking"}
                  </Button>
                  {!refundOpen && eligibleAt && (
                    <p className="mt-2 text-center text-xs text-slate-400">
                      Available from {eligibleAt.toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
