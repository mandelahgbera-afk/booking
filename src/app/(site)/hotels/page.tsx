import Link from "next/link";
import { Hotel, Bell } from "lucide-react";
import { Button } from "@/components/Button";
import { ShaderBackground } from "@/components/gift-cards/ShaderBackground";

export const metadata = { title: "Hotels" };

export default function HotelsPage() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
      <ShaderBackground />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-orange-500/30">
        <Hotel size={26} />
      </div>
      <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-600">
        Coming soon
      </span>
      <h1 className="relative mt-4 max-w-lg text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Hotels are landing on AirFly next
      </h1>
      <p className="relative mx-auto mt-4 max-w-md text-slate-500">
        We&apos;re building the same fare-comparison experience you get for
        flights into stays — handpicked hotels across every city we fly to.
      </p>
      <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/flights">
          <Button size="lg">Book a flight instead</Button>
        </Link>
        <Button variant="secondary" size="lg" className="gap-2">
          <Bell size={16} />
          Notify me at launch
        </Button>
      </div>
    </div>
  );
}
