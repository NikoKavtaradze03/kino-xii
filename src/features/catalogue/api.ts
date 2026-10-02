import { apiClient } from '@/shared/api/client'
import type { ApiResponse, Movie, MovieDetail, VenueSessions } from '@/shared/api/types'

export const catalogueKeys = {
  all: ['movies'] as const,
  featured: () => [...catalogueKeys.all, 'featured'] as const,
  nowPlaying: (limit?: number) => [...catalogueKeys.all, 'now-playing', { limit }] as const,
  comingSoon: (limit?: number) => [...catalogueKeys.all, 'coming-soon', { limit }] as const,
  detail: (slug: string) => [...catalogueKeys.all, 'detail', slug] as const,
  sessions: (slug: string, date: string) => [...catalogueKeys.all, 'sessions', slug, date] as const,
}

export async function fetchFeatured() {
  const { data } = await apiClient.get<ApiResponse<Movie[]>>('/movies/featured')
  return data.data
}

export async function fetchNowPlaying(limit?: number) {
  const { data } = await apiClient.get<ApiResponse<Movie[]>>('/movies/now-playing', {
    params: { limit },
  })
  return data.data
}

export async function fetchComingSoon(limit?: number) {
  const { data } = await apiClient.get<ApiResponse<Movie[]>>('/movies/coming-soon', {
    params: { limit },
  })
  return data.data
}

export async function fetchMovie(slug: string) {
  const { data } = await apiClient.get<ApiResponse<MovieDetail>>(`/movies/${slug}`)
  return data.data
}

/** One date's sessions for a film, grouped by venue. */
export async function fetchMovieSessions(slug: string, date: string) {
  const { data } = await apiClient.get<ApiResponse<VenueSessions[]>>(`/movies/${slug}/sessions`, {
    params: { date },
  })
  return data.data
}

export async function subscribeToMovie(slug: string) {
  await apiClient.post(`/movies/${slug}/notify`)
}
