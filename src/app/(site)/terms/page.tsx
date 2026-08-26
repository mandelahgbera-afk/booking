import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="August 21, 2026"
      sections={[
        {
          heading: "Using AirFly",
          body: [
            "By searching, booking, or otherwise using AirFly, you agree to these terms. You must be at least 18 years old, or booking with the consent of a parent or guardian, to make a purchase.",
          ],
        },
        {
          heading: "Bookings and fares",
          body: [
            "Fares shown at search time are subject to change until a booking is confirmed and paid for. Once confirmed, your booking is governed by the fare rules shown at checkout, including any change or cancellation fees.",
          ],
        },
        {
          heading: "Gift cards",
          body: [
            "Gift cards are redeemable for wallet credit and do not expire. Wallet credit can be applied toward future bookings but is not redeemable for cash, and is non-transferable once redeemed to an account.",
          ],
        },
        {
          heading: "Cancellations and refunds",
          body: [
            "Most fares can be cancelled free of charge within 24 hours of booking. After that window, refund eligibility depends on the fare type selected — refundable, partially refundable, or non-refundable — as shown before you pay.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "AirFly acts as a booking platform. We are not the operating carrier and are not liable for delays, cancellations, or schedule changes made by airlines, though we'll always help you rebook or claim a refund where one is owed.",
          ],
        },
      ]}
    />
  );
}
