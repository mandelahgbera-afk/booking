"use server";

import { sendEmail } from "@/lib/email/send";
import { bookingConfirmationEmail, paymentReceiptEmail, transactionFailedEmail } from "@/lib/email/templates";
import { createPublicClient } from "@/lib/supabase/public";
import { notifyAdminOfTransaction } from "@/lib/email/notify-admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Passenger } from "@/components/booking/PassengerForm";
import type { FlightOffer } from "@/lib/mock-data";

const siteUrl = process.env.NEXT_SITE_URL || "http://localhost:3000";

// Fired once payment succeeds. Persists the booking (when Supabase is
// configured — in mock mode there's nothing to write to, so this just
// returns null and the caller keeps its client-generated reference) and
// sends the confirmation + receipt. Email is best-effort by design
// (sendEmail never throws): a slow or failed email must never block the
// confirmation screen the traveler is already looking at.
export async function confirmBooking({
  offer,
  passengers,
  seats,
  total,
  method,
  transactionId,
}: {
  offer: FlightOffer;
  passengers: Passenger[];
  seats: string[];
  total: number;
  method: string;
  transactionId: string;
}): Promise<{ reference: string; emailWarning?: string; error?: string; total?: number }> {
  const fallbackReference = transactionId.slice(4, 10).toUpperCase();
  const primary = passengers[0];
  let reference = fallbackReference;

  let authoritativeTotal = total;

  if (isSupabaseConfigured && primary?.email) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("create_booking", {
        p_flight_id: offer.id,
        p_guest_email: primary.email,
        p_passengers: passengers.map((p, i) => ({ ...p, seat: seats[i] ?? "" })),
        p_seats: seats,
        p_cabin: offer.cabin,
        p_expected_amount: total,
        p_method: method,
        p_transaction_id: transactionId,
      });

      if (!error && data?.success) {
        reference = data.reference;
        if (typeof data.total === "number") authoritativeTotal = data.total;
      } else if (!error && data && data.success === false) {
        // A refusal from the database is a real business outcome now —
        // sold out, seats taken while the traveler was on the payment
        // step, or a fare that moved under them. Confirming anyway would
        // hand out a booking the inventory cannot honour, so this is
        // surfaced instead of being swallowed like a persistence blip.
        return { reference, error: String(data.message ?? "That booking could not be completed.") };
      }
      // A transport/permission error still falls through to the
      // client-generated reference: offer.id isn't always a real
      // flights.id (mock mode, or flights that were never seeded), and
      // that has never been a reason to fail a traveler's checkout.
    } catch {
      // same fallback
    }
  }

  let emailWarning: string | undefined;

  if (primary?.email) {
    const confirmation = bookingConfirmationEmail({
      passengerName: primary.name || "Traveler",
      reference,
      airline: offer.airline.name,
      flightNumber: offer.flightNumber,
      mode: offer.mode ?? "flight",
      from: offer.from.code,
      to: offer.to.code,
      departTime: offer.departTime,
      arriveTime: offer.arriveTime,
      cabin: offer.cabin,
      seats,
      total: authoritativeTotal,
    });
    const confirmationResult = await sendEmail({ to: primary.email, ...confirmation });

    const receipt = paymentReceiptEmail({
      reference,
      method,
      transactionId,
      amount: authoritativeTotal,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    });
    const receiptResult = await sendEmail({ to: primary.email, ...receipt });

    // Surfaced (not blocking) — the traveler is already on the confirmation
    // screen either way, but they should know if they won't get an email.
    if (!confirmationResult.ok || !receiptResult.ok) {
      emailWarning = `Booking confirmed, but the email didn't send: ${
        confirmationResult.error ?? receiptResult.error ?? "unknown error"
      }`;
    }
  }

  await notifyAdminOfTransaction({
    kind: "booking_confirmed",
    transactionType: "booking",
    amount: authoritativeTotal,
    customerEmail: primary?.email ?? null,
    method,
    reference,
  });

  return { reference, emailWarning, total: authoritativeTotal };
}

// Fired when a simulated card payment fails — emails a retry link that
// lands back on this same booking with ?retry=wallet, which pre-selects
// the wallet payment method (see PaymentStep's isRetry prop).
export async function sendBookingFailedEmail({
  flightId,
  passengers,
  total,
}: {
  flightId: string;
  passengers: Passenger[];
  total: number;
}) {
  const primary = passengers[0];
  if (!primary?.email) return;

  const copy = transactionFailedEmail({
    type: "booking",
    reference: `PENDING-${flightId.slice(0, 6).toUpperCase()}`,
    amount: total,
    retryUrl: `${siteUrl}/booking/${flightId}?retry=wallet`,
    retryMethod: "wallet",
  });
  await sendEmail({ to: primary.email, ...copy });

  await notifyAdminOfTransaction({
    kind: "payment_failed",
    transactionType: "booking",
    amount: total,
    customerEmail: primary.email,
  });
}

export type BookingLookup =
  | { ok: true; id: string; reference: string; flightId: string; total: number; status: string; createdAt: string; seats: string[]; cabin: string }
  | { ok: false; message: string };

export async function lookupBooking(reference: string, email: string): Promise<BookingLookup> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Booking lookup needs Supabase configured — nothing is persisted in preview mode." };
  }
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("get_booking_by_reference", {
      p_reference: reference,
      p_email: email,
    });
    if (error || !data.success) {
      return { ok: false, message: !error && "message" in data ? data.message : "Lookup failed." };
    }
    return {
      ok: true,
      id: data.id,
      reference: data.reference,
      flightId: data.flight_id,
      total: data.total_amount,
      status: data.status,
      createdAt: data.created_at,
      seats: data.seats,
      cabin: data.cabin,
    };
  } catch {
    return { ok: false, message: "Lookup failed." };
  }
}

export async function requestBookingRefund(
  reference: string,
  email: string
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Refunds need Supabase configured." };
  }
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("refund_booking", {
      p_reference: reference,
      p_email: email,
    });
    if (error) return { ok: false, message: error.message };
    if (!data.success) return { ok: false, message: data.message };

    const { bookingCancelledEmail } = await import("@/lib/email/templates");
    const copy = bookingCancelledEmail({
      passengerName: "Traveler",
      reference: data.reference,
      from: "",
      to: "",
      refundAmount: data.amount,
    });
    const emailResult = await sendEmail({ to: email, ...copy });

    return {
      ok: true,
      message: emailResult.ok
        ? "Refund issued — check your email for confirmation."
        : `Refund issued, but the confirmation email didn't send: ${emailResult.error ?? "unknown error"}`,
    };
  } catch {
    return { ok: false, message: "Refund failed." };
  }
}
