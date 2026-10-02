import type { TicketType, TicketTypeSlug } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/Icon'

type SeatCardProps = {
  code: string
  /** The section (Stalls, Balcony...), the only "seat type" the API has. */
  section: string | undefined
  price: number
  ticketTypes: TicketType[]
  ticketType: TicketTypeSlug
  problem: string | null
  onTicketTypeChange: (ticketType: TicketTypeSlug) => void
  onRemove: () => void
}

export function SeatCard({
  code,
  section,
  price,
  ticketTypes,
  ticketType,
  problem,
  onTicketTypeChange,
  onRemove,
}: SeatCardProps) {
  const cheapestFirst = [...ticketTypes].sort((a, b) => a.priceRatio - b.priceRatio)

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl bg-card p-3.75',
        problem && 'ring-1 ring-red ring-inset',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-3">
          <span className="text-body-s text-secondary">{section ?? 'Seat'}</span>
          <span className="text-label-s">{code}</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="text-label-s">₾{price}</span>
          <button
            type="button"
            aria-label={`Remove seat ${code}`}
            onClick={onRemove}
            className="cursor-pointer text-primary transition-colors hover:text-secondary"
          >
            <Icon name="close" />
          </button>
        </div>
      </div>
      <div className="h-px bg-raised" />
      <div role="group" aria-label={`Ticket type for seat ${code}`} className="flex gap-2">
        {cheapestFirst.map((type) => (
          <button
            key={type.slug}
            type="button"
            aria-pressed={type.slug === ticketType}
            onClick={() => onTicketTypeChange(type.slug)}
            className={cn(
              'h-8 flex-1 cursor-pointer rounded-2xl text-body-s transition-colors duration-300 ease-out',
              type.slug === ticketType ? 'bg-red' : 'bg-raised',
            )}
          >
            {type.name} {Math.round(type.priceRatio * 100)}%
          </button>
        ))}
      </div>
      {problem && <p className="text-label-s text-red">{problem}</p>}
    </li>
  )
}
