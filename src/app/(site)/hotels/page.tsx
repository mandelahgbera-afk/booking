import { Hotel } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Hotels" };

export default function HotelsPage() {
  return (
    <ComingSoon
      icon={Hotel}
      title="Hotels are landing on AirFly next"
      description="We're building the same fare-comparison experience you get for flights into stays — handpicked hotels across every city we fly to."
    />
  );
}
