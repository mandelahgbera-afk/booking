// Barrel export — every in-app transactional email in one place. Each
// function returns { subject, html }; the actual send happens via Resend
// in src/lib/email/send.ts, gated behind Platform Settings'
// email_notifications_enabled toggle. See the comment above each export
// below for where it's triggered.

export { welcomeEmail } from "./welcome";
export { bookingConfirmationEmail } from "./bookingConfirmation";
export { bookingCancelledEmail } from "./bookingCancelled";
export { paymentReceiptEmail } from "./paymentReceipt";
export { giftCardPurchasedEmail } from "./giftCardPurchased";
export { giftCardRedeemedEmail } from "./giftCardRedeemed";
export { contactAutoReplyEmail } from "./contactAutoReply";
export { flightDelayedEmail } from "./flightDelayed";
export { transactionFailedEmail } from "./transactionFailed";
export { adminTransactionAlertEmail, type AdminAlertKind } from "./adminTransactionAlert";
