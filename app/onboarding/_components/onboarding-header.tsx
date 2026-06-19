"use client";

import { Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingHeaderProps {
  step: number;
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-8 py-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
          <Building2 className="h-4 w-4 text-background" />
        </div>
        <span className="text-sm font-semibold">HCR</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className={cn(step === 1 ? "font-medium text-foreground" : "")}>
          Votre entreprise
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className={cn(step === 2 ? "font-medium text-foreground" : "")}>
          Votre plan
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className={cn(step === 3 ? "font-medium text-foreground" : "")}>
          Paiement
        </span>
      </div>

      <div className="w-28" />
    </header>
  );
}
