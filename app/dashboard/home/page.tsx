"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserRound, Coins, Gift, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

import { StatCard } from "@/features/dashboard/components/stat-card";
import { CustomersChart } from "@/features/dashboard/components/customers-chart";
import { PointsChart } from "@/features/dashboard/components/points-chart";
import { RewardsChart } from "@/features/dashboard/components/rewards-chart";
import { PromotionsChart } from "@/features/dashboard/components/promotions-chart";
import { fetchDashboardStats } from "@/features/dashboard/api";

// ─── Period ──────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d";
const PERIODS: { value: Period; label: string }[] = [
  { value: "7d",  label: "7 jours"  },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

function PeriodSelect({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
      {PERIODS.map(p => (
        <button key={p.value} onClick={() => onChange(p.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-all",
            value === p.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", period],
    queryFn: () => fetchDashboardStats(period),
  });

  const totals = stats?.totals;
  const deltas = stats?.deltas;

  return (
    <div className="space-y-6 pb-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vue d&apos;ensemble</h1>
          <p className="text-sm text-muted-foreground">Activité de votre programme de fidélité.</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={UserRound} label="Nouveaux clients"     value={totals?.newCustomers}     delta={deltas?.newCustomers}     />
        <StatCard icon={Coins}     label="Points attribués"     value={totals?.pointsAttributed} delta={deltas?.pointsAttributed} />
        <StatCard icon={Gift}      label="Cadeaux récupérés"    value={totals?.rewardsRedeemed}  delta={deltas?.rewardsRedeemed}  />
        <StatCard icon={Tag}       label="Promotions utilisées" value={totals?.promotionsUsed}   delta={deltas?.promotionsUsed}   />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CustomersChart
          series={stats?.series}
          legend={stats?.legend}
          period={period}
          delta={deltas?.newCustomers}
          totalNouveaux={totals?.newCustomers}
          totalReactives={totals?.reactivatedCustomers}
        />
        <PointsChart
          series={stats?.series}
          legend={stats?.legend}
          period={period}
          delta={deltas?.pointsAttributed}
          totalAttribues={totals?.pointsAttributed}
          totalEchanges={totals?.pointsRedeemed}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RewardsChart
          series={stats?.series}
          legend={stats?.legend}
          period={period}
          delta={deltas?.rewardsRedeemed}
          total={totals?.rewardsRedeemed}
        />
        <PromotionsChart
          series={stats?.series}
          legend={stats?.legend}
          period={period}
          delta={deltas?.promotionsUsed}
          total={totals?.promotionsUsed}
          totalInactifs={totals?.promotionsUsedInactive}
        />
      </div>

    </div>
  );
}
