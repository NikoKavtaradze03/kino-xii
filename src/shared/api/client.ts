import axios, { isAxiosError } from 'axios'
import { toApiError } from './errors'
import { tokenStorage } from './token'

declare module 'axios' {
  interface AxiosRequestConfig {
    // Login, register and the boot-time /me check handle their own 401s.
    skipAuthRedirect?: boolean
  }
}

type UnauthorizedHandler = () => Promise<boolean>

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = toApiError(error)
    const config = isAxiosError(error) ? error.config : undefined

    if (
      apiError.kind === 'unauthorized' &&
      config &&
      !config.skipAuthRedirect &&
      unauthorizedHandler
    ) {
      const signedIn = await unauthorizedHandler()
      if (signedIn) return apiClient({ ...config, skipAuthRedirect: true })
    }

    throw apiError
  },
)
