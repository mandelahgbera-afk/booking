import { TrainFront } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Trains" };

export default function TrainsPage() {
  return (
    <ComingSoon
      icon={TrainFront}
      title="Rail is coming, starting with Europe"
      description="City-to-city rail across Germany, France, the UK, and beyond — compared and booked the same way you already search flights."
    />
  );
}
