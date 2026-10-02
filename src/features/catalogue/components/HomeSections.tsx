import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useCurrentUser } from '@/features/auth/hooks'
import type { Movie } from '@/shared/api/types'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useComingSoon, useNowPlaying } from '../hooks'
import { useRecentlyViewed } from '../recentlyViewed'
import { ComingSoonCard } from './ComingSoonCard'
import { MovieSection } from './MovieSection'
import { NowPlayingCard } from './NowPlayingCard'
import { RecentlyViewedCard } from './RecentlyViewedCard'

const NOW_PLAYING_LIMIT = 10
const SKELETON_COUNT = 6

type RowContentProps = {
  query: UseQueryResult<Movie[]>
  emptyTitle: string
  skeletonClassName: string
  renderCard: (movie: Movie) => ReactNode
}

/** The loading, error and empty states every movie row shares. */
function RowContent({ query, emptyTitle, skeletonClassName, renderCard }: RowContentProps) {
  const { data, error, refetch, isRefetching } = query

  if (data) {
    return data.length ? data.map(renderCard) : <EmptyState title={emptyTitle} className="w-full" />
  }
  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => void refetch()}
        retrying={isRefetching}
        className="w-full"
      />
    )
  }
  return Array.from({ length: SKELETON_COUNT }, (_, index) => (
    <Skeleton key={index} className={`shrink-0 ${skeletonClassName}`} />
  ))
}

// Both rows' "See all" go to the sessions page, as wired in Figma.
const seeAllLink = (
  <Link to="/sessions" className="text-label-m text-red hover:underline">
    See all
  </Link>
)

export function NowPlayingSection() {
  const query = useNowPlaying(NOW_PLAYING_LIMIT)

  return (
    <MovieSection
      title="Now playing"
      uppercase
      innerShadow
      action={seeAllLink}
      rowClassName="gap-4.25"
    >
      <RowContent
        query={query}
        emptyTitle="Nothing is showing right now"
        skeletonClassName="h-113 w-65 rounded-[20px]"
        renderCard={(movie) => <NowPlayingCard key={movie.id} movie={movie} />}
      />
    </MovieSection>
  )
}

export function ComingSoonSection() {
  const query = useComingSoon()

  return (
    <MovieSection title="Coming soon..." uppercase action={seeAllLink} rowClassName="gap-5">
      <RowContent
        query={query}
        emptyTitle="No upcoming films announced yet"
        skeletonClassName="h-40 w-117.5 rounded-[20px]"
        renderCard={(movie) => <ComingSoonCard key={movie.id} movie={movie} />}
      />
    </MovieSection>
  )
}

/** Figma draws this row only on the signed-in home page. */
export function RecentlyViewedSection() {
  const { user } = useCurrentUser()
  const movies = useRecentlyViewed()
  if (!user || !movies.length) return null

  return (
    <MovieSection title="Recently viewed" compact rowClassName="gap-5">
      {movies.map((movie) => (
        <RecentlyViewedCard key={movie.id} movie={movie} />
      ))}
    </MovieSection>
  )
}
