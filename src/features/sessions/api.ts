import { apiClient } from '@/shared/api/client'
import type { SessionsPage } from '@/shared/api/types'
import type { SessionFilters } from './filters'

export const sessionKeys = {
  all: ['sessions'] as const,
  list: (filters: SessionFilters) => [...sessionKeys.all, 'list', filters] as const,
}

/** Axios sends arrays as `venues[]=a&venues[]=b`, the format the API expects. */
export async function fetchSessions(filters: SessionFilters) {
  const { data } = await apiClient.get<SessionsPage>('/sessions', {
    params: {
      date: filters.date,
      venues: filters.venues,
      formats: filters.formats,
      languages: filters.languages,
      bands: filters.bands,
      sort: filters.sort,
      page: filters.page,
    },
  })
  return data
}
