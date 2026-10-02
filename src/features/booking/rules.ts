import type {
  AgeRating,
  Seat,
  SeatMap,
  Session,
  TicketType,
  TicketTypeSlug,
} from '@/shared/api/types'

export type SelectedSeat = { seatId: number; code: string; ticketType: TicketTypeSlug }

type TicketLine = { ticketType: { slug: TicketTypeSlug; name: string } }

/** My own held seats come back as `held` with `isMine`, and stay selectable. */
export const isSelectable = (seat: Seat) => seat.state === 'available' || seat.isMine

/** The session price is the adult price; other ticket types scale it by their ratio. */
export const ticketPrice = (session: Session, ticketType: TicketType) =>
  Math.round(session.price * ticketType.priceRatio * 100) / 100

/** Why this ticket type cannot be bought for a film with this rating, or null when it can. */
export function ticketTypeProblem(ticketType: TicketType, rating: AgeRating) {
  const blocked =
    ticketType.blockedFromRatingAge !== null && rating.minAge >= ticketType.blockedFromRatingAge
  return blocked ? `${ticketType.name} tickets are not available for ${rating.code} films.` : null
}

export const findTicketType = (ticketTypes: TicketType[], slug: TicketTypeSlug) =>
  ticketTypes.find((type) => type.slug === slug) ?? ticketTypes[0]

export function sectionOfSeat(seatMap: SeatMap, seatId: number) {
  return seatMap.sections.find((section) =>
    section.rows.some((row) => row.seats.some((seat) => seat.id === seatId)),
  )
}

/** "2 x Adult, 1 x Child", in the order `/filter-options` lists the ticket types. */
export function ticketSummary(lines: TicketLine[], ticketTypes: TicketType[]) {
  return ticketTypes
    .map((type) => ({
      name: type.name,
      count: lines.filter((line) => line.ticketType.slug === type.slug).length,
    }))
    .filter(({ count }) => count > 0)
    .map(({ name, count }) => `${count} x ${name}`)
    .join(', ')
}
