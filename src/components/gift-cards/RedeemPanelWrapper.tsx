"use client";

import { useRouter } from "next/navigation";
import { RedeemPanel } from "./RedeemPanel";

// Thin client wrapper so a successful redeem can refresh the server-rendered
// wallet balance on the page without a full reload.
export const RedeemPanelWrapper = ({ initialEmail }: { initialEmail: string | null }) => {
  const router = useRouter();
  return <RedeemPanel initialEmail={initialEmail} onRedeemed={() => router.refresh()} />;
};
