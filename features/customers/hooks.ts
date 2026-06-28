import { useQuery } from '@tanstack/react-query';

import { fetchCustomers, type CustomersParams } from './api';

export function useCustomers(params: CustomersParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
  });
}
