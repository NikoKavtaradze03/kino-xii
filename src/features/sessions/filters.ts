import type { FilterOptions, SortId, TimeBandId } from '@/shared/api/types'

export type SessionFilters = {
  date: string
  venues: string[]
  formats: string[]
  languages: string[]
  bands: TimeBandId[]
  sort: SortId
  page: number
}

export type FilterValues = Pick<SessionFilters, 'venues' | 'formats' | 'languages' | 'bands'>

const slugs = (items: { slug: string }[]) => items.map((item) => item.slug)

/** With venues selected, only the formats at least one of them offers; otherwise all formats. */
export function availableFormats(options: FilterOptions, venues: string[]) {
  if (venues.length === 0) return options.formats
  const offered = new Set(
    options.venues
      .filter((v) => venues.includes(v.slug))
      .flatMap((v) => v.formats.map((f) => f.slug)),
  )
  return options.formats.filter((f) => offered.has(f.slug))
}

export function activeFilterCount(filters: FilterValues) {
  return (
    filters.venues.length + filters.formats.length + filters.languages.length + filters.bands.length
  )
}

/**
 * The URL uses the brief's format (`venue=galleria,batumi&format=max`). Values the API does not
 * know would make it answer 422, so anything not in the filter options is dropped.
 */
export function parseSessionFilters(
  params: URLSearchParams,
  options: FilterOptions,
  dates: string[],
): SessionFilters {
  const list = <T extends string>(key: string, allowed: readonly T[]) => {
    const values = params.get(key)?.split(',') ?? []
    return allowed.filter((value) => values.includes(value))
  }

  const venues = list('venue', slugs(options.venues))
  const bandIds = options.timeBands.map((band) => band.id)
  const date = params.get('date') ?? ''
  const sort = params.get('sort')
  const page = Number(params.get('page'))

  return {
    date: dates.includes(date) ? date : dates[0],
    venues,
    formats: list('format', slugs(availableFormats(options, venues))),
    languages: list('language', slugs(options.languages)),
    bands: list('time', bandIds),
    sort: options.sorts.find((s) => s.id === sort)?.id ?? options.sorts[0].id,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/** Defaults (today, the first sort, page 1, empty lists) are left out to keep links short. */
export function sessionFiltersSearch(
  filters: SessionFilters,
  options: FilterOptions,
  dates: string[],
) {
  const params: [string, string | string[]][] = [
    ['venue', filters.venues],
    ['date', filters.date === dates[0] ? '' : filters.date],
    ['format', filters.formats],
    ['language', filters.languages],
    ['time', filters.bands],
    ['sort', filters.sort === options.sorts[0].id ? '' : filters.sort],
    ['page', filters.page > 1 ? String(filters.page) : ''],
  ]

  // Built by hand because URLSearchParams would encode the commas as %2C.
  const query = params
    .map(([key, value]) => [key, [value].flat().map(encodeURIComponent).join(',')])
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return query ? `?${query}` : ''
}
