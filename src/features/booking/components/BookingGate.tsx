import { Dialog } from 'radix-ui'
import { useEffect, useEffectEvent, useReducer, useRef, useState, type ReactNode } from 'react'
import { requestLogin, useCurrentUser } from '@/features/auth/hooks'
import { isApiError } from '@/shared/api/errors'
import { useFilterOptions } from '@/shared/api/filterOptions'
import type { FilterOptions, SeatHold, SeatMap, Session, User } from '@/shared/api/types'
import { hasSessionStarted, useCinemaNow } from '@/shared/lib/cinemaClock'
import { ButtonLink } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { ModalClose, ModalFrame } from '@/shared/ui/Modal'
import { bookingReducer, initialBookingState, type BookingState } from '../bookingReducer'
import { holdStorage } from '../holdStorage'
import {
  useBookingSession,
  useCreateOrder,
  useHoldExpiry,
  useHoldSeats,
  useReleaseHold,
  useSeatMap,
  useStoredHold,
} from '../hooks'
import type { CheckoutValues } from '../schemas'
import { BookingConfirmation } from './BookingConfirmation'
import { BookingHeader } from './BookingHeader'
import { BookingSkeleton } from './BookingSkeleton'
import { CheckoutStep } from './CheckoutStep'
import { SeatsStep } from './SeatsStep'

function BookingFrame({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <ModalFrame open onOpenChange={(open) => !open && onClose()} className="w-286.5 gap-8 p-8">
      {children}
    </ModalFrame>
  )
}

/** An error before there is a session to put in the header. */
function BookingError({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <BookingFrame onClose={onClose}>
      <div className="flex justify-between">
        <Dialog.Title className="text-h2">Book tickets</Dialog.Title>
        <ModalClose />
      </div>
      <div className="flex min-h-80 items-center justify-center">{children}</div>
    </BookingFrame>
  )
}

