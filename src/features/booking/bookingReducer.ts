import type { Order, SeatHold, TicketTypeSlug } from '@/shared/api/types'
import type { SelectedSeat } from './rules'

export type BookingStep = 'seats' | 'checkout' | 'confirmed'

export type BookingState = {
  step: BookingStep
  seats: SelectedSeat[]
  hold: SeatHold | null
  order: Order | null
  /** Seat codes another user took (409); drawn as sold even before the map is refetched. */
  lost: string[]
  notice: string | null
}

export type BookingAction =
  | { type: 'toggleSeat'; seatId: number; code: string; max: number }
  | { type: 'setTicketType'; seatId: number; ticketType: TicketTypeSlug }
  | { type: 'removeSeat'; seatId: number }
  | { type: 'held'; hold: SeatHold }
  | { type: 'back' }
  | { type: 'lost'; codes: string[] }
  | { type: 'expired' }
  | { type: 'rejected'; message: string }
  | { type: 'paid'; order: Order }

export const EXPIRED_MESSAGE = 'Your hold time expired. Please re-select your seats.'

export const initialBookingState: BookingState = {
  step: 'seats',
  seats: [],
  hold: null,
  order: null,
  lost: [],
  notice: null,
}

const seatsFromHold = (hold: SeatHold): SelectedSeat[] =>
  hold.seats.map((seat) => ({
    seatId: seat.seatId,
    code: seat.code,
    ticketType: seat.ticketType.slug,
  }))

function lostMessage(codes: string[]) {
  return codes.length === 1
    ? `Seat ${codes[0]} was just taken by someone else.`
    : `Seats ${codes.join(', ')} were just taken by someone else.`
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'toggleSeat': {
      if (state.seats.some((seat) => seat.seatId === action.seatId)) {
        return {
          ...state,
          seats: state.seats.filter((seat) => seat.seatId !== action.seatId),
          notice: null,
        }
      }
      if (state.seats.length >= action.max) {
        return { ...state, notice: `You can choose up to ${action.max} seats per order.` }
      }
      const seat: SelectedSeat = { seatId: action.seatId, code: action.code, ticketType: 'adult' }
      return { ...state, seats: [...state.seats, seat], notice: null }
    }
    case 'setTicketType':
      return {
        ...state,
        seats: state.seats.map((seat) =>
          seat.seatId === action.seatId ? { ...seat, ticketType: action.ticketType } : seat,
        ),
      }
    case 'removeSeat':
      return {
        ...state,
        seats: state.seats.filter((seat) => seat.seatId !== action.seatId),
        notice: null,
      }
    case 'held':
      return {
        ...state,
        step: 'checkout',
        hold: action.hold,
        seats: seatsFromHold(action.hold),
        notice: null,
      }
    case 'back':
      return { ...state, step: 'seats', notice: null }
    case 'lost':
      return {
        ...state,
        step: 'seats',
        seats: state.seats.filter((seat) => !action.codes.includes(seat.code)),
        lost: [...state.lost, ...action.codes],
        notice: lostMessage(action.codes),
      }
    case 'expired':
      return { ...state, step: 'seats', seats: [], hold: null, notice: EXPIRED_MESSAGE }
    case 'rejected':
      return { ...state, notice: action.message }
    case 'paid':
      return { ...state, step: 'confirmed', order: action.order, notice: null }
  }
}
