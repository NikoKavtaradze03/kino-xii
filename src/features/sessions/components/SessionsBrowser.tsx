import { useFilterOptions } from '@/shared/api/filterOptions'
import type { FilterOptions } from '@/shared/api/types'
import { useElementHeight } from '@/shared/lib/useElementHeight'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useSessionFilters } from '../hooks'
import { FilterSidebar } from './FilterSidebar'
import { SessionList } from './SessionList'

// Placed in the sessions page grid: the sidebar under the page title, the list to its right.
// `self-start` stops the sidebar stretching to the list's height, which would prevent sticking.
const sidebarArea = 'col-start-1 row-start-2 self-start'
const listArea = 'col-start-2 row-start-2 min-w-0'

const STICKY_GAP = 24

function SessionsView({ options }: { options: FilterOptions }) {
  const sessionFilters = useSessionFilters(options)
  const [sidebarRef, sidebarHeight] = useElementHeight<HTMLDivElement>()

  return (
    <>
      {/* A sidebar that fits the window sticks 24px below its top. A taller one scrolls with the page
          until its bottom edge is 24px above the window's bottom and sticks there (a negative `top`),
          so its lower filters and the counter never stay out of reach. */}
      <div
        ref={sidebarRef}
        style={{ top: `min(${STICKY_GAP}px, calc(100dvh - ${sidebarHeight + STICKY_GAP}px))` }}
        className={`sticky ${sidebarArea}`}
      >
        <FilterSidebar options={options} {...sessionFilters} />
      </div>
      <div className={listArea}>
        <SessionList options={options} {...sessionFilters} />
      </div>
    </>
  )
}

export function SessionsBrowser() {
  const { data: options, error, refetch, isRefetching } = useFilterOptions()

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => void refetch()}
        retrying={isRefetching}
        className="col-span-2"
      />
    )
  }

  if (!options) {
    return (
      <>
        <Skeleton className={`h-251.75 rounded-2xl ${sidebarArea}`} />
        <Skeleton className={`h-104 rounded-2xl ${listArea}`} />
      </>
    )
  }

  return <SessionsView options={options} />
}
