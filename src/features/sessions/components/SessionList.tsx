import { useOpenBooking } from '@/features/booking/hooks'
import type { FilterOptions } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Pagination } from '@/shared/ui/Pagination'
import { Skeleton } from '@/shared/ui/Skeleton'
import { activeFilterCount } from '../filters'
import { useSessions, type useSessionFilters } from '../hooks'
import { MovieSessions } from './MovieSessions'
import { SortSelect } from './SortSelect'

type SessionListProps = Omit<ReturnType<typeof useSessionFilters>, 'dates'> & {
  options: FilterOptions
}

// Every group after the first gets a divider above it: 32px gap, line, 32px padding.
const groupsClasses = 'flex flex-col gap-8 [&>*+*]:border-t [&>*+*]:border-raised [&>*+*]:pt-8'

function GroupsSkeleton() {
  return (
    <div aria-busy className={groupsClasses}>
      {Array.from({ length: 3 }, (_, group) => (
        <div key={group} className="flex flex-col gap-3.5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-14" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, card) => (
              <Skeleton key={card} className="h-26 w-63 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SessionList({
  options,
  filters,
  setFilters,
  setPage,
  clearFilters,
}: SessionListProps) {
  const { data, error, refetch, isRefetching } = useSessions(filters)
  const openBooking = useOpenBooking()
  const total = data?.meta.totalSessions
  const hasFilters = activeFilterCount(filters) > 0

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-6">
        <div aria-live="polite" className="text-label-m">
          {total === undefined ? (
            <Skeleton className="h-4 w-36" />
          ) : total === 0 ? (
            'No sessions found'
          ) : (
            `Showing ${total} ${total === 1 ? 'session' : 'sessions'}`
          )}
        </div>
        <SortSelect
          sorts={options.sorts}
          value={filters.sort}
          onChange={(sort) => setFilters({ sort })}
        />
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState
            message={error.message}
            onRetry={() => void refetch()}
            retrying={isRefetching}
          />
        ) : !data ? (
          <GroupsSkeleton />
        ) : data.data.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No sessions match your filters' : 'No sessions on this date'}
            description={
              hasFilters ? 'Try another date or clear the filters.' : 'Try another date.'
            }
            action={
              hasFilters && (
                <Button variant="transparent" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div className={groupsClasses}>
            {data.data.map((group) => (
              <MovieSessions
                key={group.movie.id}
                group={group}
                onSelect={(session) => openBooking(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      {data && data.meta.lastPage > 1 && (
        <Pagination
          page={data.meta.currentPage}
          pageCount={data.meta.lastPage}
          onPageChange={setPage}
          className="mt-13 self-center"
        />
      )}
    </div>
  )
}
