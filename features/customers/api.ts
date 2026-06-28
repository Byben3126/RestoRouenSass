import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { components, operations } from '@/types/api.generated';

type PaginatedCustomersDto = components['schemas']['PaginatedCustomersDto'];
export type CustomersParams = operations['CustomerController_getRestaurantCustomers']['parameters']['query'];

export async function fetchCustomers(params: CustomersParams = {}): Promise<PaginatedCustomersDto> {
  const { data } = await apiClient.get<ApiResponse<PaginatedCustomersDto>>('/customers', { params });
  return data.data;
}
