import { Dialog } from 'radix-ui'
import type { SeatHold, Session } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { useSecondsLeft } from '@/shared/lib/useSecondsLeft'
import { ModalClose } from '@/shared/ui/Modal'

function HoldTimer({ expiresAt }: { expiresAt: string }) {
  const seconds = useSecondsLeft(expiresAt)
  const minutes = Math.floor(seconds / 60)

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-card px-3.5 py-2">
      <span className="text-label-s text-secondary">SEATS HELD</span>
      <span role="timer" className="text-button">
        {minutes}:{String(seconds % 60).padStart(2, '0')}
      </span>
    </div>
  )
}

type BookingHeaderProps = {
  session: Session
  hold: SeatHold | null
}

export function BookingHeader({ session, hold }: BookingHeaderProps) {
  const details = [
    session.venue.name,
    `Hall ${session.hall.name}`,
    formatDate(session.date, 'EEEE d MMMM'),
    session.time,
    session.format.name,
    session.language.name,
  ]

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-1 flex-col gap-2">
        <Dialog.Title className="text-h2 uppercase">{session.movie.title}</Dialog.Title>
        <p className="text-body-s text-secondary">{details.join(' · ')}</p>
      </div>
      {hold && <HoldTimer key={hold.holdId} expiresAt={hold.expiresAt} />}
      <ModalClose />
    </div>
  )
}
