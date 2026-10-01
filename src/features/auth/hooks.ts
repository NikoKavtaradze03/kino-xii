import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import { setUnauthorizedHandler } from '@/shared/api/client'
import { isApiError } from '@/shared/api/errors'
import type { User } from '@/shared/api/types'
import { authKeys, fetchMe, login, logout, register } from './api'
import { requestLogin, useAuthStore } from './store'

async function fetchMeOrSignOut() {
  try {
    return await fetchMe()
  } catch (error) {
    if (isApiError(error) && error.kind === 'unauthorized') {
      useAuthStore.getState().setToken(null)
      return null
    }
    throw error
  }
}

const meQuery = queryOptions({
  queryKey: authKeys.me,
  queryFn: fetchMeOrSignOut,
  staleTime: Infinity,
})

// Other cached data (notify flags, held seats, tickets) depends on who is signed in.
function refetchUserScopedData(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] !== authKeys.me[0],
  })
}

function startSession(queryClient: QueryClient, user: User, token: string) {
  useAuthStore.getState().setToken(token)
  queryClient.setQueryData(authKeys.me, user)
  void refetchUserScopedData(queryClient)
  useAuthStore.getState().completeLogin()
}

function endSession(queryClient: QueryClient) {
  useAuthStore.getState().setToken(null)
  queryClient.setQueryData(authKeys.me, null)
  void refetchUserScopedData(queryClient)
}

/** A protected request came back 401: drop the session, ask the user to log in, then replay it. */
export function installUnauthorizedHandler(queryClient: QueryClient) {
  setUnauthorizedHandler(() => {
    endSession(queryClient)
    return requestLogin()
  })
}

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const { data, isPending } = useQuery({ ...meQuery, enabled: token !== null })

  return {
    user: token ? (data ?? null) : null,
    isLoading: token !== null && isPending,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: ({ user, token }) => startSession(queryClient, user, token),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: register,
    onSuccess: ({ user, token }) => startSession(queryClient, user, token),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSettled: () => endSession(queryClient),
  })
}

/** Runs `action` now if signed in; otherwise after a successful login. */
export function useRequireAuth() {
  const { user } = useCurrentUser()

  return useCallback(
    (action: () => void) => {
      if (user) {
        action()
        return
      }
      void requestLogin().then((signedIn) => {
        if (signedIn) action()
      })
    },
    [user],
  )
}
