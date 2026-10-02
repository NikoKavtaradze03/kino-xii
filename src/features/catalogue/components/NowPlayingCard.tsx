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

// Expanded text is laid out at the final width (447 − 2×12 padding) right away, so the growing card
// reveals it instead of re-truncating it every frame; its font size grows along with the card.
const textGrowClasses = 'truncate transition-[font-size,line-height] duration-300 ease-linear'

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
        'flex h-113 shrink-0 flex-col justify-between overflow-hidden rounded-[20px] bg-card p-3 shadow-[0_1px_4px_var(--color-shadow)] ring-raised transition-[width] duration-300 ease-linear ring-inset',
        expanded ? 'w-111.75 ring-1' : 'w-65',
      )}
    >
      {/* min-h-0 lets this part shrink and clip while the poster is still shrinking, so the
          price row stays put at the bottom instead of being pushed down. */}
      <div className={cn('flex min-h-0 flex-col overflow-hidden', expanded ? 'gap-3' : 'gap-2.5')}>
        <MovieImage
          src={expanded ? (movie.backdropUrl ?? movie.posterUrl) : movie.posterUrl}
          className={cn(
            'w-full rounded-[14px] transition-[height] duration-300 ease-linear',
            expanded ? 'h-56' : 'h-75',
          )}
        />

        <div className={cn('flex flex-col', expanded ? 'gap-2' : 'gap-1.75')}>
          <div className={cn('flex flex-col', expanded ? 'gap-2' : 'gap-1.75')}>
            <h3 className={cn(textGrowClasses, expanded ? 'w-105.75 text-h2' : 'text-h3')}>
              {movie.title}
            </h3>
            <p
              className={cn(
                textGrowClasses,
                'text-secondary',
                expanded ? 'w-105.75 text-body-m' : 'text-body-s',
              )}
            >
              {genreAndRuntime(movie)}
            </p>
          </div>
          <div>
            <AgeBadge rating={movie.ageRating} />
          </div>
        </div>

        {/* Laid out at the expanded width from the start and faded in while the card grows,
            so the text never reflows during the animation. */}
        {expanded &&
          (detail.data ? (
            <p className="line-clamp-3 w-105.75 animate-fade-in-late pr-5 text-body-m text-secondary">
              {detail.data.synopsis}
            </p>
          ) : (
            detail.isPending && (
              <div className="animate-fade-in-late">
                <Skeleton className="h-13.5 w-105.75" />
              </div>
            )
          ))}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3">
        <span className="text-label-s">From {formatPrice(movie.fromPrice)}</span>
        {/* The whole card is the link, so this is only styled like a button. */}
        <span className="rounded-full bg-red px-5.5 py-2.5 text-button">Buy Ticket</span>
      </div>
    </Link>
  )
}
