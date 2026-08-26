import { Bus } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Buses" };

export default function BusesPage() {
  return (
    <ComingSoon
      icon={Bus}
      title="Coach & bus routes are next"
      description="Budget-friendly coach travel across the UK, Germany, and the rest of Europe — same search, same checkout, one more way to get there."
    />
  );
}
