import type { Session } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/Icon'

/** Figma colours 1, 3 and 5 seats red and 12 or more green. */
const LOW_SEATS = 5

type SessionCardProps = {
  session: Session
  onSelect: (session: Session) => void
}

export function SessionCard({ session, onSelect }: SessionCardProps) {
  return (
    <button
      type="button"
      disabled={session.isSoldOut}
      onClick={() => onSelect(session)}
      className="flex w-63 shrink-0 cursor-pointer flex-col gap-3 rounded-2xl bg-card p-3.75 text-left disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex w-full items-center justify-between">
        <span className="text-h3">{session.time}</span>
        <span className="rounded-full bg-raised px-2.5 py-1.25 text-label-s">
          {session.format.name}
        </span>
      </span>

      <span className="flex w-full gap-2">
        <span className="flex min-w-0 flex-1 flex-col gap-2.5">
          <span className="text-body-s text-secondary">{session.language.name}</span>
          <span className="truncate text-label-s">
            {session.venue.name} · Hall {session.hall.name}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-2.5">
          {session.isSoldOut ? (
            <span className="flex h-3.25 items-center text-body-s text-secondary">Sold out</span>
          ) : (
            <span
              className={cn(
                'flex h-3.25 items-center gap-1 text-body-s',
                session.seatsLeft <= LOW_SEATS ? 'text-red' : 'text-green',
              )}
            >
              <Icon name="ticket" className="size-3" />
              {session.seatsLeft} left
            </span>
          )}
          <span className="text-button">₾{session.price}</span>
        </span>
      </span>
    </button>
  )
}
