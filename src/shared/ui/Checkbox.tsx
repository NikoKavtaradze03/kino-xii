import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'

type CheckboxProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: ReactNode
  /** Secondary text after the label, e.g. a venue's city. */
  detail?: ReactNode
}

export function Checkbox({ checked, onCheckedChange, label, detail }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={(state) => onCheckedChange(state === true)}
        className="flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] ring-[1.5px] ring-disabled transition-colors duration-300 ease-out ring-inset data-[state=checked]:bg-red data-[state=checked]:ring-red"
      >
        <CheckboxPrimitive.Indicator>
          <svg viewBox="0 0 18 18" aria-hidden className="size-4.5 text-primary">
            <path
              d="M7.187 11.212 5.205 9.229a.563.563 0 0 0-.796.796l2.376 2.371c.221.221.578.221.799 0l6.004-5.999a.563.563 0 0 0-.796-.796l-5.605 5.611Z"
              fill="currentColor"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="flex items-center gap-1.25">
        <span className="text-label-m">{label}</span>
        {detail && <span className="text-body-s text-secondary">· {detail}</span>}
      </span>
    </label>
  )
}
