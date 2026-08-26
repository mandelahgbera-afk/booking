"use client";

// TEMPORARY — part of the MVP card-validator QA tool. See
// src/app/admin/(dashboard)/card-tests/.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCardTest, clearAllCardTests } from "@/app/admin/(dashboard)/card-tests/actions";

export const DeleteCardTestButton = ({ id }: { id: string }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteCardTest(id);
          router.refresh();
        })
      }
      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      <Trash2 size={12} /> Delete
    </button>
  );
};

export const ClearAllCardTestsButton = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!confirm("Clear every logged card test? This can't be undone.")) return;
          await clearAllCardTests();
          router.refresh();
        })
      }
      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 size={13} /> Clear all
    </button>
  );
};
