"use client";

import { UseFormReturn } from "react-hook-form";
import { ChevronLeft, ChevronRight, Shield, Check, Headphones, Loader2 } from "lucide-react";

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { PLANS } from "./onboarding.constants";
import { PlanCard } from "./plan-card";
import type { OnboardingValues } from "./onboarding.schema";

interface PlanStepProps {
  form: UseFormReturn<OnboardingValues>;
  companyName: string;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function PlanStep({ form, companyName, onBack, onNext, isLoading }: PlanStepProps) {
  const watchedPlan = form.watch("plan");

  return (
    <div className="flex-1 px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Choisissez votre plan</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Adapté à la taille de{" "}
            <span className="font-medium text-foreground">{companyName || "votre entreprise"}</span>.
            Changez ou annulez à tout moment.
          </p>
        </div>

        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
                  {PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={field.value === plan.id}
                      onSelect={() => field.onChange(plan.id)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Paiement sécurisé
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Sans engagement, résiliable à tout moment
          </div>
          <div className="flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5" />
            Support inclus sur tous les plans
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" type="button" onClick={onBack} className="gap-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={!watchedPlan || isLoading}
            size="lg"
            className="gap-2 min-w-52"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Renseigner le paiement
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
