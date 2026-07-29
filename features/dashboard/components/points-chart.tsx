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
  data: { d: string; attribues: number; echanges: number }[];
  delta: number;
  totalAttribues: number;
}

export function PointsChart({ data, delta, totalAttribues }: PointsChartProps) {
  const pos = delta >= 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Points de fidélité</CardTitle>
        <CardDescription>Points attribués et échangés sur la période</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={cfg} className="h-56 w-full">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} width={36} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="attribues" fill="var(--color-attribues)" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="echanges"  fill="var(--color-echanges)"  radius={[4, 4, 0, 0]} maxBarSize={22} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <span className={cn("flex items-center gap-1 font-medium", pos ? "text-emerald-600" : "text-red-500")}>
          {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {pos ? "+" : ""}{delta.toFixed(1)}% vs période précédente
        </span>
        <span className="text-muted-foreground">{fmt(totalAttribues)} points distribués au total</span>
      </CardFooter>
    </Card>
  );
}
