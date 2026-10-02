import { apiClient } from '@/shared/api/client'
import type { ApiResponse, Movie } from '@/shared/api/types'

export const searchKeys = {
  all: ['search'] as const,
  results: (query: string) => [...searchKeys.all, query] as const,
}

/** Title search for the header; the API returns at most 6 films. */
export async function searchMovies(query: string) {
  const { data } = await apiClient.get<ApiResponse<Movie[]>>('/search', { params: { q: query } })
  return data.data
}
