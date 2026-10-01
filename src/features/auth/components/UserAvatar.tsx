import type { User } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'

function initials(user: User) {
  return (user.fullName ?? user.username)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function UserAvatar({ user, className }: { user: User; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-lg bg-card text-label-s',
        className,
      )}
    >
      {user.avatar ? (
        <img src={user.avatar} alt="" className="size-full rounded-lg object-cover" />
      ) : (
        initials(user)
      )}
      <span
        aria-hidden
        className={cn(
          'absolute right-0 bottom-0 size-2 rounded-full ring-1 ring-page',
          user.profileComplete ? 'bg-green' : 'bg-orange',
        )}
      />
    </span>
  )
}
