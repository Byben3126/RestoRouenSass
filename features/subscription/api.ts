import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';

export interface SubscriptionData {
  id: string;
  plan: 'starter' | 'growth' | 'pro';
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  createdAt: string;
}

export async function createCheckoutSession(plan: string): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/subscription/checkout', { plan });
  return data.data.url;
}

export async function fetchMySubscription(): Promise<SubscriptionData | null> {
  const { data } = await apiClient.get<ApiResponse<SubscriptionData>>('/subscription');
  return data.data;
}

export async function createPortalSession(): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/subscription/portal');
  return data.data.url;
}
