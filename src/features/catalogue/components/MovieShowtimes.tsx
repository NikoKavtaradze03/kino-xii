import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import { useCurrentUser } from '@/features/auth/hooks'
import { useOpenBooking } from '@/features/booking/hooks'
import type { MovieDetail, Session, VenueSessions } from '@/shared/api/types'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { NoteBox } from '@/shared/ui/NoteBox'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useMovieSessions } from '../hooks'
import { DayPicker } from './DayPicker'
import { SessionTicket } from './SessionTicket'

type MovieShowtimesProps = {
  movie: MovieDetail
  dates: string[]
}

/** The API groups by venue; Figma also groups each venue's sessions by hall. */
function byHall(sessions: Session[]) {
  const halls = new Map<number, Session[]>()
  for (const session of sessions) {
    halls.set(session.hall.id, [...(halls.get(session.hall.id) ?? []), session])
  }
  return [...halls.values()]
}

function VenueShowtimes({
  group,
  disabled,
  onSelect,
}: {
  group: VenueSessions
  disabled: boolean
  onSelect: (session: Session) => void
}) {
  return (
    <section aria-label={group.venue.name} className="flex flex-col gap-3">
      <h3 className="text-button">{group.venue.name}</h3>
      <div className="flex flex-wrap gap-2.5">
        {byHall(group.sessions).map((sessions) => (
          <div
            key={sessions[0].hall.id}
            className="flex flex-col gap-2.25 rounded-[18px] bg-card p-3.75"
          >
            <h4 className="text-label-s">Hall {sessions[0].hall.name}</h4>
            <div className="flex flex-wrap gap-2.25">
              {sessions.map((session) => (
                <SessionTicket
                  key={session.id}
                  session={session}
                  disabled={disabled}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function MovieShowtimes({ movie, dates }: MovieShowtimesProps) {
  const [selected, setSelected] = useState(
    () => dates.find((date) => movie.availableDates.includes(date)) ?? dates[0],
  )
  const days = useMovieSessions(movie, dates)
  const day = days[dates.indexOf(selected)]
  const { user } = useCurrentUser()
  const openBooking = useOpenBooking()

  // Guests can still click; the age is checked once they have logged in.
  const tooYoung = user?.age != null && user.age < movie.ageRating.minAge
  const weekLoading = days.some((query) => query.isPending && query.isEnabled)
  const weekFailed = days.some((query) => query.error)
  const weekTotal = days
    .flatMap((query) => query.data ?? [])
    .reduce((total, group) => total + group.sessions.length, 0)

  return (
    <section className="flex flex-col gap-6.75">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.75">
          <h2 className="text-h2">Sessions</h2>
          {weekLoading ? (
            <Skeleton className="h-4 w-52" />
          ) : (
            !weekFailed && (
              <p className="text-body-s text-secondary">
                {weekTotal} {weekTotal === 1 ? 'session' : 'sessions'} over the next seven days
              </p>
            )
          )}
        </div>
        <DayPicker
          dates={dates}
          selected={selected}
          availableDates={movie.availableDates}
          onSelect={setSelected}
        />
      </div>

      {tooYoung && (
        <NoteBox>
          <p className="text-label-m">
            This film is rated {movie.ageRating.code}. You cannot buy tickets for it with this
            account.
          </p>
        </NoteBox>
      )}

      {day.error ? (
        <ErrorState
          message={day.error.message}
          onRetry={() => void day.refetch()}
          retrying={day.isRefetching}
        />
      ) : day.isPending && day.isEnabled ? (
        <div className="flex gap-2.5">
          <Skeleton className="h-40 w-113.5 rounded-[18px]" />
          <Skeleton className="h-40 w-113.5 rounded-[18px]" />
        </div>
      ) : !day.data?.length ? (
        <EmptyState
          title={`No sessions on ${format(parseISO(selected), 'EEEE d MMMM')}`}
          description={
            movie.availableDates.length > 0 ? 'Pick another day.' : 'This film has no sessions yet.'
          }
        />
      ) : (
        day.data.map((group) => (
          <VenueShowtimes
            key={group.venue.id}
            group={group}
            disabled={tooYoung}
            onSelect={(session) => openBooking(session.id)}
          />
        ))
      )}
    </section>
  )
}
