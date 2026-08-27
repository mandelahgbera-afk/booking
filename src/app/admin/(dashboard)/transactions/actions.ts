"use server";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { sendEmail } from "@/lib/email/send";
import { bookingConfirmationEmail, giftCardPurchasedEmail, transactionFailedEmail } from "@/lib/email/templates";
import { logAdminAction, getPendingPaymentRequests } from "@/lib/data";

export async function fetchPendingRequests() {
  return getPendingPaymentRequests();
}

const siteUrl = process.env.NEXT_SITE_URL || "http://localhost:3000";

type BookingRequestMetadata = {
  flightId: string;
  passengers: { name: string; email: string }[];
  seats: string[];
  cabin: string;
  method: string;
  fromCode: string;
  toCode: string;
  departTime: string;
  arriveTime: string;
  airline: string;
  flightNumber: string;
};

type GiftCardRequestMetadata = {
  buyerEmail: string;
  recipientEmail: string | null;
  method?: "card" | "crypto";
};

export async function resolvePaymentRequestAction(
  id: string,
  decision: "approved" | "declined" | "declined_alt",
  alt?: "wallet" | "crypto" | "card"
): Promise<{ ok: boolean; message?: string }> {
  const supabase = await createClient(); // admin-authenticated, cookie-bound
  console.log(`[transactions] resolve id=${id} decision=${decision} alt=${alt ?? "none"}`);

  const { data, error } = await supabase.rpc("resolve_payment_request", {
    p_id: id,
    p_decision: decision,
    p_alt: alt ?? null,
  });
  if (error) {
    console.error(`[transactions] resolve_payment_request RPC error for ${id}:`, error);
    return { ok: false, message: error.message };
  }
  if (!data.success) {
    console.warn(`[transactions] resolve_payment_request rejected for ${id}: ${data.message}`);
    return { ok: false, message: data.message };
  }
  console.log(`[transactions] ${id} resolved — type=${data.type} email=${data.email} metadata.method=${(data.metadata as Record<string, unknown> | null)?.method ?? "n/a"}`);

  const { type, email, amount, metadata } = data;
  let emailWarning: string | undefined;

  // The decision itself (resolve_payment_request above) already persisted
  // before this point, so anything that throws from here on is a
  // follow-up failure (booking/gift-card creation, or the notification
  // email) — surfaced as a warning rather than left as an unhandled
  // rejection that would otherwise leave the admin's UI hanging with no
  // explanation and no email sent.
  try {
  if (decision === "approved") {
    const publicClient = createPublicClient();

    if (type === "booking") {
      const m = metadata as unknown as BookingRequestMetadata;
      const { data: bookingResult, error: bErr } = await publicClient.rpc("create_booking", {
        p_flight_id: m.flightId,
        p_guest_email: email,
        p_passengers: m.passengers.map((p, i) => ({ ...p, seat: m.seats[i] ?? "" })),
        p_seats: m.seats,
        p_cabin: m.cabin,
        p_total_amount: amount,
        p_method: m.method,
        p_transaction_id: `sim_${id.slice(0, 10)}`,
      });

      if (bErr || !bookingResult?.success) {
        const rpcMessage = bookingResult && !bookingResult.success ? bookingResult.message : undefined;
        return {
          ok: false,
          message: bErr?.message || rpcMessage || "Approved, but creating the booking failed.",
        };
      }

      await supabase.rpc("set_payment_request_result", {
        p_id: id,
        p_result: { reference: bookingResult.reference },
      });

      const copy = bookingConfirmationEmail({
        passengerName: m.passengers[0]?.name || "Traveler",
        reference: bookingResult.reference,
        airline: m.airline,
        flightNumber: m.flightNumber,
        from: m.fromCode,
        to: m.toCode,
        departTime: m.departTime,
        arriveTime: m.arriveTime,
        cabin: m.cabin,
        seats: m.seats,
        total: amount,
      });
      const emailResult = await sendEmail({ to: email, ...copy });
      if (!emailResult.ok) emailWarning = `Booking confirmed, but the email didn't send: ${emailResult.error ?? "unknown error"}`;
    } else {
      const m = metadata as unknown as GiftCardRequestMetadata;
      const { data: card, error: gErr } = await publicClient.rpc("issue_gift_card", {
        p_amount: amount,
        p_recipient_email: m.recipientEmail,
        p_buyer_email: m.buyerEmail ?? email,
      });

      if (gErr || !card) {
        return { ok: false, message: gErr?.message || "Approved, but issuing the gift card failed." };
      }

      await supabase.rpc("set_payment_request_result", {
        p_id: id,
        p_result: { code: card.code, amount: Number(card.amount) },
      });

      const copy = giftCardPurchasedEmail({ code: card.code, amount: Number(card.amount) });
      const emailResult = await sendEmail({ to: email, ...copy });
      if (!emailResult.ok) emailWarning = `Gift card issued, but the email didn't send: ${emailResult.error ?? "unknown error"}`;
    }
  } else {
    // declined or declined_alt — same retry-email pattern as the automatic
    // "simulate fail" path, just triggered by an admin decision instead.
    // For a gift card, retry defaults to the opposite of whichever method
    // was actually used (not always crypto) unless the admin's own `alt`
    // choice says otherwise.
    const giftMetadata = metadata as unknown as GiftCardRequestMetadata;
    const giftRetryMethod = alt === "card" || alt === "crypto" ? alt : giftMetadata.method === "crypto" ? "card" : "crypto";
    const retryUrl =
      type === "booking"
        ? `${siteUrl}/booking/${(metadata as unknown as BookingRequestMetadata).flightId}?retry=wallet`
        : `${siteUrl}/gift-cards?retry=${giftRetryMethod}`;

    const copy = transactionFailedEmail({
      type,
      reference: type === "booking" ? "your booking" : `Gift card`,
      amount,
      retryUrl,
      retryMethod: type === "booking" ? "wallet" : giftRetryMethod,
    });
    console.log(`[transactions] ${id} sending decline notification to ${email}, retryMethod=${giftRetryMethod}`);
    const emailResult = await sendEmail({ to: email, ...copy });
    console.log(`[transactions] ${id} decline email result:`, emailResult);
    if (!emailResult.ok) emailWarning = `Declined, but the email didn't send: ${emailResult.error ?? "unknown error"}`;
  }
  } catch (err) {
    console.error(`[transactions] ${id} threw after decision was saved:`, err);
    return {
      ok: true,
      message: `Decision saved, but something went wrong after: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }

  await logAdminAction("payment_requests.resolve", { id, decision, type, alt: alt ?? null });
  return { ok: true, message: emailWarning };
}
