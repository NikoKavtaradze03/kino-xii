import {
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type UseFormSetError,
} from 'react-hook-form'
import type { ZodType } from 'zod'
import { isApiError } from '@/shared/api/errors'

/**
 * Puts API errors onto a react-hook-form form: 422 field errors go on their inputs
 * (`aliases` maps API keys such as `password_confirmation` to form field names),
 * anything else becomes a form-level `root.server` error.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  aliases: Record<string, Path<T>> = {},
) {
  if (isApiError(error) && error.kind === 'validation') {
    Object.entries(error.fieldErrors).forEach(([key, messages]) => {
      setError(aliases[key] ?? (key as Path<T>), { type: 'server', message: messages[0] })
    })
    return
  }

  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  setError('root.server', { type: 'server', message })
}

/**
 * Whether the current values pass the schema, re-evaluated on every keystroke.
 * Used instead of `formState.isValid`, which `setError` forces to false until the next blur.
 */
export function useSchemaValid<T extends FieldValues>(control: Control<T>, schema: ZodType) {
  const values = useWatch({ control })
  return schema.safeParse(values).success
}
