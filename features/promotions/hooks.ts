import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archivePromotion,
  createPromotion,
  draftPromotion,
  fetchPromotions,
  publishPromotion,
  updatePromotion,
  type CreatePromotionDto,
  type UpdatePromotionDto,
} from './api';

function useInvalidatePromotions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['promotions'] });
}

export function usePromotions() {
  return useQuery({ queryKey: ['promotions'], queryFn: fetchPromotions });
}

export function useCreatePromotion() {
  const invalidate = useInvalidatePromotions();
  return useMutation({
    mutationFn: (payload: CreatePromotionDto) => createPromotion(payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePromotion() {
  const invalidate = useInvalidatePromotions();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdatePromotionDto & { id: string }) =>
      updatePromotion(id, payload),
    onSuccess: invalidate,
  });
}

export function useArchivePromotion() {
  const invalidate = useInvalidatePromotions();
  return useMutation({ mutationFn: (id: string) => archivePromotion(id), onSuccess: invalidate });
}

export function useDraftPromotion() {
  const invalidate = useInvalidatePromotions();
  return useMutation({ mutationFn: (id: string) => draftPromotion(id), onSuccess: invalidate });
}

export function usePublishPromotion() {
  const invalidate = useInvalidatePromotions();
  return useMutation({ mutationFn: (id: string) => publishPromotion(id), onSuccess: invalidate });
}
