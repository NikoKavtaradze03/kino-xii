import { useFilterOptions } from '@/shared/api/filterOptions'
import type { FilterOptions } from '@/shared/api/types'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useSessionFilters } from '../hooks'
import { FilterSidebar } from './FilterSidebar'
import { SessionList } from './SessionList'

// Placed in the sessions page grid: the sidebar under the page title, the list to its right.
// `self-start` stops the sidebar stretching to the list's height, which would prevent sticking.
const sidebarArea = 'col-start-1 row-start-2 self-start'
const listArea = 'col-start-2 row-start-2 min-w-0'

function SessionsView({ options }: { options: FilterOptions }) {
  const sessionFilters = useSessionFilters(options)
  return (
    <>
      <FilterSidebar
        options={options}
        {...sessionFilters}
        className={`sticky top-6 ${sidebarArea}`}
      />
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
