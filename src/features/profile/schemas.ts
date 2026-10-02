import { isAfter, parseISO, subYears } from 'date-fns'
import { z } from 'zod'
import type { User } from '@/shared/api/types'

const MIN_AGE = 12

// The messages are the brief's, word for word; the API returns the same ones.
const mobileNumber = z
  .string()
  .transform((value) => value.replace(/\s/g, ''))
  .superRefine((digits, ctx) => {
    let message: string | undefined
    if (!digits) message = 'Mobile number is required'
    else if (!/^\d+$/.test(digits))
      message = 'Please enter a valid Georgian mobile number (9 digits starting with 5)'
    else if (!digits.startsWith('5')) message = 'Georgian mobile numbers must start with 5'
    else if (digits.length !== 9) message = 'Mobile number must be exactly 9 digits'
    if (message) ctx.addIssue({ code: 'custom', message })
  })

const dateOfBirth = z.string().superRefine((value, ctx) => {
  let message: string | undefined
  const date = parseISO(value)
  const today = new Date()
  if (!value) message = 'Date of birth is required'
  else if (Number.isNaN(date.getTime()) || isAfter(date, today))
    message = 'Please enter a valid date of birth'
  else if (isAfter(date, subYears(today, MIN_AGE)))
    message = 'You must be at least 12 years old to create an account'
  if (message) ctx.addIssue({ code: 'custom', message })
})

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),
  mobileNumber,
  dateOfBirth,
  preferredVenueId: z.string(),
})

export type ProfileValues = z.input<typeof profileSchema>

/** "599123456" → "599 123 456", the way Figma shows it. */
const groupDigits = (digits: string) => digits.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3')

export function profileValues(user: User): ProfileValues {
  return {
    fullName: user.fullName ?? '',
    mobileNumber: groupDigits(user.mobileNumber ?? ''),
    dateOfBirth: user.dateOfBirth ?? '',
    preferredVenueId: user.preferredVenue ? String(user.preferredVenue.id) : '',
  }
}
