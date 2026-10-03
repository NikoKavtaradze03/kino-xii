import { addDays, format, parseISO } from 'date-fns'
import { useMemo } from 'react'
import { useCinemaNow } from './cinemaClock'

const DAYS_SHOWN = 7

/** `today` and the following six days, as the API's "yyyy-MM-dd" dates (the date pickers' range). */
export function upcomingDates(today: string) {
  const start = parseISO(today)
  return Array.from({ length: DAYS_SHOWN }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'))
}

/**
 * The date pickers' range, starting from today at the cinema rather than in the visitor's time
 * zone; it moves on when the day changes there, even on a page left open.
 */
export function useUpcomingDates() {
  const today = useCinemaNow().slice(0, 10)
  return useMemo(() => upcomingDates(today), [today])
}
