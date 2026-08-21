import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Contact | AirFly" };

const CHANNELS = [
  { icon: Mail, label: "Email", value: "support@airfly.example" },
  { icon: Phone, label: "Phone", value: "+1 (800) 555-0199" },
  { icon: MessageCircle, label: "Live chat", value: "Available 24/7 in-app" },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-16 pt-32 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          We&apos;re here to help
        </span>
        <h1 className="mx-auto mt-2 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Get in touch
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-500">
          Questions about a booking, a gift card, or anything else — reach out below.
        </p>
      </div>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          {CHANNELS.map((c) => (
            <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white">
                <c.icon size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-400">{c.label}</div>
                <div className="text-sm font-semibold text-slate-900">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
