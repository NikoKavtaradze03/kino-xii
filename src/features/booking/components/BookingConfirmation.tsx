import { Dialog } from 'radix-ui'
import type { Order, TicketType } from '@/shared/api/types'
import { formatDate, formatPrice } from '@/shared/lib/format'
import { Button, ButtonLink } from '@/shared/ui/Button'
import { ModalClose } from '@/shared/ui/Modal'
import { ticketSummary } from '../rules'
import { SummaryRow } from './SummaryRow'

type BookingConfirmationProps = {
  order: Order
  ticketTypes: TicketType[]
  onClose: () => void
}

/** Rendered from the `POST /orders` response, so it shows what was actually stored. */
export function BookingConfirmation({ order, ticketTypes, onClose }: BookingConfirmationProps) {
  const { session } = order
  const details = [
    session.venue.name,
    `Hall ${session.hall.name}`,
    formatDate(session.date, 'EEE d MMM'),
    session.time,
  ]

  return (
    <div className="relative flex flex-col items-center gap-6 py-6">
      <div className="absolute top-0 right-0">
        <ModalClose />
      </div>
      <div className="flex w-168.25 flex-col items-center gap-4.5">
        <div className="flex w-91.25 flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-green">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-8">
              <path
                d="M5 11l6 6L21 7"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="flex flex-col gap-2.5">
            <Dialog.Title className="text-h1">Booking confirmed!</Dialog.Title>
            <p className="text-body-m text-secondary">
              Your tickets are ready. We've sent the confirmation to your email.
            </p>
          </div>
          <p className="flex h-6.5 w-47.5 items-center justify-center rounded-full bg-raised text-label-s">
            ORDER #{order.reference}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-xl bg-card p-5">
          <div className="flex gap-2.5">
            {session.movie.posterUrl ? (
              <img
                src={session.movie.posterUrl}
                alt=""
                className="h-16 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-12 shrink-0 rounded-lg bg-raised" />
            )}
            <div className="flex flex-col gap-2">
              <p className="text-button uppercase">{session.movie.title}</p>
              <p className="text-body-s text-secondary">{details.join(' · ')}</p>
            </div>
          </div>
          <div className="h-px bg-raised" />
          <dl className="flex flex-col gap-3">
            <SummaryRow label="Seats" valueClassName="text-label-s">
              {order.tickets.map((ticket) => ticket.seatCode).join(', ')}
            </SummaryRow>
            <SummaryRow label="Tickets" valueClassName="text-body-s">
              {ticketSummary(order.tickets, ticketTypes)}
            </SummaryRow>
          </dl>
          <div className="h-px bg-raised" />
          <dl>
            <SummaryRow label="TOTAL PAID" valueClassName="text-h3">
              {formatPrice(order.totalPrice)}
            </SummaryRow>
          </dl>
        </div>
      </div>

      <div className="flex gap-3">
        <ButtonLink to="/profile?tab=tickets">View my tickets</ButtonLink>
        <Button variant="transparent" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
