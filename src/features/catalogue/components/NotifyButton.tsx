import { useRequireAuth } from '@/features/auth/hooks'
import type { Movie } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Icon } from '@/shared/ui/Icon'
import { useNotifyMe } from '../hooks'

type NotifyButtonProps = {
  movie: Movie
  className?: string
}

export function NotifyButton({ movie, className }: NotifyButtonProps) {
  const requireAuth = useRequireAuth()
  const notify = useNotifyMe()

  // The API has no way to unsubscribe, so the subscribed state is final.
  if (movie.isNotified) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-tint-white px-3 py-1.5 text-label-s',
          className,
        )}
      >
        <Icon name="check" />
        Reminder set
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      icon={notify.isError ? 'error' : 'bell'}
      loading={notify.isPending}
      onClick={() => requireAuth(() => notify.mutate(movie.slug))}
      className={className}
    >
      {notify.isError ? 'Try again' : 'Notify Me'}
    </Button>
  )
}
