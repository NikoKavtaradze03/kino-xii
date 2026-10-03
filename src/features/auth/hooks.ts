import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
  type QueryClient,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import { setUnauthorizedHandler } from '@/shared/api/client'
import { isApiError } from '@/shared/api/errors'
import type { User } from '@/shared/api/types'
import { authKeys, fetchMe, login, logout, register } from './api'
import { requestLogin, trackSession, useAuthStore } from './store'

export { requestLogin }

async function fetchMeOrSignOut() {
  const isCurrentSession = trackSession()
  try {
    return await fetchMe()
  } catch (error) {
    // A 401 for an older token must not sign out a login that finished while it was on its way.
    if (isApiError(error) && error.kind === 'unauthorized' && isCurrentSession()) {
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

const isSessionDependent = (query: Query) => !query.meta?.sessionIndependent
const isPrivate = (query: Query) => query.queryKey[0] === authKeys.me[0]

/**
 * Called whenever the signed-in user changes. Private data is removed (not just marked stale, which
 * would still show it while refetching); public data that varies per user, such as notify flags,
 * is refetched; session-independent data is left alone.
 */
function resetSessionCache(queryClient: QueryClient, user: User | null) {
  void queryClient.cancelQueries({ predicate: isSessionDependent })
  queryClient.removeQueries({ queryKey: authKeys.me })
  queryClient.setQueryData(authKeys.me, user)
  void queryClient.invalidateQueries({
    predicate: (query) => isSessionDependent(query) && !isPrivate(query),
  })
}

function startSession(queryClient: QueryClient, user: User, token: string) {
  useAuthStore.getState().setToken(token)
  resetSessionCache(queryClient, user)
  useAuthStore.getState().completeLogin()
}

function endSession(queryClient: QueryClient) {
  useAuthStore.getState().setToken(null)
  resetSessionCache(queryClient, null)
}

/** A protected request came back 401: drop the session, ask the user to log in, then replay it. */
export function installUnauthorizedHandler(queryClient: QueryClient) {
  setUnauthorizedHandler((sentWithToken) => {
    const { token } = useAuthStore.getState()
    // The session changed after this request left (e.g. a parallel 401 already led to a new login).
    if (token && token !== sentWithToken) return Promise.resolve(true)
    if (token) endSession(queryClient)
    return requestLogin()
  })
}

export type SessionStatus = 'guest' | 'loading' | 'authenticated' | 'error'

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const { data, isError, isFetching, refetch } = useQuery({ ...meQuery, enabled: token !== null })

  let status: SessionStatus = 'loading'
  if (!token) status = 'guest'
  else if (data) status = 'authenticated'
  else if (isError) status = 'error'

  return {
    status,
    user: status === 'authenticated' ? data : null,
    retry: () => void refetch(),
    isRetrying: isError && isFetching,
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
