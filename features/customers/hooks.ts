import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCustomerPoints,
  fetchCustomers,
  fetchCustomerPointsTransactions,
  type AddCustomerPointsDto,
  type CustomersParams,
} from './api';

export function useCustomers(params: CustomersParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
  });
}

export function useCustomerPointsTransactions(customerId?: string) {
  return useQuery({
    queryKey: ['customers', customerId, 'points-transactions'],
    queryFn: () => fetchCustomerPointsTransactions(customerId!),
    enabled: !!customerId,
  });
}

export function useAddCustomerPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AddCustomerPointsDto & { id: string }) =>
      addCustomerPoints(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
