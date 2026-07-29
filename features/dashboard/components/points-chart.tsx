import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardSeriesPoint, DashboardLegendEntry } from "@/features/dashboard/api";
import { buildChartData, xAxisProps, type Period } from "@/features/dashboard/chart-utils";

const C1 = "#3a64c4";
const C2 = "#d8a01f";

const cfg: ChartConfig = {
  attribues: { label: "Points attribués", color: C1 },
  echanges:  { label: "Points échangés",  color: C2 },
};

function fmt(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : n.toLocaleString("fr-FR");
}

interface PointsChartProps {
  series?: DashboardSeriesPoint[];
  legend?: DashboardLegendEntry[];
  period: Period;
  delta?: number;
  totalAttribues?: number;
  totalEchanges?: number;
}

export function PointsChart({ series, legend, period, delta, totalAttribues, totalEchanges }: PointsChartProps) {
  const loading = !series || !legend;
  const pos = (delta ?? 0) >= 0;

  const { data, ticks } = loading
    ? { data: [], ticks: undefined }
    : buildChartData(series, legend, period, (p) => ({
        attribues: p.pointsAttributed,
        echanges: p.pointsRedeemed,
      }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points de fidélité</CardTitle>
        <CardDescription>Points attribués et échangés sur la période</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-56 w-full animate-pulse rounded-lg bg-muted" />
        ) : (
          <ChartContainer config={cfg} className="h-56 w-full">
            <BarChart data={data} margin={{ left: 0, right: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} {...xAxisProps(ticks)} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} width={36} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="attribues" fill="var(--color-attribues)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="echanges"  fill="var(--color-echanges)"  radius={[4, 4, 0, 0]} maxBarSize={22} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        {delta === undefined ? (
          <span className="h-4 w-48 animate-pulse rounded-full bg-muted" />
        ) : (
          <span className={cn("flex items-center gap-1 font-medium", pos ? "text-emerald-600" : "text-red-500")}>
            {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {pos ? "+" : ""}{delta.toFixed(1)}% vs période précédente
          </span>
        )}
        <span className="text-muted-foreground">
          {totalAttribues !== undefined && totalEchanges !== undefined
            ? `${fmt(totalAttribues)} attribués · ${fmt(totalEchanges)} échangés`
            : <span className="inline-block h-3 w-40 animate-pulse rounded-full bg-muted" />
          }
        </span>
      </CardFooter>
    </Card>
  );
}
