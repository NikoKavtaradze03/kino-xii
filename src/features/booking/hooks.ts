import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useRequireAuth } from '@/features/auth/hooks'
import {
  bookingKeys,
  createOrder,
  fetchHold,
  fetchSeatMap,
  fetchSession,
  holdSeats,
  type SeatChoice,
} from './api'
import { holdStorage } from './holdStorage'

export function useBookingSession(sessionId: number) {
  return useQuery({
    queryKey: bookingKeys.session(sessionId),
    queryFn: () => fetchSession(sessionId),
  })
}

/** Always refetched when the modal opens, so it never starts from an old map. */
export function useSeatMap(sessionId: number) {
  return useQuery({
    queryKey: bookingKeys.seats(sessionId),
    queryFn: () => fetchSeatMap(sessionId),
    refetchOnMount: 'always',
  })
}

/** The hold saved before a page refresh, if any; read once when the modal opens. */
export function useStoredHold(sessionId: number) {
  const [holdId] = useState(() => holdStorage.get(sessionId))
  return useQuery({
    queryKey: bookingKeys.hold(holdId ?? ''),
    queryFn: () => fetchHold(holdId ?? ''),
    enabled: holdId !== null,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useHoldSeats(sessionId: number) {
  return useMutation({
    mutationFn: (seats: SeatChoice[]) => holdSeats(sessionId, seats),
    onSuccess: (hold) => holdStorage.set(sessionId, hold.holdId),
  })
}

/** Seat counts, maps and the user's tickets all change once an order is paid. */
export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      holdStorage.clear(order.session.id)
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
      void queryClient.invalidateQueries({ queryKey: ['movies'] })
      void queryClient.invalidateQueries({ queryKey: ['me', 'tickets'] })
    },
  })
}

/** Calls `onExpire` at `expiresAt`, an absolute time, so a slow or hidden tab does not drift. */
export function useHoldExpiry(expiresAt: string | undefined, onExpire: () => void) {
  const callback = useRef(onExpire)
  useEffect(() => {
    callback.current = onExpire
  })

  useEffect(() => {
    if (!expiresAt) return
    const timeout = setTimeout(
      () => callback.current(),
      Math.max(0, Date.parse(expiresAt) - Date.now()),
    )
    return () => clearTimeout(timeout)
  }, [expiresAt])
}

const BOOKING_PARAM = 'booking'

/**
 * The query string with `booking` set to `sessionId`, or removed when it is null. Edited as text so
 * other parameters keep their exact form (the sessions filters use plain commas).
 */
function withBooking(search: string, sessionId: number | null) {
  const params = search
    .replace(/^\?/, '')
    .split('&')
    .filter((param) => param && !param.startsWith(`${BOOKING_PARAM}=`))
  if (sessionId !== null) params.push(`${BOOKING_PARAM}=${sessionId}`)
  return params.length ? `?${params.join('&')}` : ''
}

/** The session whose booking modal is open, from `?booking=<id>`, and a way to close it. */
export function useBookingParam() {
  const [searchParams] = useSearchParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const sessionId = Number(searchParams.get(BOOKING_PARAM))

  return {
    sessionId: Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null,
    close: () => navigate({ search: withBooking(search, null) }, { preventScrollReset: true }),
  }
}

/** Guests log in first; the booking modal then opens over the current page. */
export function useOpenBooking() {
  const requireAuth = useRequireAuth()
  const { search } = useLocation()
  const navigate = useNavigate()

  return (sessionId: number) =>
    requireAuth(() =>
      navigate({ search: withBooking(search, sessionId) }, { preventScrollReset: true }),
    )
}
