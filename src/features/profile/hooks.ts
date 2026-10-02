import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from './api'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    // The response is the saved user, so the navbar dot and the booking checks update from it.
    onSuccess: (user) => queryClient.setQueryData(['me'], user),
  })
}
