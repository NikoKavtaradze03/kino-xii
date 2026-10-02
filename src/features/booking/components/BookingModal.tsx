import { lazy, Suspense, useEffect } from 'react'
import { useBookingParam } from '../hooks'

const loadBookingGate = () => import('./BookingGate')
const BookingGate = lazy(async () => ({ default: (await loadBookingGate()).BookingGate }))

/**
 * Opened from `?booking=<session id>`. The flow is a separate chunk, fetched once the
 * page is idle so it is usually ready before the first Book click.
 */
export function BookingModal() {
  const { sessionId, close } = useBookingParam()

  useEffect(() => {
    const id = requestIdleCallback(() => void loadBookingGate())
    return () => cancelIdleCallback(id)
  }, [])

  if (sessionId === null) return null
  return (
    <Suspense fallback={null}>
      <BookingGate key={sessionId} sessionId={sessionId} onClose={close} />
    </Suspense>
  )
}
