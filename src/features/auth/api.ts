import { apiClient } from '@/shared/api/client'
import type { ApiResponse, User } from '@/shared/api/types'

export const authKeys = {
  me: ['me'] as const,
}

type Session = { user: User; token: string }

export type LoginBody = { email: string; password: string }

export type RegisterBody = {
  username: string
  email: string
  password: string
  passwordConfirmation: string
  avatar?: File
}

export async function login(body: LoginBody) {
  const { data } = await apiClient.post<ApiResponse<Session>>('/login', body, {
    skipAuthRedirect: true,
  })
  return data.data
}

export async function register({ passwordConfirmation, avatar, ...fields }: RegisterBody) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
  formData.append('password_confirmation', passwordConfirmation)
  if (avatar) formData.append('avatar', avatar)

  const { data } = await apiClient.post<ApiResponse<Session>>('/register', formData, {
    skipAuthRedirect: true,
  })
  return data.data
}

export async function logout() {
  await apiClient.post('/logout', undefined, { skipAuthRedirect: true })
}

export async function fetchMe() {
  const { data } = await apiClient.get<ApiResponse<User>>('/me', { skipAuthRedirect: true })
  return data.data
}
