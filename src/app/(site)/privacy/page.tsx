import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 21, 2026"
      sections={[
        {
          heading: "What we collect",
          body: [
            "When you search for or book a flight, we collect the information you give us directly — names, contact details, and payment information for the travelers on a booking — along with basic usage data like pages visited and searches performed, so we can keep the product fast and relevant.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "We use your information to process bookings, send confirmations and updates about your trips, respond to support requests, and improve search results and pricing. We do not sell your personal information to third parties.",
          ],
        },
        {
          heading: "Payment data",
          body: [
            "Card details are never stored on our servers in this environment — all payment flows here are simulated for demonstration purposes. In a production deployment, payment data would be handled by a PCI-compliant processor and never touch our infrastructure directly.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We use a small number of cookies to keep you signed in, remember a redeemed gift card's wallet balance, and understand aggregate usage of the site. You can clear these at any time through your browser settings.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can request a copy of the data we hold about you, ask us to correct it, or ask us to delete your account and associated data, by contacting support@airfly.example.",
          ],
        },
      ]}
    />
  );
}
