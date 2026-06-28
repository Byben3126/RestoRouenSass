import { useMutation, useQuery } from '@tanstack/react-query';

import { createCheckoutSession, createPortalSession, fetchMySubscription } from './api';

export function useMySubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: fetchMySubscription,
    retry: false,
    throwOnError: false,
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (plan: string) => createCheckoutSession(plan),
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}
