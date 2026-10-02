import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from './Icon'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
  valid?: boolean
  /** Helper text under the field, replaced by the error when there is one. */
  hint?: string
  /** Shown at the right edge when the field has no error or check mark. */
  icon?: IconName
}

export function TextField({
  label,
  error,
  valid,
  hint,
  icon,
  id,
  className,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  let trailing = icon && <Icon name={icon} className="pointer-events-none shrink-0" />
  if (error) trailing = <Icon name="error" className="shrink-0 text-red" />
  else if (valid) trailing = <Icon name="check" className="shrink-0 text-green" />

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
            'flex h-10 items-center gap-1.5 rounded-xl border bg-card px-3.75 transition-colors',
            error
              ? 'border-red'
              : 'border-transparent focus-within:border-disabled focus-within:bg-card not-has-disabled:hover:border-disabled not-has-disabled:hover:bg-raised',
          )}
        >
          <input
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-label-s outline-none placeholder:text-secondary disabled:cursor-not-allowed disabled:text-secondary',
              error ? 'text-red' : 'text-primary',
            )}
            {...inputProps}
          />
          {trailing}
        </div>
      </div>
      {error ? (
        <p id={errorId} className="text-label-s text-red">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-label-s text-secondary">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
