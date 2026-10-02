import { format, parseISO, subHours } from 'date-fns'
import { useState, type ReactNode } from 'react'
import type { Order } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { RefundDialog } from './RefundDialog'

const REFUND_CUTOFF_HOURS = 2

function refundNote(order: Order) {
  if (order.status === 'refunded' && order.refundedAt)
    return `Refunded on ${format(parseISO(order.refundedAt), 'd MMM')}`
  if (!order.isUpcoming) return 'This session has ended'
  if (!order.isRefundable) return `Refunds close ${REFUND_CUTOFF_HOURS} hours before the session`
  const cutoff = subHours(parseISO(order.session.startsAt), REFUND_CUTOFF_HOURS)
  return `Refundable until ${format(cutoff, 'HH:mm, EEE d MMM')}`
}

function Overline({ children }: { children: ReactNode }) {
  return <span className="text-overline text-secondary uppercase">{children}</span>
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-overline text-secondary uppercase">{label}</dt>
      <dd className="text-label-m">{value}</dd>
    </div>
  )
}

export function TicketCard({ order }: { order: Order }) {
  const [refunding, setRefunding] = useState(false)
  const { session } = order
  const { movie } = session

  return (
    <article className="flex h-45.75 overflow-hidden rounded-[26px] bg-card">
      <div className="flex min-w-0 flex-1 items-center gap-4.5 px-7.5">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt=""
            className="h-33.25 w-25 shrink-0 rounded-[10px] object-cover"
          />
        ) : (
          <div className="h-33.25 w-25 shrink-0 rounded-[10px] bg-raised" />
        )}

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-h2">{movie.title}</h3>
            <Badge tone="red" size="2xs">
              {movie.ageRating.code}
            </Badge>
            <span className="text-body-m whitespace-nowrap text-secondary">
              {movie.runtimeMinutes} min
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <dl className="flex gap-10">
              <Meta
                label="Date"
                value={`${formatDate(session.date, 'EEE d MMM')} · ${session.time}`}
              />
              <Meta label="Venue" value={`${session.venue.name} · Hall ${session.hall.name}`} />
              <Meta label="Format" value={`${session.format.name} · ${session.language.name}`} />
            </dl>
            <div className="flex items-center gap-2">
              <Overline>Seats</Overline>
              <ul className="flex flex-wrap gap-2">
                {order.tickets.map((ticket) => (
                  <li key={ticket.id} className="rounded-md bg-tint-white px-2.5 py-1 text-label-s">
                    {ticket.seatCode} · {ticket.ticketType.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex w-75 shrink-0 flex-col gap-4 py-5 pr-6 pl-6.25">
        {/* Figma's dashed stub edge: 1px, 6px dashes with 6px gaps, which CSS `dashed` can't set. */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-px bg-[repeating-linear-gradient(to_bottom,var(--color-raised)_0_6px,transparent_6px_12px)]"
        />
        <div className="flex flex-col gap-0.5">
          <Overline>Order</Overline>
          <span className="text-label-m">#{order.reference}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-label-m text-secondary">Total paid</span>
            <span className="text-h1">₾{order.totalPrice}</span>
          </div>
          <Button
            variant="transparent"
            size="compact"
            disabled={!order.isRefundable}
            onClick={() => setRefunding(true)}
            className={cn('w-full', !order.isUpcoming && 'opacity-20')}
          >
            Refund
          </Button>
          <p className="text-body-s text-secondary">{refundNote(order)}</p>
        </div>
      </div>

      <RefundDialog order={order} open={refunding} onOpenChange={setRefunding} />
    </article>
  )
}
