import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Spinner } from '@/shared/ui/Spinner'
import { useCurrentUser } from '../hooks'
import { requestLogin, useAuthStore } from '../store'

/**
 * Guards a page for signed-in users. Arriving signed out opens the login modal
 * (declining it goes home); signing out while on the page goes home.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const { status, retry, isRetrying } = useCurrentUser()
  const navigate = useNavigate()
  const wasSignedIn = useRef(token !== null)

  useEffect(() => {
    if (token) {
      wasSignedIn.current = true
      return
    }
    if (wasSignedIn.current) {
      navigate('/', { replace: true })
      return
    }
    void requestLogin().then((signedIn) => {
      if (!signedIn) navigate('/', { replace: true })
    })
  }, [token, navigate])

  if (status === 'authenticated') return children

  if (status === 'error') {
    return (
      <ErrorState
        className="pt-header"
        message="We couldn't load your account. Please try again."
        onRetry={retry}
        retrying={isRetrying}
      />
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center pt-header">
        <Spinner className="size-6" />
      </div>
    )
  }

  return null
}
