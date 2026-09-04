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
  mode?: "flight" | "train" | "bus";
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
  // Everything below is wrapped in one try/catch, including the initial
  // RPC call — a previous version left that call unguarded, and it was
  // silently throwing in production (proven via logs: execution died
  // between two console.log lines straddling it), which meant the admin's
  // click looked like nothing happened: no banner, no email, no error,
  // because the thrown exception never reached a `return` at all.
  try {
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
    console.log(
      `[transactions] ${id} resolved — type=${data.type} email=${data.email} metadata.method=${
        (data.metadata as Record<string, unknown> | null)?.method ?? "n/a"
      }`
    );

    const { type, email, amount, metadata } = data;
    let emailWarning: string | undefined;

    // Guards against pre-existing rows created before submitPaymentRequest
    // / purchaseGiftCard started rejecting empty emails — the booking/gift
    // card side effect still goes through (the buyer isn't punished for a
    // bug that predates this fix), but nothing attempts to email "".
    const canNotify = Boolean(email && email.includes("@"));
    if (!canNotify) {
      console.warn(`[transactions] ${id} has no valid email on file (got "${email}") — skipping notification`);
      emailWarning = "No valid email was on file for this request, so no notification could be sent.";
    }

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
          p_expected_amount: amount,
          p_method: m.method,
          p_transaction_id: `sim_${id.slice(0, 10)}`,
          // This request is still 'pending' right now and is holding
          // these exact seats, so it must not be treated as a rival
          // claim on them.
          p_exclude_request_id: id,
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
          mode: m.mode ?? "flight",
        });
        if (canNotify) {
          const emailResult = await sendEmail({ to: email, ...copy });
          if (!emailResult.ok) emailWarning = `Booking confirmed, but the email didn't send: ${emailResult.error ?? "unknown error"}`;
        }
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

        if (canNotify) {
          const copy = giftCardPurchasedEmail({ code: card.code, amount: Number(card.amount) });
          const emailResult = await sendEmail({ to: email, ...copy });
          if (!emailResult.ok) emailWarning = `Gift card issued, but the email didn't send: ${emailResult.error ?? "unknown error"}`;
        }
      }
    } else {
      // declined or declined_alt — same retry-email pattern as the automatic
      // "simulate fail" path, just triggered by an admin decision instead.
      // Plain "Decline" = try again the same way (a card declining once
      // doesn't mean the card is bad). "Decline + recommend X" = switch
      // methods entirely, to whatever the admin picked. Applies the same
      // way to both booking and gift card — booking's only used method is
      // ever card/apple/google pay (wallet is a guaranteed-success retry
      // path that never goes through manual review to begin with), so its
      // "used" bucket is always "card"; a gift card's used bucket is
      // whichever of card/crypto its metadata recorded.
      const bookingMetadata = metadata as unknown as BookingRequestMetadata;
      const giftMetadata = metadata as unknown as GiftCardRequestMetadata;
      const usedBucket: "wallet" | "crypto" | "card" =
        type === "booking" ? "card" : giftMetadata.method === "crypto" ? "crypto" : "card";
      const isSwitch = decision === "declined_alt" && Boolean(alt);
      const retryMethod: "wallet" | "crypto" | "card" = isSwitch ? (alt as "wallet" | "crypto" | "card") : usedBucket;
      const sameMethod = !isSwitch;

      const retryUrl =
        type === "booking"
          ? `${siteUrl}/booking/${bookingMetadata.flightId}${retryMethod === "wallet" ? "?retry=wallet" : ""}`
          : `${siteUrl}/gift-cards?retry=${retryMethod}`;

      if (canNotify) {
        const copy = transactionFailedEmail({
          type,
          reference: type === "booking" ? "your booking" : `Gift card`,
          amount,
          retryUrl,
          retryMethod,
          sameMethod,
        });
        console.log(`[transactions] ${id} sending decline notification to ${email}, retryMethod=${retryMethod}, sameMethod=${sameMethod}`);
        const emailResult = await sendEmail({ to: email, ...copy });
        console.log(`[transactions] ${id} decline email result:`, emailResult);
        if (!emailResult.ok) emailWarning = `Declined, but the email didn't send: ${emailResult.error ?? "unknown error"}`;
      }
    }

    await logAdminAction("payment_requests.resolve", { id, decision, type, alt: alt ?? null });
    return { ok: true, message: emailWarning };
  } catch (err) {
    console.error(`[transactions] ${id} threw during resolve:`, err);
    return {
      ok: false,
      message: `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
