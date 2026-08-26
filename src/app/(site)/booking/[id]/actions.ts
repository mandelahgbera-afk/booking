"use server";

import { sendEmail } from "@/lib/email/send";
import { bookingConfirmationEmail, paymentReceiptEmail } from "@/lib/email/templates";
import type { Passenger } from "@/components/booking/PassengerForm";
import type { FlightOffer } from "@/lib/mock-data";

// Fired once payment succeeds — sends the confirmation + receipt to the
// primary passenger. Best-effort by design (sendEmail never throws): a slow
// or failed email must never block the confirmation screen the traveler is
// already looking at.
export async function sendBookingEmails({
  offer,
  passengers,
  seats,
  total,
  reference,
  method,
  transactionId,
}: {
  offer: FlightOffer;
  passengers: Passenger[];
  seats: string[];
  total: number;
  reference: string;
  method: string;
  transactionId: string;
}) {
  const primary = passengers[0];
  if (!primary?.email) return;

  const confirmation = bookingConfirmationEmail({
    passengerName: primary.name || "Traveler",
    reference,
    airline: offer.airline.name,
    flightNumber: offer.flightNumber,
    from: offer.from.code,
    to: offer.to.code,
    departTime: offer.departTime,
    arriveTime: offer.arriveTime,
    cabin: offer.cabin,
    seats,
    total,
  });
  await sendEmail({ to: primary.email, ...confirmation });

  const receipt = paymentReceiptEmail({
    reference,
    method,
    transactionId,
    amount: total,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  });
  await sendEmail({ to: primary.email, ...receipt });
}
