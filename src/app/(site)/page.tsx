import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Destinations } from "@/components/landing/Destinations";
import { PopularRoutes } from "@/components/landing/PopularRoutes";
import { Features } from "@/components/landing/Features";
import { PaymentPartners } from "@/components/landing/PaymentPartners";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Destinations />
      <PopularRoutes />
      <Features />
      <PaymentPartners />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
