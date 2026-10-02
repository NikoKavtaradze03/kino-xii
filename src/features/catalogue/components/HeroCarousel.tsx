import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'
import type { Movie } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { ButtonLink } from '@/shared/ui/Button'
import { Icon } from '@/shared/ui/Icon'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/ErrorState'
import { movieQuery, useFeaturedMovies } from '../hooks'
import { moviePath } from '../lib'
import { AgeBadge } from './AgeBadge'
import { MovieImage } from './MovieImage'

type HeroSlideProps = {
  movie: Movie
  synopsis: string | undefined
  synopsisLoading: boolean
  active: boolean
}

function HeroSlide({ movie, synopsis, synopsisLoading, active }: HeroSlideProps) {
  return (
    <div
      inert={!active}
      className={cn(
        'absolute inset-0 transition-opacity duration-300 ease-out',
        active ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/* Slow zoom while the slide is shown (`starting:` makes the first one zoom from the start
          too); it resets only after the 300ms fade-out. Framed ~30% from the top, as Figma crops it. */}
      <MovieImage
        src={movie.backdropUrl ?? movie.posterUrl}
        className={cn(
          'size-full object-[50%_30%] transition-transform ease-linear motion-reduce:transition-none',
          active
            ? 'scale-110 duration-[12000ms] motion-reduce:scale-100 starting:scale-100'
            : 'scale-100 delay-300 duration-0',
        )}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/80 to-black/8" />

      <div className="absolute top-81.25 left-16.75 flex w-145 flex-col gap-3.75">
        <div>
          <Badge tone="red" className="uppercase">
            Premiere · Week of {formatDate(movie.releaseDate, 'd MMM')}
          </Badge>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3.75">
            <h2 className="text-display uppercase">{movie.title}</h2>
            <div className="flex flex-wrap gap-2">
              <AgeBadge rating={movie.ageRating} size="lg" />
              <Badge size="lg" icon="timer">
                {movie.runtimeMinutes} Min
              </Badge>
              {movie.formats.map((format) => (
                <Badge key={format.id} size="lg">
                  {format.name}
                </Badge>
              ))}
            </div>
            {synopsis ? (
              <p className="w-140 text-body-m">{synopsis}</p>
            ) : (
              synopsisLoading && <Skeleton className="h-13.5 w-140" />
            )}
          </div>

          <div className="flex gap-2.5">
            <ButtonLink to={moviePath(movie)} icon="ticket">
              Buy tickets
            </ButtonLink>
            <ButtonLink to="/sessions" variant="transparent">
              All sessions
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}

const roundButtonClasses =
  'grid size-13.5 cursor-pointer place-items-center rounded-full bg-page/20 transition-[background-color,box-shadow] duration-300 ease-out hover:bg-page hover:shadow-[0_2px_8px_var(--color-shadow)]'

/**
 * Featured films crossfade every 6 s. The red progress bar's CSS animation is the timer: it pauses
 * while keyboard focus is inside the hero (so it can be read and operated), and is off for users who
 * prefer reduced motion.
 */
function HeroCarousel({ movies }: { movies: Movie[] }) {
  const [active, setActive] = useState(0)
  // List items carry no synopsis, so each featured film's details are fetched (and cached for its page).
  const details = useQueries({ queries: movies.map((movie) => movieQuery(movie.slug)) })

  const show = (index: number) => setActive((index + movies.length) % movies.length)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured films"
      className="group/hero relative h-190 overflow-hidden"
    >
      {movies.map((movie, index) => (
        <HeroSlide
          key={movie.id}
          movie={movie}
          synopsis={details[index].data?.synopsis}
          synopsisLoading={details[index].isPending}
          active={index === active}
        />
      ))}

      <div className="absolute inset-x-16.75 bottom-10.5 flex items-center gap-5">
        <div className="flex flex-1 gap-1.75">
          {movies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              aria-label={`Show ${movie.title}`}
              aria-current={index === active}
              onClick={() => show(index)}
              className="flex-1 cursor-pointer py-2"
            >
              <span className="relative block h-0.75 overflow-hidden rounded-full bg-primary">
                {index === active && (
                  <span
                    onAnimationEnd={() => show(active + 1)}
                    className="absolute inset-0 origin-left animate-progress rounded-full bg-red group-has-focus-visible/hero:[animation-play-state:paused] motion-reduce:animate-none"
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            aria-label="Previous film"
            onClick={() => show(active - 1)}
            className={roundButtonClasses}
          >
            <Icon name="chevron-left" className="size-8.5" />
          </button>
          <button
            type="button"
            aria-label="Next film"
            onClick={() => show(active + 1)}
            className={roundButtonClasses}
          >
            <Icon name="chevron-left" className="size-8.5 rotate-180" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function FeaturedHero() {
  const { data, error, refetch, isRefetching } = useFeaturedMovies()

  if (data?.length) return <HeroCarousel movies={data} />
  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => void refetch()}
        retrying={isRefetching}
        className="h-190 justify-center"
      />
    )
  }
  if (data) return <div className="h-header" />
  return <Skeleton className="h-190 rounded-none" />
}
