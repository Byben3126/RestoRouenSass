"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { useMe } from "@/features/user/hooks";
import { useMyRestaurant } from "@/features/restaurant/hooks";
import { useCreateMyRestaurant, useUpdateMyRestaurant } from "@/features/restaurant/hooks";
import { useCreateCheckoutSession } from "@/features/subscription/hooks";

import { onboardingSchema, type OnboardingValues } from "./_components/onboarding.schema";
import { OnboardingHeader } from "./_components/onboarding-header";
import { CompanyStep } from "./_components/company-step";
import { PlanStep } from "./_components/plan-step";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | null>(null);

  const { data: me, isLoading: meLoading } = useMe();
  const { data: restaurant, isLoading: restaurantLoading } = useMyRestaurant();
  const createRestaurant = useCreateMyRestaurant();
  const updateRestaurant = useUpdateMyRestaurant();
  const createCheckout = useCreateCheckoutSession();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", latitude: undefined, longitude: undefined, plan: "" },
  });

  useEffect(() => {
    if (meLoading || restaurantLoading) return;
    if (me?.isRestaurantOwner) {
      if (restaurant) {
        form.setValue("name", restaurant.name ?? "");
        if (restaurant.latitude !== undefined) form.setValue("latitude", restaurant.latitude);
        if (restaurant.longitude !== undefined) form.setValue("longitude", restaurant.longitude);
      }
      setStep(2);
    } else {
      setStep(1);
    }
  }, [meLoading, restaurantLoading, me, restaurant, form]);

  async function goToPlans() {
    const valid = await form.trigger(["name", "latitude", "longitude"]);
    if (!valid) return;

    const { name, latitude, longitude } = form.getValues();

    try {
      if (me?.isRestaurantOwner) {
        await updateRestaurant.mutateAsync({ name, latitude, longitude });
      } else {
        await createRestaurant.mutateAsync({ name, latitude, longitude });
      }
      setStep(2);
    } catch {
      toast.error("Une erreur est survenue, veuillez réessayer.");
    }
  }

  async function goToPayment() {
    const valid = await form.trigger(["plan"]);
    if (!valid) return;

    const plan = form.getValues("plan");

    try {
      const url = await createCheckout.mutateAsync(plan);
      window.location.href = url;
    } catch {
      toast.error("Impossible de créer la session de paiement, veuillez réessayer.");
    }
  }

  const isPendingStep1 = createRestaurant.isPending || updateRestaurant.isPending;

  if (step === null) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <OnboardingHeader step={step} />

      <Form {...form}>
        <form className="flex flex-1 flex-col">
          {step === 1 && (
            <CompanyStep form={form} onNext={goToPlans} isLoading={isPendingStep1} />
          )}
          {step === 2 && (
            <PlanStep
              form={form}
              companyName={form.watch("name")}
              onBack={() => setStep(1)}
              onNext={goToPayment}
              isLoading={createCheckout.isPending}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
