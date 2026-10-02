import { z } from 'zod'

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 2 * 1024 * 1024

const email = z.email({
  error: (issue) => (issue.input ? 'Please enter a valid email address' : 'Email is required'),
})

const password = z
  .string()
  .min(1, 'Password is required')
  .min(3, 'Password must be at least 3 characters')

export const loginSchema = z.object({ email, password })

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters'),
    email,
    password,
    passwordConfirmation: z.string().min(1, 'Please confirm your password'),
    avatar: z
      .instanceof(File)
      .refine((file) => AVATAR_TYPES.includes(file.type), 'Avatar must be a JPG, PNG or WEBP image')
      .refine((file) => file.size <= AVATAR_MAX_BYTES, 'Avatar must be 2 MB or smaller')
      .optional(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    error: 'Passwords do not match',
  })

export type RegisterValues = z.infer<typeof registerSchema>
