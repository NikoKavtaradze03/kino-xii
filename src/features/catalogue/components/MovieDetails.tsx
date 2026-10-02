import { useEffect, useState } from 'react'
import { isApiError } from '@/shared/api/errors'
import { upcomingDates } from '@/shared/lib/dates'
import { ButtonLink } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useMovie } from '../hooks'
import { addRecentlyViewed } from '../recentlyViewed'
import { MovieBanner } from './MovieBanner'
import { MovieDetailsPanel } from './MovieDetailsPanel'
import { MovieShowtimes } from './MovieShowtimes'

export function MovieDetails({ slug }: { slug: string }) {
  const { data: movie, error, refetch, isRefetching } = useMovie(slug)
  const [dates] = useState(() => upcomingDates(new Date()))

  useEffect(() => {
    if (movie) addRecentlyViewed(movie)
  }, [movie])

  if (error) {
    return isApiError(error) && error.kind === 'notFound' ? (
      <EmptyState
        className="pt-header"
        title="Film not found"
        description="This film does not exist or is no longer listed."
        action={<ButtonLink to="/">Back to home</ButtonLink>}
      />
    ) : (
      <ErrorState
        className="pt-header"
        message={error.message}
        onRetry={() => void refetch()}
        retrying={isRefetching}
      />
    )
  }

  if (!movie) {
    return (
      <div aria-busy>
        <Skeleton className="h-141.75 rounded-none" />
        <div className="mt-8.5 flex gap-2.5 px-gutter pb-34">
          <Skeleton className="h-100 flex-1 rounded-[18px]" />
          <Skeleton className="h-100 w-110.25 rounded-[18px]" />
        </div>
      </div>
    )
  }

  return (
    <>
      <MovieBanner movie={movie} />
      <div className="mt-8.5 flex gap-2.5 px-gutter pb-34">
        <div className="min-w-0 flex-1 pb-6.5">
          <MovieShowtimes movie={movie} dates={dates} />
        </div>
        <MovieDetailsPanel movie={movie} />
      </div>
    </>
  )
}
