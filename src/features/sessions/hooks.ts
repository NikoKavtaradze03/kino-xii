import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import type { FilterOptions } from '@/shared/api/types'
import { upcomingDates } from '@/shared/lib/dates'
import { fetchSessions, sessionKeys } from './api'
import {
  availableFormats,
  parseSessionFilters,
  sessionFiltersSearch,
  type FilterValues,
  type SessionFilters,
} from './filters'

export function useSessions(filters: SessionFilters) {
  return useQuery({ queryKey: sessionKeys.list(filters), queryFn: () => fetchSessions(filters) })
}

/**
 * The URL is the only copy of the filters: every change navigates (so Back restores the previous
 * filters) and the filters are parsed back from the new URL.
 */
export function useSessionFilters(options: FilterOptions) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [dates] = useState(() => upcomingDates(new Date()))

  const filters = useMemo(
    () => parseSessionFilters(searchParams, options, dates),
    [searchParams, options, dates],
  )

  const show = (next: SessionFilters, keepScroll: boolean) =>
    navigate(
      { search: sessionFiltersSearch(next, options, dates) },
      { preventScrollReset: keepScroll },
    )

  /** Any change other than the page goes back to page 1. */
  const setFilters = (change: Partial<FilterValues & Pick<SessionFilters, 'date' | 'sort'>>) => {
    const next = { ...filters, ...change, page: 1 }
    const formats = availableFormats(options, next.venues).map((f) => f.slug)
    next.formats = next.formats.filter((slug) => formats.includes(slug))
    show(next, true)
  }

  return {
    filters,
    dates,
    setFilters,
    setPage: (page: number) => show({ ...filters, page }, false),
    clearFilters: () => setFilters({ venues: [], formats: [], languages: [], bands: [] }),
  }
}
