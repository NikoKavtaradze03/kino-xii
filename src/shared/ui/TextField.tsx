import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
  valid?: boolean
}

export function TextField({ label, error, valid, id, className, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor={inputId}
          className={cn('text-label-s', error ? 'text-red' : 'text-primary')}
        >
          {label}
        </label>
        <div
          className={cn(
            'flex h-10 items-center gap-1.5 rounded-xl border bg-card px-4 transition-colors',
            error
              ? 'border-red'
              : 'border-transparent focus-within:border-disabled focus-within:bg-card hover:border-disabled hover:bg-raised',
          )}
        >
          <input
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-label-s outline-none placeholder:text-secondary',
              error ? 'text-red' : 'text-primary',
            )}
            {...inputProps}
          />
          {error ? (
            <Icon name="error" className="shrink-0 text-red" />
          ) : (
            valid && <Icon name="check" className="shrink-0 text-green" />
          )}
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-label-s text-red">
          {error}
        </p>
      )}
    </div>
  )
}
