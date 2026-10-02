import { useId, type ReactNode } from 'react'
import type { FilterOptions } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { activeFilterCount, availableFormats, type FilterValues } from '../filters'
import type { useSessionFilters } from '../hooks'
import { DateStrip } from './DateStrip'

type FilterSidebarProps = Omit<ReturnType<typeof useSessionFilters>, 'setPage'> & {
  options: FilterOptions
  className?: string
}

const toggled = <T,>(list: T[], value: T, on: boolean) =>
  on ? [...list, value] : list.filter((item) => item !== value)

/** "Morning (before 12:00)" → ["Morning", "before 12:00"], shown as "Morning · before 12:00". */
const splitLabel = (label: string) => label.match(/^(.*?)\s*\((.*)\)$/)?.slice(1) ?? [label]

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  const titleId = useId()
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="flex flex-col gap-3 border-b border-raised pb-6"
    >
      <h3 id={titleId} className="text-overline text-secondary uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function FilterSidebar({
  options,
  filters,
  dates,
  setFilters,
  clearFilters,
  className,
}: FilterSidebarProps) {
  const count = activeFilterCount(filters)
  const checkbox = (key: keyof FilterValues, value: string) => ({
    checked: (filters[key] as string[]).includes(value),
    onCheckedChange: (on: boolean) =>
      setFilters({ [key]: toggled<string>(filters[key], value, on) }),
  })

  return (
    <aside
      aria-label="Filters"
      className={cn('flex flex-col gap-6 rounded-2xl bg-card p-6', className)}
    >
      <h2 className="text-h3">Filters</h2>

      <FilterSection title="Venue">
        {options.venues.map((venue) => (
          <Checkbox
            key={venue.slug}
            label={venue.name}
            detail={venue.city}
            {...checkbox('venues', venue.slug)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Date">
        <DateStrip
          dates={dates}
          selected={filters.date}
          onSelect={(date) => setFilters({ date })}
        />
      </FilterSection>

      <FilterSection title="Format">
        {availableFormats(options, filters.venues).map((format) => (
          <Checkbox key={format.slug} label={format.name} {...checkbox('formats', format.slug)} />
        ))}
      </FilterSection>

      <FilterSection title="Language">
        {options.languages.map((language) => (
          <Checkbox
            key={language.slug}
            label={language.name}
            {...checkbox('languages', language.slug)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Time of day">
        {options.timeBands.map((band) => {
          const [name, detail] = splitLabel(band.label)
          return (
            <Checkbox key={band.id} label={name} detail={detail} {...checkbox('bands', band.id)} />
          )
        })}
      </FilterSection>

      {/* The button keeps its space while hidden, so the counter does not move (as in Figma). */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className={cn('h-7.75 w-full', count === 0 && 'invisible')}
        >
          Clear filters
        </Button>
        <p className="text-body-s text-secondary">
          {count} {count === 1 ? 'filter' : 'filters'} active
        </p>
      </div>
    </aside>
  )
}
