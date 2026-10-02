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

// Where the synopsis sits once expanded: 12 padding + 224 image + 10 gap + 71 title block + 10 gap.
// It is positioned there from the start, so it never moves or pushes the rest of the card.
const synopsisClasses = 'absolute top-81.75 left-3 w-105.75 animate-fade-in pr-5'

/**
 * Grows on hover/focus as in the Figma prototype: only the width, the image and the border change;
 * the synopsis (fetched then, list items have none) fades in at its final position.
 */
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
        'relative flex h-113 shrink-0 flex-col justify-between overflow-hidden rounded-[20px] bg-card p-3 shadow-[0_1px_4px_var(--color-shadow)] ring-raised transition-[width] duration-300 ease-linear ring-inset',
        expanded ? 'w-111.75 ring-1' : 'w-65',
      )}
    >
      <div className="flex flex-col gap-2.5">
        <MovieImage
          src={expanded ? (movie.backdropUrl ?? movie.posterUrl) : movie.posterUrl}
          className={cn(
            'w-full rounded-[14px] transition-[height] duration-300 ease-linear',
            expanded ? 'h-56' : 'h-75',
          )}
        />

        {/* Expanded, the text takes its final width at once, so the growing card reveals it
            instead of re-truncating it every frame. */}
        <div className="flex flex-col gap-1.75">
          <h3 className={cn('truncate text-h3', expanded && 'w-105.75')}>{movie.title}</h3>
          <p className={cn('truncate text-body-s text-secondary', expanded && 'w-105.75')}>
            {genreAndRuntime(movie)}
          </p>
          <div>
            <AgeBadge rating={movie.ageRating} />
          </div>
        </div>
      </div>

      {expanded &&
        (detail.data ? (
          <p className={cn(synopsisClasses, 'line-clamp-3 text-body-m text-secondary')}>
            {detail.data.synopsis}
          </p>
        ) : (
          detail.isPending && (
            <div className={synopsisClasses}>
              <Skeleton className="h-13.5" />
            </div>
          )
        ))}

      <div className="flex items-center justify-between gap-3">
        <span className="text-label-s">From {formatPrice(movie.fromPrice)}</span>
        {/* The whole card is the link, so this is only styled like a button. */}
        <span className="rounded-full bg-red px-5.5 py-2.5 text-button">Buy Ticket</span>
      </div>
    </Link>
  )
}
