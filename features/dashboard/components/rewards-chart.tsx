import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";

const cfg: ChartConfig = {
  cadeaux: { label: "Cadeaux récupérés", color: "#3a64c4" },
};

function fmt(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : n.toLocaleString("fr-FR");
}

interface RewardsChartProps {
  data: { d: string; cadeaux: number }[];
  delta: number;
  total: number;
}

export function RewardsChart({ data, delta, total }: RewardsChartProps) {
  const pos = delta >= 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadeaux récupérés</CardTitle>
        <CardDescription>Récompenses échangées contre des points</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={cfg} className="h-56 w-full">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} width={24} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="cadeaux" fill="var(--color-cadeaux)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <span className={cn("flex items-center gap-1 font-medium", pos ? "text-emerald-600" : "text-red-500")}>
          {pos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {pos ? "+" : ""}{delta.toFixed(1)}% vs période précédente
        </span>
        <span className="text-muted-foreground">{fmt(total)} récompenses obtenues</span>
      </CardFooter>
    </Card>
  );
}
