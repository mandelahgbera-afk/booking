// Barrel export — every in-app transactional email in one place.
// None of these are wired to an actual send yet (no Resend/Postmark/SES
// integration exists in this project). Each function just returns
// { subject, html } — plug it into a mailer call wherever the corresponding
// action happens (see the comment above each export for where that is).

export { welcomeEmail } from "./welcome";
export { bookingConfirmationEmail } from "./bookingConfirmation";
export { bookingCancelledEmail } from "./bookingCancelled";
export { paymentReceiptEmail } from "./paymentReceipt";
export { giftCardPurchasedEmail } from "./giftCardPurchased";
export { giftCardRedeemedEmail } from "./giftCardRedeemed";
export { contactAutoReplyEmail } from "./contactAutoReply";
export { flightDelayedEmail } from "./flightDelayed";
export { transactionFailedEmail } from "./transactionFailed";
