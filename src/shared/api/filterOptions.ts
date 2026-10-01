import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import type { ApiResponse, FilterOptions } from './types'

async function fetchFilterOptions() {
  const { data } = await apiClient.get<ApiResponse<FilterOptions>>('/filter-options')
  return data.data
}

export const filterOptionsQuery = queryOptions({
  queryKey: ['filter-options'],
  queryFn: fetchFilterOptions,
  staleTime: Infinity,
  gcTime: Infinity,
})

export function useFilterOptions() {
  return useQuery(filterOptionsQuery)
}
