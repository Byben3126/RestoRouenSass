import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";

const C1 = "#3a64c4";
const C2 = "#d8a01f";

const cfg: ChartConfig = {
  nouveaux:  { label: "Nouveaux clients",  color: C1 },
  reactives: { label: "Clients réactivés", color: C2 },
};

function fmt(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : n.toLocaleString("fr-FR");
}

interface CustomersChartProps {
  data: { d: string; nouveaux: number; reactives: number }[];
  delta: number;
  totalNouveaux: number;
  totalReactives: number;
}

export function CustomersChart({ data, delta, totalNouveaux, totalReactives }: CustomersChartProps) {
  const pos = delta >= 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveaux clients</CardTitle>
        <CardDescription>Nouvelles inscriptions · clients repassés actifs</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={cfg} className="h-56 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="gC1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-nouveaux)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-nouveaux)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-reactives)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-reactives)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} width={30} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="reactives" type="natural" stroke="var(--color-reactives)" fill="url(#gC2)" strokeWidth={1.5} dot={false} />
            <Area dataKey="nouveaux"  type="natural" stroke="var(--color-nouveaux)"  fill="url(#gC1)" strokeWidth={2}   dot={false} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <span className={cn("flex items-center gap-1 font-medium", pos ? "text-emerald-600" : "text-red-500")}>
          {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {pos ? "+" : ""}{delta.toFixed(1)}% vs période précédente
        </span>
        <span className="text-muted-foreground">
          {fmt(totalNouveaux)} nouveaux clients · {fmt(totalReactives)} réactivés
        </span>
      </CardFooter>
    </Card>
  );
}
