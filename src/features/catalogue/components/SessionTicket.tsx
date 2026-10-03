import type { Session } from '@/shared/api/types'
import { hasSessionStarted, useCinemaNow } from '@/shared/lib/cinemaClock'
import { formatPrice } from '@/shared/lib/format'
import { Icon } from '@/shared/ui/Icon'

type SessionTicketProps = {
  session: Session
  disabled?: boolean
  onSelect: (session: Session) => void
}

/**
 * Figma's ticket-shaped session tile (207×81); it sits on a `card`-coloured hall card. Figma puts the
 * language code beside the format badge, where a PANORAMA badge does not fit, so it sits under the
 * seat count instead and every tile keeps Figma's size.
 */
export function SessionTicket({ session, disabled, onSelect }: SessionTicketProps) {
  const started = hasSessionStarted(session, useCinemaNow())
  const closed = started ? 'Started' : session.isSoldOut ? 'Sold out' : null

  return (
    <button
      type="button"
      disabled={disabled || closed !== null}
      onClick={() => onSelect(session)}
      className="flex h-20.25 w-51.75 shrink-0 cursor-pointer rounded-xl bg-page shadow-[0_1px_2px_var(--color-shadow)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex flex-1 flex-col items-center justify-center gap-2">
        <span className="text-h2">{session.time}</span>
        <span className="rounded-full bg-card px-3 py-1 text-label-s text-[#e3e3e3b3]">
          {session.format.name}
        </span>
      </span>

      <span className="relative flex w-20.75 shrink-0 flex-col items-center justify-center gap-2">
        {/* The notches are circles in the hall card's colour; the perforation is a 3/4 dashed line. */}
        <span className="absolute -top-1.75 -left-1.75 size-3.5 rounded-full bg-card" />
        <span className="absolute -bottom-1.75 -left-1.75 size-3.5 rounded-full bg-card" />
        <span className="absolute top-2.75 left-[-0.75px] h-14.75 w-[1.5px] bg-[repeating-linear-gradient(to_bottom,var(--color-primary)_0_3px,transparent_3px_7px)]" />

        <span className="text-h3 text-red">{formatPrice(session.price)}</span>
        {closed ? (
          <span className="text-body-s text-secondary">{closed}</span>
        ) : (
          <span className="flex items-center gap-1 text-body-s text-secondary">
            <Icon name="ticket" className="size-3" />
            {session.seatsLeft} left
          </span>
        )}
        <span className="text-body-s whitespace-nowrap text-secondary">
          {session.language.code}
        </span>
      </span>
    </button>
  )
}
