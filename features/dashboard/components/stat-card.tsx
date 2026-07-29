"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

function fmt(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : n.toLocaleString("fr-FR");
}

function SpinningNumber() {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 9000) + 100);
    }, 80);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);

  return (
    <span className="text-muted-foreground/40 tabular-nums">{display}</span>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value?: number;
  delta?: number;
}

export function StatCard({ icon: Ico, label, value, delta }: StatCardProps) {
  const loading = value === undefined;
  const pos = (delta ?? 0) >= 0;

  return (
    <Card className="p-0">
      <CardContent className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
            <Ico className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>

        <div className="text-3xl font-bold tracking-tight">
          {loading ? <SpinningNumber /> : fmt(value)}
        </div>

        <div className="flex items-center gap-1.5 text-xs min-h-[20px]">
          {delta === undefined ? (
            <span className="inline-flex animate-pulse items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground/50">
              Calcul en cours…
            </span>
          ) : (
            <>
              <span className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                pos ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500",
              )}>
                {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {pos ? "+" : ""}{delta.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs période préc.</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
