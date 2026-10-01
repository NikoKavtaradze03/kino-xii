import { isAxiosError } from 'axios'

export type ApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'rule'
  | 'conflict'
  | 'server'
  | 'network'

export type FieldErrors = Record<string, string[]>

type ErrorBody = {
  message?: string
  errors?: FieldErrors
  contested?: string[]
}

const fallbackMessages: Record<ApiErrorKind, string> = {
  unauthorized: 'Please log in to continue.',
  forbidden: 'You do not have access to this.',
  notFound: 'We could not find what you were looking for.',
  validation: 'Please check the highlighted fields.',
  rule: 'This action is not allowed.',
  conflict: 'Some of those seats were just taken.',
  server: 'Something went wrong on our side. Please try again.',
  network: 'Could not reach the server. Check your connection and try again.',
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly fieldErrors: FieldErrors
  readonly contested: string[]

  constructor(kind: ApiErrorKind, status: number | null, body: ErrorBody = {}) {
    super(body.message ?? fallbackMessages[kind])
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.fieldErrors = body.errors ?? {}
    this.contested = body.contested ?? []
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// A 422 means two different things: `errors` present is field validation,
// `message` alone is a booking rule whose message is written for the user.
function kindFromStatus(status: number, body: ErrorBody): ApiErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status === 422) return body.errors ? 'validation' : 'rule'
  return 'server'
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error
  if (!isAxiosError<ErrorBody>(error) || !error.response) return new ApiError('network', null)

  const { status, data } = error.response
  const body = data && typeof data === 'object' ? data : {}
  return new ApiError(kindFromStatus(status, body), status, body)
}
