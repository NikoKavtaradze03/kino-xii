import { Link } from 'react-router'
import { AgeBadge } from '@/features/catalogue/components/AgeBadge'
import { MovieImage } from '@/features/catalogue/components/MovieImage'
import { moviePath } from '@/features/catalogue/lib'
import type { Session, SessionGroup } from '@/shared/api/types'
import { SessionCard } from './SessionCard'

type MovieSessionsProps = {
  group: SessionGroup
  onSelect: (session: Session) => void
}

export function MovieSessions({ group: { movie, sessions }, onSelect }: MovieSessionsProps) {
  return (
    <section aria-label={movie.title} className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4">
        {/* The title is the real link; the poster repeats it for mouse users only. */}
        <Link to={moviePath(movie)} tabIndex={-1} aria-hidden className="shrink-0">
          <MovieImage src={movie.posterUrl} className="h-20 w-14 rounded-lg" />
        </Link>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-h3">
              <Link to={moviePath(movie)}>{movie.title}</Link>
            </h2>
            <AgeBadge rating={movie.ageRating} />
          </div>
          <p className="text-body-m text-secondary">{movie.runtimeMinutes} min</p>
        </div>
      </div>

      {/* One row, clipped at the list edge as in Figma; extra sessions scroll sideways. */}
      <div className="flex [scrollbar-width:none] gap-3 overflow-x-auto">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}
