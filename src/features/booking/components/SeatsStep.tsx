import type { Dispatch, ReactNode } from 'react'
import type { SeatMap as SeatMapData, Session, TicketType } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { NoteBox } from '@/shared/ui/NoteBox'
import type { BookingAction, BookingState } from '../bookingReducer'
import { findTicketType, sectionOfSeat, ticketPrice, ticketTypeProblem } from '../rules'
import { BookingColumns } from './BookingColumns'
import { SeatCard } from './SeatCard'
import { SeatLegend, SeatMap } from './SeatMap'
import { StepPills } from './StepPills'
import { SubtotalBar } from './SubtotalBar'

type SeatsStepProps = {
  session: Session
  seatMap: SeatMapData
  ticketTypes: TicketType[]
  maxSeats: number
  state: BookingState
  dispatch: Dispatch<BookingAction>
  /** Why this account cannot book at all (incomplete profile, age rating), shown above the seats. */
  blocker: ReactNode
  holding: boolean
  onNext: () => void
}

export function SeatsStep({
  session,
  seatMap,
  ticketTypes,
  maxSeats,
  state,
  dispatch,
  blocker,
  holding,
  onNext,
}: SeatsStepProps) {
  const seats = state.seats.map((seat) => {
    const ticketType = findTicketType(ticketTypes, seat.ticketType)
    return {
      ...seat,
      section: sectionOfSeat(seatMap, seat.seatId)?.name,
      price: ticketPrice(session, ticketType),
      problem: ticketTypeProblem(ticketType, session.movie.ageRating),
    }
  })
  const subtotal = Math.round(seats.reduce((total, seat) => total + seat.price, 0) * 100) / 100
  const canContinue = !blocker && seats.length > 0 && seats.every((seat) => !seat.problem)

  return (
    <BookingColumns
      main={
        <div className="flex flex-1 flex-col gap-9.5">
          <StepPills step="seats" />
          <div className="flex flex-1 flex-col justify-center gap-8">
            <SeatMap
              seatMap={seatMap}
              selectedIds={state.seats.map((seat) => seat.seatId)}
              lostCodes={state.lost}
              onToggle={(seat) =>
                dispatch({ type: 'toggleSeat', seatId: seat.id, code: seat.code, max: maxSeats })
              }
            />
            <SeatLegend />
          </div>
        </div>
      }
      aside={
        <>
          <div className="flex flex-col gap-3">
            <h3 className="text-button">Your seats · Max {maxSeats}</h3>
            {blocker && <NoteBox>{blocker}</NoteBox>}
            {state.notice && (
              <NoteBox>
                <p role="alert" className="text-label-m">
                  {state.notice}
                </p>
              </NoteBox>
            )}
            {seats.length === 0 ? (
              <p className="text-body-s text-secondary">
                Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {seats.map((seat) => (
                  <SeatCard
                    key={seat.seatId}
                    code={seat.code}
                    section={seat.section}
                    price={seat.price}
                    ticketTypes={ticketTypes}
                    ticketType={seat.ticketType}
                    problem={seat.problem}
                    onTicketTypeChange={(ticketType) =>
                      dispatch({ type: 'setTicketType', seatId: seat.seatId, ticketType })
                    }
                    onRemove={() => dispatch({ type: 'removeSeat', seatId: seat.seatId })}
                  />
                ))}
              </ul>
            )}
          </div>
          <SubtotalBar amount={subtotal}>
            <Button disabled={!canContinue} loading={holding} onClick={onNext} className="w-full">
              Next: Checkout
            </Button>
          </SubtotalBar>
        </>
      }
    />
  )
}
