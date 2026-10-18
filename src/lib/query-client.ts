import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/errors';

function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2) return false;
  if (!(error instanceof ApiError)) return false;
  return error.error.kind === 'network' || error.error.kind === 'server';
}

export function createQueryClient({ gcTime = 5 * 60_000 }: { gcTime?: number } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry, gcTime },
      mutations: { retry: false, gcTime },
    },
  });
}

export const queryClient = createQueryClient();
