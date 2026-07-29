import type { DashboardSeriesPoint, DashboardLegendEntry } from "@/features/dashboard/api";

export type Period = "7d" | "30d" | "90d";

export function buildChartData<T extends Record<string, number>>(
  series: DashboardSeriesPoint[],
  legend: DashboardLegendEntry[],
  period: Period,
  mapper: (point: DashboardSeriesPoint) => T,
): { data: ({ d: string } & T)[]; ticks?: string[] } {
  if (period === "7d") {
    return {
      data: series.map((p, i) => ({
        d: legend[i]?.dayLabelShort ?? `J${i + 1}`,
        ...mapper(p),
      })),
    };
  }

  if (period === "30d") {
    const n = series.length;
    return {
      data: series.map((p, i) => ({ d: `J${i + 1}`, ...mapper(p) })),
      ticks: Array.from({ length: Math.floor(n / 2) }, (_, i) => `J${(i + 1) * 2}`),
    };
  }

  // 90d → agrégation hebdomadaire
  const weeks = new Map<number, { d: string } & T>();
  series.forEach((p, i) => {
    const wn = legend[i]?.weekNumber ?? Math.floor(i / 7) + 1;
    if (!weeks.has(wn)) {
      weeks.set(wn, { d: `S${wn}`, ...mapper(p) });
    } else {
      const w = weeks.get(wn)!;
      const vals = mapper(p);
      for (const k of Object.keys(vals) as (keyof T)[]) {
        (w as Record<string, number>)[k as string] =
          ((w as Record<string, number>)[k as string] ?? 0) + (vals[k] as number);
      }
    }
  });
  return { data: Array.from(weeks.values()) };
}

export function xAxisProps(ticks?: string[]) {
  return ticks ? { ticks, interval: 0 as const } : {};
}
