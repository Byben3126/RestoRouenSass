import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { components, operations } from '@/types/api.generated';

export type DashboardPeriod = NonNullable<operations['DashboardController_getStats']['parameters']['query']>['period'];
export type DashboardStats = components['schemas']['DashboardStatsDto'];
export type DashboardTotals = components['schemas']['DashboardTotalsDto'];
export type DashboardDeltas = components['schemas']['DashboardDeltasDto'];
export type DashboardSeriesPoint = components['schemas']['DashboardSeriesPointDto'];
export type DashboardLegendEntry = components['schemas']['DashboardLegendEntryDto'];

export async function fetchDashboardStats(period: DashboardPeriod): Promise<DashboardStats> {
  const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', {
    params: { period },
  });
  return data.data;
}