/** A guest (e.g. from a shared link) logs in first. */
export function BookingGate({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const { status, user, retry, isRetrying } = useCurrentUser()
  // A 401 in the middle of booking signs the user out until they log in again. The flow stays
  // mounted behind the login modal, so the replayed request still has a flow to return to.
  const [lastUser, setLastUser] = useState(user)
  if (user && user !== lastUser) setLastUser(user)
  const flowUser = user ?? lastUser
  const closeIfDeclined = useEffectEvent((signedIn: boolean) => {
    if (!signedIn) onClose()
  })

  useEffect(() => {
    if (status === 'guest') void requestLogin().then(closeIfDeclined)
  }, [status])

  // Keyed by user: a different account logging in starts a new flow.
  if (flowUser) {
    return <BookingFlow key={flowUser.id} sessionId={sessionId} user={flowUser} onClose={onClose} />
  }
  if (status === 'guest') return null

  if (status === 'error') {
    return (
      <BookingError onClose={onClose}>
        <ErrorState
          message="We couldn't load your account. Please try again."
          onRetry={retry}
          retrying={isRetrying}
        />
      </BookingError>
    )
  }

  return (
    <BookingFrame onClose={onClose}>
      <BookingSkeleton />
    </BookingFrame>
  )
}

type BookingFlowProps = { sessionId: number; user: User; onClose: () => void }

function BookingFlow({ sessionId, user, onClose }: BookingFlowProps) {
  const session = useBookingSession(sessionId)
  const seatMap = useSeatMap(sessionId)
  const storedHold = useStoredHold(sessionId)
  const options = useFilterOptions()
  // Decided once: the hold query runs again after a new login, which must not restart the flow.
  const [initialHold, setInitialHold] = useState<SeatHold | null>()
  const restoring = initialHold === undefined
  if (restoring && !storedHold.isLoading && !storedHold.error) {
    setInitialHold(storedHold.data ?? null)
  }

  // A stored hold that could not be fetched may still be live, so it is an error, not "no hold".
  const failed = [session, seatMap, options, ...(restoring ? [storedHold] : [])].find(
    (query) => query.error,
  )
  if (failed?.error) {
    return (
      <BookingError onClose={onClose}>
        <ErrorState
          message={failed.error.message}
          onRetry={() => void failed.refetch()}
          retrying={failed.isRefetching}
        />
      </BookingError>
    )
  }

  if (!session.data || !seatMap.data || !options.data || restoring) {
    return (
      <BookingFrame onClose={onClose}>
        <BookingSkeleton />
      </BookingFrame>
    )
  }

  return (
    <BookingSteps
      session={session.data}
      seatMap={seatMap.data}
      options={options.data}
      user={user}
      initialHold={initialHold}
      refetchSeats={() => void seatMap.refetch()}
      onClose={onClose}
    />
  )
}

/** A hold restored after a refresh resumes on the checkout step. */
const startFrom = (hold: SeatHold | null): BookingState =>
  hold ? bookingReducer(initialBookingState, { type: 'held', hold }) : initialBookingState

type BookingStepsProps = {
  session: Session
  seatMap: SeatMap
  options: FilterOptions
  user: User
  initialHold: SeatHold | null
  refetchSeats: () => void
  onClose: () => void
}

function BookingSteps({
  session,
  seatMap,
  options,
  user,
  initialHold,
  refetchSeats,
  onClose,
}: BookingStepsProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialHold, startFrom)
  // The seat map ripples in when the modal opens, not when coming back from checkout.
  const [ripple, setRipple] = useState(initialHold === null)
  const holdSeats = useHoldSeats(session.id)
  const releaseHold = useReleaseHold(session.id)
  const createOrder = useCreateOrder()
  // Reached by a direct link, or left open past the start time; a hold already made can still be paid.
  const started = hasSessionStarted(session, useCinemaNow())

  useHoldExpiry(state.step === 'confirmed' ? undefined : state.hold?.expiresAt, () => {
    holdStorage.clear(session.id)
    dispatch({ type: 'expired' })
    refetchSeats()
  })

  const loseSeats = (codes: string[]) => {
    dispatch({ type: 'lost', codes })
    refetchSeats()
  }

  const close = () => {
    // While a payment is on its way the hold belongs to it: releasing it would race the order.
    if (state.hold && state.step !== 'confirmed' && !createOrder.isPending) {
      releaseHold.mutate(state.hold.holdId)
    }
    onClose()
  }

  // `isPending` only changes on the next render, so two clicks in the same tick would both pass it.
  const requestInFlight = useRef(false)

  const next = () => {
    if (requestInFlight.current) return
    requestInFlight.current = true
    const seats = state.seats.map(({ seatId, ticketType }) => ({ seatId, ticketType }))
    holdSeats.mutate(seats, {
      onSuccess: (hold) => {
        setRipple(false)
        dispatch({ type: 'held', hold })
      },
      onError: (error) => {
        if (isApiError(error) && error.kind === 'conflict') return loseSeats(error.contested)
        const fieldMessage = isApiError(error) && Object.values(error.fieldErrors)[0]?.[0]
        dispatch({ type: 'rejected', message: fieldMessage || error.message })
      },
      onSettled: () => {
        requestInFlight.current = false
      },
    })
  }

  const pay = async (values: CheckoutValues) => {
    if (!state.hold || requestInFlight.current) return
    requestInFlight.current = true
    try {
      const order = await createOrder.mutateAsync({ holdId: state.hold.holdId, ...values })
      dispatch({ type: 'paid', order })
    } catch (error) {
      if (isApiError(error) && error.kind === 'conflict') return loseSeats(error.contested)
      // A 422 without field errors on an order means the hold ran out.
      if (isApiError(error) && error.kind === 'rule') {
        holdStorage.clear(session.id)
        dispatch({ type: 'expired' })
        return refetchSeats()
      }
      throw error
    } finally {
      requestInFlight.current = false
    }
  }

  const { minAge, code } = session.movie.ageRating
  let blocker: ReactNode = null
  if (started) {
    blocker = (
      <p className="text-label-m">This session has already started. Choose a later showtime.</p>
    )
  } else if (!user.profileComplete) {
    blocker = (
      <>
        <p className="text-label-m">Please complete your profile to enable booking.</p>
        <ButtonLink to="/profile" variant="transparent" size="sm" className="self-start">
          Complete profile
        </ButtonLink>
      </>
    )
  } else if (user.age !== null && user.age < minAge) {
    blocker = (
      <p className="text-label-m">
        This film is rated {code}. You cannot buy tickets for it with this account.
      </p>
    )
  }

  return (
    <BookingFrame onClose={close}>
      {state.step === 'confirmed' && state.order ? (
        <BookingConfirmation
          order={state.order}
          ticketTypes={options.ticketTypes}
          onClose={close}
        />
      ) : (
        <>
          <BookingHeader session={session} hold={state.hold} />
          {state.step === 'checkout' && state.hold ? (
            <CheckoutStep
              session={session}
              hold={state.hold}
              user={user}
              ticketTypes={options.ticketTypes}
              onBack={() => dispatch({ type: 'back' })}
              onPay={pay}
            />
          ) : (
            <SeatsStep
              session={session}
              seatMap={seatMap}
              ticketTypes={options.ticketTypes}
              maxSeats={options.maxSeatsPerOrder}
              state={state}
              dispatch={dispatch}
              blocker={blocker}
              ripple={ripple}
              holding={holdSeats.isPending}
              onNext={next}
            />
          )}
        </>
      )}
    </BookingFrame>
  )
}
