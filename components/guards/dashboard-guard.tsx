"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMe } from "@/features/user/hooks";
import { useMySubscription } from "@/features/subscription/hooks";

const ACTIVE_STATUSES = ["active", "trialing"];

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useMe();
  const { data: subscription, isLoading: subLoading } = useMySubscription();

  const isLoading = meLoading || subLoading;
  const hasRestaurant = me?.isRestaurantOwner ?? false;
  const hasActiveSub = subscription ? ACTIVE_STATUSES.includes(subscription.status) : false;
  const isAuthorized = hasRestaurant && hasActiveSub;

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAuthorized, router]);

  if (isLoading || !isAuthorized) return null;

  return <>{children}</>;
}
