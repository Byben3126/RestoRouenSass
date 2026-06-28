import { useQuery } from '@tanstack/react-query';

import { fetchMe } from './api';

export const ME_QUERY_KEY = ['user', 'me'] as const;

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: Infinity,
  });
}
