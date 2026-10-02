import { DropdownMenu } from 'radix-ui'
import { Link } from 'react-router'
import type { User } from '@/shared/api/types'
import { Icon, type IconName } from '@/shared/ui/Icon'
import { useLogout } from '../hooks'
import { UserAvatar } from './UserAvatar'

const itemClasses =
  'flex h-10 cursor-pointer items-center gap-2 pl-5 text-label-m outline-none data-highlighted:bg-card'

function MenuLink({ to, icon, label }: { to: string; icon: IconName; label: string }) {
  return (
    <DropdownMenu.Item asChild className={itemClasses}>
      <Link to={to}>
        <Icon name={icon} />
        {label}
      </Link>
    </DropdownMenu.Item>
  )
}

function ProfileStatus({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <div className="flex items-center gap-1.5 rounded-[10px] bg-tint-green px-3 py-2.5 text-label-m text-green">
        Profile Complete
        <Icon name="check" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 rounded-[10px] bg-tint-orange px-3 py-2.5">
      <p className="text-label-m text-orange">Profile incomplete</p>
      <p className="text-body-s text-secondary">Please complete your profile to enable booking</p>
    </div>
  )
}

export function UserMenu({ user }: { user: User }) {
  const logoutMutation = useLogout()
  const displayName = user.fullName ?? user.username

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="group flex cursor-pointer items-center gap-6 outline-none">
        <span className="flex items-center gap-3">
          <UserAvatar user={user} className="size-10" />
          <span className="text-label-m">{displayName.split(' ')[0]}</span>
        </span>
        <Icon
          name="chevron-down"
          className="transition-transform group-data-[state=open]:rotate-180"
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={12}
          className="z-30 flex w-[302px] flex-col gap-1 overflow-hidden rounded-2xl border border-raised bg-page pb-2.5 shadow-[0_20px_48px_-8px_var(--color-shadow),0_2px_6px_var(--color-shadow)]"
        >
          <div className="flex flex-col gap-4 px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <UserAvatar user={user} className="size-10.5" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-label-m">{displayName}</p>
                <p className="truncate text-body-s text-secondary">{user.email}</p>
              </div>
            </div>
            <ProfileStatus complete={user.profileComplete} />
          </div>

          <div className="flex flex-col gap-0.5 pt-1">
            <MenuLink to="/profile" icon="user" label="My Profile" />
            <MenuLink to="/profile?tab=tickets" icon="ticket" label="My Tickets" />
          </div>

          <DropdownMenu.Separator className="h-px bg-tint-white" />

          <DropdownMenu.Item
            className={`${itemClasses} text-red`}
            disabled={logoutMutation.isPending}
            onSelect={() => logoutMutation.mutate()}
          >
            <Icon name="log-out" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
