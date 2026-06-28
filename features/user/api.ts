import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { components } from '@/types/api.generated';

type UserDto = components['schemas']['UserDto'];

export async function fetchMe(): Promise<UserDto> {
  const { data } = await apiClient.get<ApiResponse<UserDto>>('/users/me');
  return data.data;
}
