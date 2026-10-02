import type { Session } from '@/shared/api/types'
import { formatPrice } from '@/shared/lib/format'
import { Icon } from '@/shared/ui/Icon'
import { languageCode } from '../lib'

type SessionTicketProps = {
  session: Session
  disabled?: boolean
  onSelect: (session: Session) => void
}

/** Figma's ticket-shaped session tile; it sits on a `card`-coloured hall card. */
export function SessionTicket({ session, disabled, onSelect }: SessionTicketProps) {
  return (
    <button
      type="button"
      disabled={disabled || session.isSoldOut}
      onClick={() => onSelect(session)}
      className="flex h-20.25 min-w-51.75 shrink-0 cursor-pointer rounded-xl bg-page shadow-[0_1px_2px_var(--color-shadow)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex flex-1 flex-col items-center justify-center gap-2 px-2.5">
        <span className="text-h2">{session.time}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-body-s whitespace-nowrap text-secondary">
            {languageCode(session.language)}
          </span>
          <span className="rounded-full bg-card px-3 py-1 text-label-s text-[#e3e3e3b3]">
            {session.format.name}
          </span>
        </span>
      </span>

      <span className="relative flex w-20.75 shrink-0 flex-col items-center justify-center gap-2">
        {/* The notches are circles in the hall card's colour; the perforation is a 3/4 dashed line. */}
        <span className="absolute -top-1.75 -left-1.75 size-3.5 rounded-full bg-card" />
        <span className="absolute -bottom-1.75 -left-1.75 size-3.5 rounded-full bg-card" />
        <span className="absolute top-2.75 -left-[0.75px] h-14.75 w-[1.5px] bg-[repeating-linear-gradient(to_bottom,var(--color-primary)_0_3px,transparent_3px_7px)]" />

        <span className="text-h3 text-red">{formatPrice(session.price)}</span>
        {session.isSoldOut ? (
          <span className="text-body-s text-secondary">Sold out</span>
        ) : (
          <span className="flex items-center gap-1 text-body-s text-secondary">
            <Icon name="ticket" className="size-3" />
            {session.seatsLeft} left
          </span>
        )}
      </span>
    </button>
  )
}
