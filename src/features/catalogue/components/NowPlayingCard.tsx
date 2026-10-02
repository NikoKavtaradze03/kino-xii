import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import type { Movie } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/lib/format'
import { Skeleton } from '@/shared/ui/Skeleton'
import { movieQuery } from '../hooks'
import { genreAndRuntime, moviePath } from '../lib'
import { AgeBadge } from './AgeBadge'
import { MovieImage } from './MovieImage'

/** Grows on hover/focus to show the backdrop and synopsis (fetched then; list items have none). */
export function NowPlayingCard({ movie }: { movie: Movie }) {
  const [expanded, setExpanded] = useState(false)
  const detail = useQuery({ ...movieQuery(movie.slug), enabled: expanded })

  const expand = () => setExpanded(true)
  const collapse = () => setExpanded(false)

  return (
    <Link
      to={moviePath(movie)}
      onMouseEnter={expand}
      onMouseLeave={collapse}
      onFocus={expand}
      onBlur={collapse}
      className={cn(
        'flex h-113 shrink-0 flex-col justify-between overflow-hidden rounded-[20px] bg-card shadow-[0_1px_4px_var(--color-shadow)] ring-raised transition-all duration-300 ease-linear ring-inset',
        expanded ? 'w-111.75 p-3.5 ring-1' : 'w-65 p-3',
      )}
    >
      <div className={cn('flex flex-col', expanded ? 'gap-3' : 'gap-2.5')}>
        <MovieImage
          src={expanded ? (movie.backdropUrl ?? movie.posterUrl) : movie.posterUrl}
          className={cn(
            'w-full rounded-[14px] transition-[height] duration-300 ease-linear',
            expanded ? 'h-56' : 'h-75',
          )}
        />

        <div className={cn('flex flex-col', expanded ? 'gap-2' : 'gap-1.75')}>
          <div className={cn('flex flex-col', expanded ? 'gap-2' : 'gap-1.75')}>
            <h3 className={cn('truncate', expanded ? 'text-h2' : 'text-h3')}>{movie.title}</h3>
            <p className={cn('text-secondary', expanded ? 'text-body-m' : 'text-body-s')}>
              {genreAndRuntime(movie)}
            </p>
          </div>
          <div>
            <AgeBadge rating={movie.ageRating} />
          </div>
        </div>

        {expanded &&
          (detail.data ? (
            <p className="line-clamp-3 pr-5 text-body-m text-secondary">{detail.data.synopsis}</p>
          ) : (
            detail.isPending && <Skeleton className="h-13.5 w-full" />
          ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className={expanded ? 'text-button' : 'text-label-s'}>
          From {formatPrice(movie.fromPrice)}
        </span>
        {/* The whole card is the link, so this is only styled like a button. */}
        <span className="rounded-full bg-red px-5.5 py-2.5 text-button">Buy Ticket</span>
      </div>
    </Link>
  )
}
