"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";

// ─── Period ──────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d";
const PERIODS: { value: Period; label: string }[] = [
  { value: "7d",  label: "7 jours"  },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

// ─── Data ────────────────────────────────────────────────────────────────────

const CUSTOMERS_7D  = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d,i)=>({ d, nouveaux:[2,1,3,2,4,1,1][i], total:180+[0,1,4,6,10,11,12][i] }));
const CUSTOMERS_30D = Array.from({length:30},(_,i)=>({ d:`J${i+1}`, nouveaux:((i*7+3)%6)+1, total:155+Math.round(i*1.3) }));
const CUSTOMERS_90D = Array.from({length:12},(_,i)=>({ d:`S${i+1}`, nouveaux:((i*11+5)%17)+5, total:120+i*7 }));

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

function total<T extends Record<string,unknown>>(arr:T[], key:keyof T) {
  return arr.reduce((acc,r)=>acc+Number(r[key]??0),0);
}
function fmt(n:number) { return n>=1000?`${(n/1000).toFixed(1)}k`:String(n); }

// ─── Chart configs ────────────────────────────────────────────────────────────

const cfgCustomers: ChartConfig = {
  nouveaux: { label:"Nouveaux clients", color:"hsl(var(--chart-1))" },
  total:    { label:"Total clients",    color:"hsl(var(--chart-2))" },
};
const cfgPoints: ChartConfig = {
  attribues: { label:"Points attribués", color:"hsl(var(--chart-1))" },
  echanges:  { label:"Points échangés",  color:"hsl(var(--chart-2))" },
};
const cfgRewards: ChartConfig = {
  cadeaux: { label:"Cadeaux récupérés", color:"hsl(var(--chart-1))" },
};
const cfgPromos: ChartConfig = {
  tous:     { label:"Tous clients",     color:"hsl(var(--chart-1))" },
  inactifs: { label:"Clients inactifs", color:"hsl(var(--chart-2))" },
};

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

// ─── Delta badge ─────────────────────────────────────────────────────────────

function Delta({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={cn("flex items-center gap-1 font-medium", pos ? "text-emerald-600" : "text-red-500")}>
      {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      {pos ? "+" : ""}{value.toFixed(1)}% vs période précédente
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const d = DATASETS[period];

  const kpiC  = total(d.customers, "nouveaux");
  const kpiP  = total(d.points,    "attribues");
  const kpiR  = total(d.rewards,   "cadeaux");
  const kpiPr = total(d.promos,    "tous");
  const kpiIn = total(d.promos,    "inactifs");

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vue d'ensemble</h1>
          <p className="text-sm text-muted-foreground">Activité de votre programme de fidélité.</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Nouveaux clients */}
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux clients</CardTitle>
            <CardDescription>Inscriptions sur la période · total cumulé</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cfgCustomers} className="h-56 w-full">
              <AreaChart data={d.customers} margin={{left:0,right:0}}>
                <defs>
                  <linearGradient id="gC1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-nouveaux)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-nouveaux)" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-total)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}}/>
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}} width={30}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot"/>}/>
                <Area dataKey="total"    type="natural" stroke="var(--color-total)"    fill="url(#gC2)" strokeWidth={1.5} dot={false}/>
                <Area dataKey="nouveaux" type="natural" stroke="var(--color-nouveaux)" fill="url(#gC1)" strokeWidth={2}   dot={false}/>
                <ChartLegend content={<ChartLegendContent/>}/>
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <Delta value={d.delta.c}/>
            <span className="text-muted-foreground">{fmt(kpiC)} nouveaux clients enregistrés</span>
          </CardFooter>
        </Card>

        {/* Points */}
        <Card>
          <CardHeader>
            <CardTitle>Points de fidélité</CardTitle>
            <CardDescription>Points attribués et échangés sur la période</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cfgPoints} className="h-56 w-full">
              <BarChart data={d.points} margin={{left:0,right:0}}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}}/>
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}} width={36}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot"/>}/>
                <Bar dataKey="attribues" fill="var(--color-attribues)" radius={[4,4,0,0]} maxBarSize={22}/>
                <Bar dataKey="echanges"  fill="var(--color-echanges)"  radius={[4,4,0,0]} maxBarSize={22}/>
                <ChartLegend content={<ChartLegendContent/>}/>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <Delta value={d.delta.p}/>
            <span className="text-muted-foreground">{fmt(kpiP)} points distribués au total</span>
          </CardFooter>
        </Card>

      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Cadeaux */}
        <Card>
          <CardHeader>
            <CardTitle>Cadeaux récupérés</CardTitle>
            <CardDescription>Récompenses échangées contre des points</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cfgRewards} className="h-56 w-full">
              <BarChart data={d.rewards} margin={{left:0,right:0}}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}}/>
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}} width={24} allowDecimals={false}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot"/>}/>
                <Bar dataKey="cadeaux" fill="var(--color-cadeaux)" radius={[4,4,0,0]} maxBarSize={32}/>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <Delta value={d.delta.r}/>
            <span className="text-muted-foreground">{fmt(kpiR)} récompenses obtenues</span>
          </CardFooter>
        </Card>

        {/* Promotions */}
        <Card>
          <CardHeader>
            <CardTitle>Promotions utilisées</CardTitle>
            <CardDescription>
              Tous clients · dont <strong>{fmt(kpiIn)}</strong> clients inactifs réactivés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cfgPromos} className="h-56 w-full">
              <AreaChart data={d.promos} margin={{left:0,right:0}}>
                <defs>
                  <linearGradient id="gPr1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-tous)"     stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-tous)"     stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="gPr2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-inactifs)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-inactifs)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}}/>
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize:11}} width={30}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot"/>}/>
                <Area dataKey="tous"     type="natural" stroke="var(--color-tous)"     fill="url(#gPr1)" strokeWidth={2}   dot={false}/>
                <Area dataKey="inactifs" type="natural" stroke="var(--color-inactifs)" fill="url(#gPr2)" strokeWidth={1.5} dot={false}/>
                <ChartLegend content={<ChartLegendContent/>}/>
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <Delta value={d.delta.pr}/>
            <span className="text-muted-foreground">{fmt(kpiPr)} utilisations de promotions au total</span>
          </CardFooter>
        </Card>

      </div>

    </div>
  );
}
