import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchKeys, searchMovies } from './api'

/** Keeps showing the previous results while the next ones load, so the list doesn't flicker. */
export function useSearchResults(query: string) {
  return useQuery({
    queryKey: searchKeys.results(query),
    queryFn: () => searchMovies(query),
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
  })
}
