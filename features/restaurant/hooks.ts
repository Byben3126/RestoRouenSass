import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createMyRestaurant, fetchMyRestaurant, updateMyRestaurant, type CreateRestaurantPayload } from './api';
import type { components } from '@/types/api.generated';

type UpdateRestaurantDto = components['schemas']['UpdateRestaurantDto'];

export function useMyRestaurant() {
  return useQuery({
    queryKey: ['restaurant', 'me'],
    queryFn: fetchMyRestaurant,
    retry: false,
    throwOnError: false,
  });
}

export function useCreateMyRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRestaurantPayload) => createMyRestaurant(payload),
    onSuccess: (created) => {
      queryClient.setQueryData(['restaurant', 'me'], created);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUpdateMyRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRestaurantDto) => updateMyRestaurant(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['restaurant', 'me'], updated);
    },
  });
}
