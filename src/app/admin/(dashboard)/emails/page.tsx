import { EmailPreviewGallery } from "@/components/admin/EmailPreviewGallery";
import {
  welcomeEmail,
  bookingConfirmationEmail,
  bookingCancelledEmail,
  paymentReceiptEmail,
  giftCardPurchasedEmail,
  giftCardRedeemedEmail,
  contactAutoReplyEmail,
  flightDelayedEmail,
} from "@/lib/email/templates";

export default function AdminEmailsPage() {
  const templates = [
    {
      key: "welcome",
      label: "Welcome",
      trigger: "Sent right after signup confirmation.",
      ...welcomeEmail({ name: "Sarah Ahmed" }),
    },
    {
      key: "booking-confirmation",
      label: "Booking confirmation",
      trigger: "Sent the moment a booking's payment succeeds.",
      ...bookingConfirmationEmail({
        passengerName: "Sarah Ahmed",
        reference: "8F3K2A",
        airline: "British Skyways",
        flightNumber: "BA 118",
        from: "JFK",
        to: "LHR",
        departTime: "Sep 14, 18:05",
        arriveTime: "Sep 15, 06:10",
        cabin: "Economy",
        seats: ["14A"],
        total: 403,
      }),
    },
    {
      key: "booking-cancelled",
      label: "Booking cancelled",
      trigger: "Sent when a booking is cancelled and refunded.",
      ...bookingCancelledEmail({
        passengerName: "Sarah Ahmed",
        reference: "8F3K2A",
        from: "JFK",
        to: "LHR",
        refundAmount: 403,
      }),
    },
    {
      key: "payment-receipt",
      label: "Payment receipt",
      trigger: "Sent alongside booking confirmation.",
      ...paymentReceiptEmail({
        reference: "8F3K2A",
        method: "Visa •••• 4242",
        transactionId: "sim_8f2k91j3q7",
        amount: 403,
        date: "Aug 21, 2026",
      }),
    },
    {
      key: "gift-card-purchased-gifted",
      label: "Gift card purchased (gifted)",
      trigger: "Sent to the recipient when someone gifts a card.",
      ...giftCardPurchasedEmail({ code: "AIRFLY-7K2M-9QRT", amount: 150, fromName: "James Whitfield" }),
    },
    {
      key: "gift-card-redeemed",
      label: "Gift card redeemed",
      trigger: "Sent right after a successful redeem.",
      ...giftCardRedeemedEmail({ amount: 100, newBalance: 250 }),
    },
    {
      key: "flight-delayed",
      label: "Flight delayed",
      trigger: "Sent by ops when a flight's schedule changes.",
      ...flightDelayedEmail({
        reference: "8F3K2A",
        flightNumber: "BA 118",
        from: "JFK",
        to: "LHR",
        oldDepartTime: "18:05",
        newDepartTime: "19:40",
      }),
    },
    {
      key: "contact-autoreply",
      label: "Contact auto-reply",
      trigger: "Sent instantly when the /contact form is submitted.",
      ...contactAutoReplyEmail({ name: "Sarah Ahmed" }),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Every transactional email this project sends — rendered exactly as an
        inbox would show it. These aren&apos;t wired to a real sender yet (no
        Resend/Postmark integration); each one is a pure{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">{"{ subject, html }"}</code>{" "}
        function in <code className="rounded bg-slate-100 px-1 text-xs">src/lib/email/templates</code>.
        Supabase&apos;s own auth emails (confirm signup, reset password, etc.) live
        separately in <code className="rounded bg-slate-100 px-1 text-xs">supabase/email-templates/*.html</code> —
        paste those directly into the Supabase dashboard.
      </p>

      <div className="mt-6">
        <EmailPreviewGallery templates={templates} />
      </div>
    </div>
  );
}
