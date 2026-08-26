"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";
import { setRouteStatus } from "@/app/admin/(dashboard)/flights/actions";

export const RouteStatusToggle = ({ id, status }: { id: string; status: string }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      await setRouteStatus(id, status === "cancelled" ? "scheduled" : "cancelled");
      router.refresh();
    });
  };

  if (status === "cancelled") {
    return (
      <button
        disabled={pending}
        onClick={toggle}
        className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
      >
        <RotateCcw size={12} /> Reactivate
      </button>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={toggle}
      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      <Ban size={12} /> Cancel
    </button>
  );
};
