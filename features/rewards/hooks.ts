import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { archiveReward, createReward, draftReward, fetchRewards, publishReward, updateReward } from './api';
import type { components } from '@/types/api.generated';

type CreateRewardDto = components['schemas']['CreateRewardDto'];
type UpdateRewardDto = components['schemas']['UpdateRewardDto'];

function useInvalidateRewards() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['rewards'] });
}

export function useRewards() {
  return useQuery({ queryKey: ['rewards'], queryFn: fetchRewards });
}

export function useCreateReward() {
  const invalidate = useInvalidateRewards();
  return useMutation({
    mutationFn: (payload: CreateRewardDto) => createReward(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateReward() {
  const invalidate = useInvalidateRewards();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateRewardDto & { id: string }) => updateReward(id, payload),
    onSuccess: invalidate,
  });
}

export function useArchiveReward() {
  const invalidate = useInvalidateRewards();
  return useMutation({ mutationFn: (id: string) => archiveReward(id), onSuccess: invalidate });
}

export function useDraftReward() {
  const invalidate = useInvalidateRewards();
  return useMutation({ mutationFn: (id: string) => draftReward(id), onSuccess: invalidate });
}

export function usePublishReward() {
  const invalidate = useInvalidateRewards();
  return useMutation({ mutationFn: (id: string) => publishReward(id), onSuccess: invalidate });
}
