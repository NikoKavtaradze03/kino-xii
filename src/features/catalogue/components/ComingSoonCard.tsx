import { Link } from 'react-router'
import type { Movie } from '@/shared/api/types'
import { formatReleaseDate } from '@/shared/lib/format'
import { genreAndRuntime, moviePath } from '../lib'
import { AgeBadge } from './AgeBadge'
import { MovieImage } from './MovieImage'
import { NotifyButton } from './NotifyButton'

export function ComingSoonCard({ movie }: { movie: Movie }) {
  return (
    // The title link is stretched over the card (after:inset-0); the Notify button sits above it.
    <article className="relative flex h-40 w-117.5 shrink-0 items-center gap-3.75 rounded-[20px] bg-card p-3 shadow-[0_1px_4px_var(--color-shadow)] ring-raised transition-shadow ring-inset hover:shadow-[0_4px_24px_var(--color-shadow)] hover:ring-1">
      <MovieImage
        src={movie.backdropUrl ?? movie.posterUrl}
        className="h-34 w-57.25 shrink-0 rounded-[14px]"
      />

      <div className="flex h-33 min-w-0 flex-col justify-between">
        <div className="flex flex-col gap-1.75">
          <p className="text-label-s text-red uppercase">
            In cinemas {formatReleaseDate(movie.releaseDate)}
          </p>
          <div className="flex flex-col gap-1.75">
            <h3 className="truncate text-label-s">
              <Link to={moviePath(movie)} className="after:absolute after:inset-0">
                {movie.title}
              </Link>
            </h3>
            <p className="text-body-s text-secondary">{genreAndRuntime(movie)}</p>
          </div>
          <div>
            <AgeBadge rating={movie.ageRating} />
          </div>
        </div>

        <NotifyButton movie={movie} className="relative z-10 self-start" />
      </div>
    </article>
  )
}
