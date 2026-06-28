import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { components } from '@/types/api.generated';

export type PromotionDto = components['schemas']['PromotionDto'];
export type PromotionTargetedCustomer = components['schemas']['CustomerDto'];
export type CreatePromotionDto = components['schemas']['CreatePromotionDto'];
export type UpdatePromotionDto = components['schemas']['UpdatePromotionDto'];
export type PromotionDisplayStatus = PromotionDto['status'];

export async function fetchPromotions(): Promise<PromotionDto[]> {
  const { data } = await apiClient.get<ApiResponse<PromotionDto[]>>('/promotions');
  return data.data;
}

export async function createPromotion(payload: CreatePromotionDto): Promise<PromotionDto> {
  const { data } = await apiClient.post<ApiResponse<PromotionDto>>('/promotions', payload);
  return data.data;
}

export async function updatePromotion(id: string, payload: UpdatePromotionDto): Promise<PromotionDto> {
  const { data } = await apiClient.patch<ApiResponse<PromotionDto>>(`/promotions/${id}`, payload);
  return data.data;
}

export async function archivePromotion(id: string): Promise<PromotionDto> {
  const { data } = await apiClient.patch<ApiResponse<PromotionDto>>(`/promotions/${id}/archive`);
  return data.data;
}

export async function draftPromotion(id: string): Promise<PromotionDto> {
  const { data } = await apiClient.patch<ApiResponse<PromotionDto>>(`/promotions/${id}/draft`);
  return data.data;
}

export async function publishPromotion(id: string): Promise<PromotionDto> {
  const { data } = await apiClient.patch<ApiResponse<PromotionDto>>(`/promotions/${id}/publish`);
  return data.data;
}
