import { z } from 'zod'

// The API strips spaces from card and mobile numbers, so "4242 4242 4242 4242" is valid as typed.
const withoutSpaces = (value: string) => value.replace(/\s/g, '')

/** Keeps up to 16 digits, grouped in fours: "4242424242424242" → "4242 4242 4242 4242". */
export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')

/**
 * Keeps up to 4 digits as MM/YY, adding the slash once the month is typed. While deleting, "12/"
 * becomes "12" instead of getting its slash back, so the user can erase past it.
 */
export function formatExpiry(value: string, deleting: boolean) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  if (digits.length === 2 && !deleting) return `${digits}/`
  return digits
}

/** "09/30" is valid until the end of September 2030. */
function isNotExpired(expiry: string) {
  const [month, year] = expiry.split('/').map(Number)
  return new Date(2000 + year, month, 1) > new Date()
}

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be at most 50 characters'),
  email: z.email({
    error: (issue) => (issue.input ? 'Please enter a valid email address' : 'Email is required'),
  }),
  mobileNumber: z
    .string()
    .min(1, 'Mobile number is required')
    .refine(
      (value) => /^5\d{8}$/.test(withoutSpaces(value)),
      'Enter a Georgian mobile number, e.g. 555 123 456',
    ),
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .refine((value) => /^\d{16}$/.test(withoutSpaces(value)), 'Card number must be 16 digits'),
  expiry: z
    .string()
    .min(1, 'Expiry is required')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use the MM/YY format')
    .refine(isNotExpired, 'This card has expired'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3}$/, 'CVV must be 3 digits'),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>
