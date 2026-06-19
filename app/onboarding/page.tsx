"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Form } from "@/components/ui/form";

import { onboardingSchema, type OnboardingValues } from "./_components/onboarding.schema";
import { PLANS } from "./_components/onboarding.constants";
import { OnboardingHeader } from "./_components/onboarding-header";
import { CompanyStep } from "./_components/company-step";
import { PlanStep } from "./_components/plan-step";
import { PaymentStep } from "./_components/payment-step";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", type: "", email: "", siret: "", description: "", plan: "" },
  });

  async function goToPlans() {
    const valid = await form.trigger(["name", "type", "email"]);
    if (valid) setStep(2);
  }

  async function goToPayment() {
    const valid = await form.trigger(["plan"]);
    if (valid) setStep(3);
  }

  // Called after Stripe confirms the payment method
  async function onConfirmPayment(_paymentMethodId: string) {
    setIsSubmitting(true);

    // TODO: call your API here with form.getValues() + paymentMethodId
    // const data = form.getValues();
    // await api.createWorkspace({ ...data, paymentMethodId });

    await new Promise((r) => setTimeout(r, 1800));
    setIsSubmitting(false);

    toast.success("Bienvenue !", {
      description: `Votre espace pour ${form.getValues("name")} est prêt.`,
    });
    router.push("/dashboard/demo-workspace/workers");
  }

  const selectedPlan = PLANS.find((p) => p.id === form.watch("plan"));

  return (
    <div className="flex min-h-screen flex-col">
      <OnboardingHeader step={step} />

      <Form {...form}>
        {/* form tag is only used for react-hook-form context — submission is handled manually in step 3 */}
        <form className="flex flex-1 flex-col">
          {step === 1 && (
            <CompanyStep form={form} onNext={goToPlans} />
          )}
          {step === 2 && (
            <PlanStep
              form={form}
              companyName={form.watch("name")}
              onBack={() => setStep(1)}
              onNext={goToPayment}
            />
          )}
          {step === 3 && (
            <PaymentStep
              planName={selectedPlan?.name ?? ""}
              planPrice={selectedPlan?.price ?? null}
              isSubmitting={isSubmitting}
              onBack={() => setStep(2)}
              onConfirm={onConfirmPayment}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
