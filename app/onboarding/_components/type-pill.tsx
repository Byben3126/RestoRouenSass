"use client";

import { cn } from "@/lib/utils";
import type { EstablishmentType } from "./onboarding.constants";

interface TypePillProps {
  type: EstablishmentType;
  selected: boolean;
  onSelect: () => void;
}

export function TypePill({ type, selected, onSelect }: TypePillProps) {
  const Icon = type.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-all",
        selected
          ? "border-foreground bg-foreground text-background font-medium"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {type.label}
    </button>
  );
}
