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

// ─── Mock data ───────────────────────────────────────────────────────────────

const CUSTOMERS_7D  = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d,i)=>({ d, nouveaux:[2,1,3,2,4,1,1][i], reactives:[1,0,2,1,1,0,1][i] }));
const CUSTOMERS_30D = Array.from({length:30},(_,i)=>({ d:`J${i+1}`, nouveaux:((i*7+3)%6)+1, reactives:(i*5+2)%4 }));
const CUSTOMERS_90D = Array.from({length:12},(_,i)=>({ d:`S${i+1}`, nouveaux:((i*11+5)%17)+5, reactives:3+((i*9+4)%10) }));

const POINTS_7D  = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d,i)=>({ d, attribues:[420,380,610,540,720,490,680][i], echanges:[80,60,120,90,150,100,130][i] }));
const POINTS_30D = Array.from({length:30},(_,i)=>({ d:`J${i+1}`, attribues:300+((i*97+41)%450), echanges:40+((i*53+17)%120) }));
const POINTS_90D = Array.from({length:12},(_,i)=>({ d:`S${i+1}`, attribues:3000+((i*431+211)%2500), echanges:300+((i*173+89)%600) }));

const REWARDS_7D  = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d,i)=>({ d, cadeaux:[1,2,0,1,2,1,2][i] }));
const REWARDS_30D = Array.from({length:30},(_,i)=>({ d:`J${i+1}`, cadeaux:((i*11+3)%5) }));
const REWARDS_90D = Array.from({length:12},(_,i)=>({ d:`S${i+1}`, cadeaux:5+((i*7+2)%17) }));

const PROMOS_7D  = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d,i)=>({ d, tous:[14,18,20,15,22,18,20][i], inactifs:[4,5,6,4,7,5,6][i] }));
const PROMOS_30D = Array.from({length:30},(_,i)=>({ d:`J${i+1}`, tous:10+((i*13+7)%18), inactifs:2+((i*7+3)%6) }));
const PROMOS_90D = Array.from({length:12},(_,i)=>({ d:`S${i+1}`, tous:80+((i*43+21)%80), inactifs:15+((i*17+9)%30) }));

const DATASETS = {
  "7d":  { customers:CUSTOMERS_7D,  points:POINTS_7D,  rewards:REWARDS_7D,  promos:PROMOS_7D,  delta:{c:16.7, p:8.2,  r:-10.0, pr:22.1} },
  "30d": { customers:CUSTOMERS_30D, points:POINTS_30D, rewards:REWARDS_30D, promos:PROMOS_30D, delta:{c:9.4,  p:12.3, r:4.5,   pr:18.7} },
  "90d": { customers:CUSTOMERS_90D, points:POINTS_90D, rewards:REWARDS_90D, promos:PROMOS_90D, delta:{c:31.4, p:28.8, r:14.2,  pr:42.5} },
};

function total<T extends Record<string, unknown>>(arr: T[], key: keyof T) {
  return arr.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);
}

// ─── Period selector ─────────────────────────────────────────────────────────

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
  const mock = DATASETS[period];

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", period],
    queryFn: () => fetchDashboardStats(period),
  });

  const totals  = stats?.totals;
  const deltas  = stats?.deltas;

  const kpiReact = totals?.reactivatedCustomers ?? total(mock.customers, "reactives");
  const kpiIn    = totals?.promotionsUsedInactive ?? total(mock.promos,    "inactifs");

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
          data={mock.customers}
          delta={deltas?.newCustomers ?? mock.delta.c}
          totalNouveaux={totals?.newCustomers ?? total(mock.customers, "nouveaux")}
          totalReactives={kpiReact}
        />
        <PointsChart
          data={mock.points}
          delta={deltas?.pointsAttributed ?? mock.delta.p}
          totalAttribues={totals?.pointsAttributed ?? total(mock.points, "attribues")}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RewardsChart
          data={mock.rewards}
          delta={deltas?.rewardsRedeemed ?? mock.delta.r}
          total={totals?.rewardsRedeemed ?? total(mock.rewards, "cadeaux")}
        />
        <PromotionsChart
          data={mock.promos}
          delta={deltas?.promotionsUsed ?? mock.delta.pr}
          total={totals?.promotionsUsed ?? total(mock.promos, "tous")}
          totalInactifs={kpiIn}
        />
      </div>

    </div>
  );
}
