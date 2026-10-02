import { format, isThisYear, parseISO } from 'date-fns'

export const formatPrice = (amount: number) => `₾ ${amount}`

/** "2026-10-02" → "2 October" (or another date-fns pattern). */
export const formatDate = (isoDate: string, pattern = 'd MMMM') =>
  format(parseISO(isoDate), pattern)

/** "2 October" this year, "12 July 1997" otherwise. */
export const formatReleaseDate = (isoDate: string) =>
  formatDate(isoDate, isThisYear(parseISO(isoDate)) ? 'd MMMM' : 'd MMMM yyyy')
