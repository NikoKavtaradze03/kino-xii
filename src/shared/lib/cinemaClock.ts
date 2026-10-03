import { useSyncExternalStore } from 'react'
import type { Session } from '@/shared/api/types'

// A session's `date` and `time` are the cinema's wall clock. The API's `startsAt` labels that same
// clock as UTC, so the server's own "session has started" check runs four hours late; comparing on
// the cinema's clock is stricter and works from any visitor's time zone.
const CINEMA_TIME_ZONE = 'Asia/Tbilisi'

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: CINEMA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** The cinema's current date and time as "yyyy-MM-dd HH:mm", which sorts like a date. */
export function cinemaNow(at = new Date()) {
  const parts = Object.fromEntries(
    formatter.formatToParts(at).map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

export const hasSessionStarted = (session: Pick<Session, 'date' | 'time'>, now: string) =>
  `${session.date} ${session.time}` <= now

const TICK_MS = 10_000
const listeners = new Set<() => void>()
let current = cinemaNow()
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  const next = cinemaNow()
  if (next === current) return
  current = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) timer = setInterval(tick, TICK_MS)
  tick()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) clearInterval(timer)
  }
}

/** `cinemaNow()` that re-renders when the minute changes; every caller shares one timer. */
export function useCinemaNow() {
  return useSyncExternalStore(subscribe, () => current)
}
