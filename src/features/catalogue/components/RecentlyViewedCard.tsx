import { Link } from 'react-router'
import type { Movie } from '@/shared/api/types'
import { genreAndRuntime, moviePath } from '../lib'
import { AgeBadge } from './AgeBadge'
import { MovieImage } from './MovieImage'

export function RecentlyViewedCard({ movie }: { movie: Movie }) {
  return (
    <Link
      to={moviePath(movie)}
      className="flex h-21.75 w-82.25 shrink-0 items-center gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-transparent transition-shadow duration-300 ease-out ring-inset hover:shadow-[0_4px_24px_var(--color-shadow)] hover:ring-raised"
    >
      <MovieImage src={movie.posterUrl} className="h-16.75 w-21.75 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-button uppercase">{movie.title}</h3>
        <p className="text-body-s text-secondary">{genreAndRuntime(movie)}</p>
        <div>
          <AgeBadge rating={movie.ageRating} />
        </div>
      </div>
    </Link>
  )
}
