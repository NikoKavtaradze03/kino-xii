import { cn } from '@/shared/lib/cn'
import { Button } from './Button'
import { Icon } from './Icon'

type ErrorStateProps = {
  message: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

export function ErrorState({ message, onRetry, retrying, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-4 py-12 text-center', className)}
    >
      <Icon name="error" className="size-8 text-red" />
      <p className="max-w-md text-body-m text-secondary">{message}</p>
      {onRetry && (
        <Button variant="transparent" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      )}
    </div>
  )
}
