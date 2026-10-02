import { AgeBadge } from '@/features/catalogue/components/AgeBadge'
import { MovieImage } from '@/features/catalogue/components/MovieImage'
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
        <MovieImage src={movie.posterUrl} className="h-20 w-14 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-h3">{movie.title}</h2>
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
