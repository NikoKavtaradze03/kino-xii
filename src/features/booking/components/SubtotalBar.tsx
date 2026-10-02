import type { ReactNode } from 'react'
import { formatPrice } from '@/shared/lib/format'

export function SubtotalBar({ amount, children }: { amount: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 pt-2.5">
      <p className="flex items-center justify-between px-1.25">
        <span className="text-label-s">SUBTOTAL</span>
        <span className="text-h1">{formatPrice(amount)}</span>
      </p>
      {children}
    </div>
  )
}
