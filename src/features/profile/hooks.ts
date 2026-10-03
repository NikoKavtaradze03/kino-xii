import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/features/auth/api'
import { trackSession } from '@/features/auth/store'
import { updateProfile } from './api'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onMutate: trackSession,
    // The response is the saved user, so the navbar dot and the booking checks update from it.
    // If the session changed while saving, the response may belong to another account: the
    // current user is refetched instead.
    onSuccess: (user, _body, isCurrentSession) => {
      if (isCurrentSession()) queryClient.setQueryData(authKeys.me, user)
      else void queryClient.invalidateQueries({ queryKey: authKeys.me, exact: true })
    },
  })
}
