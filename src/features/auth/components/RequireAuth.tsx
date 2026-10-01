import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useCurrentUser } from '../hooks'
import { requestLogin, useAuthStore } from '../store'

/**
 * Guards a page for signed-in users. Arriving signed out opens the login modal
 * (declining it goes home); signing out while on the page goes home.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const { user } = useCurrentUser()
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

  return user ? children : null
}
