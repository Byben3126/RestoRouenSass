import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { components } from '@/types/api.generated';

type RestaurantDto = components['schemas']['RestaurantDto'];
type UpdateRestaurantDto = components['schemas']['UpdateRestaurantDto'];

export type CreateRestaurantPayload = {
  name: string;
  latitude: number;
  longitude: number;
};

export async function createMyRestaurant(payload: CreateRestaurantPayload): Promise<RestaurantDto> {
  const { data } = await apiClient.post<ApiResponse<RestaurantDto>>('/restaurant', payload);
  return data.data;
}

export async function fetchMyRestaurant(): Promise<RestaurantDto> {
  const { data } = await apiClient.get<ApiResponse<RestaurantDto>>('/restaurant/me');
  return data.data;
}

export async function updateMyRestaurant(payload: UpdateRestaurantDto): Promise<RestaurantDto> {
  const { data } = await apiClient.patch<ApiResponse<RestaurantDto>>('/restaurant/me', payload);
  return data.data;
}
