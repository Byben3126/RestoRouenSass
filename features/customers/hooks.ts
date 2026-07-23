import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addCustomerPoints, fetchCustomers, type AddCustomerPointsDto, type CustomersParams } from './api';

export function useCustomers(params: CustomersParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
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
