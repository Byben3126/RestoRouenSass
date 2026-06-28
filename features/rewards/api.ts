import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { components } from '@/types/api.generated';

type RewardDto = components['schemas']['RewardDto'];
type CreateRewardDto = components['schemas']['CreateRewardDto'];
type UpdateRewardDto = components['schemas']['UpdateRewardDto'];

export async function fetchRewards(): Promise<RewardDto[]> {
  const { data } = await apiClient.get<ApiResponse<RewardDto[]>>('/rewards');
  return data.data;
}

export async function createReward(payload: CreateRewardDto): Promise<RewardDto> {
  const { data } = await apiClient.post<ApiResponse<RewardDto>>('/rewards', payload);
  return data.data;
}

export async function updateReward(id: string, payload: UpdateRewardDto): Promise<RewardDto> {
  const { data } = await apiClient.patch<ApiResponse<RewardDto>>(`/rewards/${id}`, payload);
  return data.data;
}

export async function archiveReward(id: string): Promise<RewardDto> {
  const { data } = await apiClient.patch<ApiResponse<RewardDto>>(`/rewards/${id}/archive`);
  return data.data;
}

export async function draftReward(id: string): Promise<RewardDto> {
  const { data } = await apiClient.patch<ApiResponse<RewardDto>>(`/rewards/${id}/draft`);
  return data.data;
}

export async function publishReward(id: string): Promise<RewardDto> {
  const { data } = await apiClient.patch<ApiResponse<RewardDto>>(`/rewards/${id}/publish`);
  return data.data;
}
