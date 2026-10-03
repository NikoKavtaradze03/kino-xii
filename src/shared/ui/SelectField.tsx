import { Select } from 'radix-ui'
import { useId, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

// Radix reserves the empty string for "nothing selected", so the clearing option needs its own value.
const NONE = '__none__'

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: { value: string; label: string }[]
  placeholder: string
  /** Adds an option that clears the field back to ''. */
  emptyLabel?: string
  name?: string
  disabled?: boolean
  error?: ReactNode
  className?: string
}

export function SelectField({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  emptyLabel,
  name,
  disabled,
  error,
  className,
}: SelectFieldProps) {
  const id = useId()

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <label htmlFor={id} className="text-label-s text-primary">
        {label}
      </label>
      <Select.Root
        name={name}
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          // Radix reports '' by itself when the value's option is not rendered yet (the list is
          // still loading); a real clear arrives as NONE.
          if (next !== '') onChange(next === NONE ? '' : next)
        }}
        onOpenChange={(open) => !open && onBlur?.()}
      >
        <Select.Trigger
          id={id}
          className={cn(
            'group flex h-10 cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-transparent bg-card px-3.75 text-label-s text-primary transition-colors outline-none disabled:cursor-not-allowed',
            'focus-visible:border-disabled enabled:hover:border-disabled enabled:hover:bg-raised data-placeholder:text-secondary',
          )}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon asChild>
            <Icon
              name="chevron-down"
              className="shrink-0 text-primary transition-transform group-data-[state=open]:rotate-180"
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={8}
            className="z-50 w-(--radix-select-trigger-width) overflow-hidden rounded-2xl border border-raised bg-page py-2 shadow-[0_20px_48px_-8px_var(--color-shadow),0_2px_6px_var(--color-shadow)]"
          >
            <Select.Viewport>
              {emptyLabel && <SelectItem value={NONE} label={emptyLabel} muted />}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} label={option.label} />
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error && (
        <p role="alert" className="text-label-s text-red">
          {error}
        </p>
      )}
    </div>
  )
}

function SelectItem({ value, label, muted }: { value: string; label: string; muted?: boolean }) {
  return (
    <Select.Item
      value={value}
      className={cn(
        'flex h-10 cursor-pointer items-center justify-between gap-2 px-4 text-label-m outline-none data-highlighted:bg-card',
        muted && 'text-secondary',
      )}
    >
      <Select.ItemText>{label}</Select.ItemText>
      <Select.ItemIndicator>
        <Icon name="check" className="text-green" />
      </Select.ItemIndicator>
    </Select.Item>
  )
}
