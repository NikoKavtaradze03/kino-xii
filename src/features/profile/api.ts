import { apiClient } from '@/shared/api/client'
import type { ApiResponse, User } from '@/shared/api/types'

export type ProfileBody = {
  fullName: string
  mobileNumber: string
  dateOfBirth: string
  preferredVenueId: number | null
}

export async function updateProfile({ preferredVenueId, ...fields }: ProfileBody) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
  formData.append('preferredVenueId', preferredVenueId === null ? '' : String(preferredVenueId))
  // The API is Laravel, and PHP only parses multipart bodies on POST: Laravel reads `_method`
  // and routes the request as the documented PUT.
  formData.append('_method', 'PUT')

  const { data } = await apiClient.post<ApiResponse<User>>('/profile', formData)
  return data.data
}
