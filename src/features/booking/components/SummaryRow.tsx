import type { ReactNode } from 'react'

type SummaryRowProps = {
  label: string
  /** Text style of the value, e.g. `text-label-s`. */
  valueClassName: string
  children: ReactNode
}

export function SummaryRow({ label, valueClassName, children }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-body-s text-secondary">{label}</dt>
      <dd className={valueClassName}>{children}</dd>
    </div>
  )
}
