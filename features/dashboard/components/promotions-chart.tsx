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
  tous:     { label: "Tous clients",     color: C1 },
  inactifs: { label: "Clients inactifs", color: C2 },
};

function fmt(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : n.toLocaleString("fr-FR");
}

interface PromotionsChartProps {
  data: { d: string; tous: number; inactifs: number }[];
  delta: number;
  total: number;
  totalInactifs: number;
}

export function PromotionsChart({ data, delta, total, totalInactifs }: PromotionsChartProps) {
  const pos = delta >= 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotions utilisées</CardTitle>
        <CardDescription>
          Tous clients · dont <strong>{fmt(totalInactifs)}</strong> clients inactifs réactivés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={cfg} className="h-56 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="gPr1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-tous)"     stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-tous)"     stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gPr2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-inactifs)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-inactifs)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} width={30} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="tous"     type="natural" stroke="var(--color-tous)"     fill="url(#gPr1)" strokeWidth={2}   dot={false} />
            <Area dataKey="inactifs" type="natural" stroke="var(--color-inactifs)" fill="url(#gPr2)" strokeWidth={1.5} dot={false} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <span className={cn("flex items-center gap-1 font-medium", pos ? "text-emerald-600" : "text-red-500")}>
          {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {pos ? "+" : ""}{delta.toFixed(1)}% vs période précédente
        </span>
        <span className="text-muted-foreground">{fmt(total)} utilisations de promotions au total</span>
      </CardFooter>
    </Card>
  );
}
