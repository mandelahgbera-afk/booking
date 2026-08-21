"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { adminVoidGiftCard } from "@/app/admin/(dashboard)/gift-cards/actions";

export const VoidGiftCardButton = ({ id }: { id: string }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await adminVoidGiftCard(id);
          router.refresh();
        })
      }
      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      <Ban size={12} /> Void
    </button>
  );
};
