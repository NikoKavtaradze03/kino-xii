import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { moviePath } from '@/features/catalogue/lib'
import type { Movie } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { ButtonLink } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Icon } from '@/shared/ui/Icon'
import { Skeleton } from '@/shared/ui/Skeleton'
import { optionId } from '../lib'

type SearchPanelProps = {
  /** What the user typed (trimmed); empty shows the prompt. */
  query: string
  /** The query the shown results belong to (it lags behind while typing). */
  resultsQuery: string
  results: Movie[] | undefined
  error: Error | null
  onRetry: () => void
  active: number
  onActiveChange: (index: number) => void
  onNavigate: () => void
}

function Message({
  icon,
  title,
  description,
  onNavigate,
}: {
  icon: ReactNode
  title: string
  description: string
  onNavigate: () => void
}) {
  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-7 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-tint-white">
        {icon}
      </span>
      <p className="mt-5 text-label-m">{title}</p>
      <p className="mt-1.5 text-body-m text-secondary">{description}</p>
      <ButtonLink variant="transparent" to="/sessions" onClick={onNavigate} className="mt-5.5">
        Browse all sessions
      </ButtonLink>
    </div>
  )
}

/** The title with every occurrence of the query in white and the rest in grey, as in Figma. */
function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = title.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <p className="truncate text-label-m text-secondary">
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-primary">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  )
}

function ResultRow({
  movie,
  query,
  isActive,
  onHover,
  onNavigate,
}: {
  movie: Movie
  query: string
  isActive: boolean
  onHover: () => void
  onNavigate: () => void
}) {
  return (
    <Link
      to={moviePath(movie)}
      id={optionId(movie)}
      role="option"
      aria-selected={isActive}
      tabIndex={-1}
      onMouseEnter={onHover}
      onClick={onNavigate}
      className={cn(
        'flex h-18 items-center gap-3.5 rounded-[10px] py-2 pr-5 pl-2.5',
        isActive && 'bg-tint-white',
      )}
    >
      <img
        src={movie.posterUrl ?? undefined}
        alt=""
        className="h-14 w-10 shrink-0 rounded-md bg-raised object-cover"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.75">
        <HighlightedTitle title={movie.title} query={query} />
        <span className="text-body-s text-secondary">
          {movie.kind === 'film' ? 'Film' : 'Event'} · {movie.ageRating.code} ·{' '}
          {movie.runtimeMinutes} min
        </span>
      </span>
      {movie.isComingSoon ? (
        <span className="shrink-0 text-label-m text-orange">Coming Soon</span>
      ) : (
        <span className="shrink-0 text-label-m">from ₾{movie.fromPrice}</span>
      )}
    </Link>
  )
}

/** A result row's poster, title, meta line and price in grey. */
function ResultRowSkeleton() {
  return (
    <div className="flex h-18 items-center gap-3.5 py-2 pr-5 pl-2.5">
      <Skeleton className="h-14 w-10 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-44 rounded" />
        <Skeleton className="h-2.5 w-28 rounded" />
      </div>
      <Skeleton className="h-3 w-14 rounded" />
    </div>
  )
}

export function SearchPanel({
  query,
  resultsQuery,
  results,
  error,
  onRetry,
  active,
  onActiveChange,
  onNavigate,
}: SearchPanelProps) {
  let content: ReactNode
  if (!query) {
    content = (
      <Message
        icon={<Icon name="popcorn" className="size-6" />}
        title="What do you want to watch?"
        description="Search by title"
        onNavigate={onNavigate}
      />
    )
  } else if (error) {
    content = <ErrorState message={error.message} onRetry={onRetry} className="py-8" />
  } else if (!results) {
    content = (
      <div aria-busy className="flex flex-col gap-0.5 pt-7.5">
        {Array.from({ length: 3 }, (_, i) => (
          <ResultRowSkeleton key={i} />
        ))}
      </div>
    )
  } else if (results.length === 0) {
    content = (
      <Message
        icon={<Icon name="search" strokeWidth={0.875} className="size-[22.86px]" />}
        title={`No results for “${resultsQuery}”`}
        description="Check the spelling or try another film or live event."
        onNavigate={onNavigate}
      />
    )
  } else {
    content = (
      <>
        <div className="flex justify-between px-2.5 pt-2 pb-1.5">
          <p className="text-overline text-secondary uppercase">Films &amp; events</p>
          <p className="text-body-s text-secondary">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
        </div>
        <div
          role="listbox"
          id="search-results"
          aria-label="Search results"
          className="flex flex-col gap-0.5"
        >
          {results.map((movie, i) => (
            <ResultRow
              key={movie.id}
              movie={movie}
              query={resultsQuery}
              isActive={i === active}
              onHover={() => onActiveChange(i)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="absolute top-full right-0 mt-1.25 w-120 rounded-2xl border border-raised bg-page p-2 shadow-[0_20px_48px_-8px_var(--color-shadow),0_2px_6px_var(--color-shadow)] transition-opacity duration-300 ease-out motion-reduce:transition-none starting:opacity-0">
      {content}
    </div>
  )
}
