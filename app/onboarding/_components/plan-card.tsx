"use client";

import { Check, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "./onboarding.constants";

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const isEnterprise = plan.id === "enterprise";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-2xl border p-6 text-left transition-all duration-200",
        plan.highlight
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40",
        selected && !plan.highlight && "border-foreground ring-1 ring-foreground"
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground text-nowrap border border-border shadow-sm">
            Le plus populaire
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1 mb-6">
        <p className={cn(
          "text-xs font-semibold uppercase tracking-widest",
          plan.highlight ? "text-background/60" : "text-muted-foreground"
        )}>
          {plan.name}
        </p>
        {isEnterprise ? (
          <p className="text-2xl font-bold">Sur devis</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{plan.price}€</span>
            <span className={cn("text-xs", plan.highlight ? "text-background/60" : "text-muted-foreground")}>
              /mois
            </span>
          </div>
        )}
        <p className={cn("text-xs", plan.highlight ? "text-background/70" : "text-muted-foreground")}>
          {plan.billingNote}
        </p>
      </div>

      {/* Capacités */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <div className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
          plan.highlight ? "bg-white/15" : "bg-muted"
        )}>
          <Users className="h-3 w-3" />
          {plan.workers === Infinity ? "Illimité" : `${plan.workers} employés`}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
          plan.highlight ? "bg-white/15" : "bg-muted"
        )}>
          <MapPin className="h-3 w-3" />
          {plan.locations === Infinity ? "Illimité" : `${plan.locations} site${plan.locations > 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Séparateur */}
      <div className={cn("mb-5 h-px", plan.highlight ? "bg-white/20" : "bg-border")} />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <div className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
              plan.highlight ? "bg-white/20" : "bg-primary/10"
            )}>
              <Check className={cn("h-2.5 w-2.5", plan.highlight ? "text-background" : "text-primary")} />
            </div>
            <span className={cn(
              "text-sm leading-tight",
              plan.highlight ? "text-background/90" : "text-muted-foreground"
            )}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* Selected indicator */}
      {selected && (
        <div className={cn(
          "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full",
          plan.highlight ? "bg-background" : "bg-foreground"
        )}>
          <Check className={cn("h-3.5 w-3.5", plan.highlight ? "text-foreground" : "text-background")} />
        </div>
      )}
    </button>
  );
}
