import { cn } from '@/shared/lib/cn'

type StepPillsProps = {
  step: 'seats' | 'checkout'
  /** On checkout, the Seats pill goes back to the seat map. */
  onBack?: () => void
}

const pillClasses = 'flex w-full justify-center rounded-full px-4 py-2.5 text-label-s'

export function StepPills({ step, onBack }: StepPillsProps) {
  return (
    <ol aria-label="Booking steps" className="flex gap-2 rounded-full bg-card">
      <li className="flex-1">
        {onBack ? (
          <button type="button" onClick={onBack} className={cn(pillClasses, 'cursor-pointer')}>
            SEATS
          </button>
        ) : (
          <span aria-current="step" className={cn(pillClasses, 'bg-red')}>
            SEATS
          </span>
        )}
      </li>
      <li className="flex-1">
        <span
          aria-current={step === 'checkout' ? 'step' : undefined}
          className={cn(pillClasses, step === 'checkout' && 'bg-red')}
        >
          CHECKOUT
        </span>
      </li>
    </ol>
  )
}
