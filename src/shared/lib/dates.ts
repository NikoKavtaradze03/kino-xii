import { addDays, format } from 'date-fns'

const DAYS_SHOWN = 7

/** Today and the following six days, as the API's "yyyy-MM-dd" dates (the date pickers' range). */
export function upcomingDates(today: Date) {
  return Array.from({ length: DAYS_SHOWN }, (_, i) => format(addDays(today, i), 'yyyy-MM-dd'))
}
