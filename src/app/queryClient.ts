import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/shared/api/errors'

const MAX_RETRIES = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Only transient failures are worth retrying; a 404 or 422 will fail the same way again.
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES &&
        isApiError(error) &&
        (error.kind === 'server' || error.kind === 'network'),
    },
  },
})
