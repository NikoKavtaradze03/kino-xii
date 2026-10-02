import { create } from 'zustand'
import { tokenStorage } from '@/shared/api/token'

export type AuthModal = 'login' | 'register'

type AuthState = {
  token: string | null
  modal: AuthModal | null
  setToken: (token: string | null) => void
  openModal: (modal: AuthModal) => void
  closeModal: () => void
  completeLogin: () => void
}

let loginWaiters: ((signedIn: boolean) => void)[] = []

function settleLoginWaiters(signedIn: boolean) {
  const waiters = loginWaiters
  loginWaiters = []
  waiters.forEach((resolve) => resolve(signedIn))
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: tokenStorage.get(),
  modal: null,
  setToken: (token) => {
    if (token) tokenStorage.set(token)
    else tokenStorage.clear()
    set({ token })
  },
  openModal: (modal) => set({ modal }),
  closeModal: () => {
    settleLoginWaiters(false)
    set({ modal: null })
  },
  completeLogin: () => {
    settleLoginWaiters(true)
    set({ modal: null })
  },
}))

/**
 * Opens the login modal and resolves once the user signs in (true) or dismisses it (false).
 * Concurrent callers share the same modal; an already open register modal is left as is.
 */
export function requestLogin() {
  const { modal, openModal } = useAuthStore.getState()
  if (!modal) openModal('login')
  return new Promise<boolean>((resolve) => loginWaiters.push(resolve))
}
