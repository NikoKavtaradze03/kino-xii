import { format, parseISO } from 'date-fns'

export const formatPrice = (amount: number) => `₾ ${amount}`

/** "2026-10-02" → "2 October" (or another date-fns pattern). */
export const formatDate = (isoDate: string, pattern = 'd MMMM') =>
  format(parseISO(isoDate), pattern)
