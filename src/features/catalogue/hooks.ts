import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  catalogueKeys,
  fetchComingSoon,
  fetchFeatured,
  fetchMovie,
  fetchNowPlaying,
  subscribeToMovie,
} from './api'

export const movieQuery = (slug: string) =>
  queryOptions({ queryKey: catalogueKeys.detail(slug), queryFn: () => fetchMovie(slug) })

export function useFeaturedMovies() {
  return useQuery({ queryKey: catalogueKeys.featured(), queryFn: fetchFeatured })
}

export function useNowPlaying(limit?: number) {
  return useQuery({
    queryKey: catalogueKeys.nowPlaying(limit),
    queryFn: () => fetchNowPlaying(limit),
  })
}

export function useComingSoon(limit?: number) {
  return useQuery({
    queryKey: catalogueKeys.comingSoon(limit),
    queryFn: () => fetchComingSoon(limit),
  })
}

export function useMovie(slug: string) {
  return useQuery(movieQuery(slug))
}

/** Every list that carries `isNotified` is refetched, so the button renders the server's answer. */
export function useNotifyMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subscribeToMovie,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogueKeys.all }),
  })
}
