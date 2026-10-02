import { NavLink } from 'react-router'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { useCurrentUser } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Logo } from '@/shared/ui/Logo'
import { Skeleton } from '@/shared/ui/Skeleton'

function AccountArea() {
  const { status, user, retry, isRetrying } = useCurrentUser()
  const openModal = useAuthStore((state) => state.openModal)

  if (status === 'loading') return <Skeleton className="h-10 w-32" />
  if (user) return <UserMenu user={user} />
  if (status === 'error') {
    return (
      <div className="flex items-center gap-3">
        <p className="text-label-s text-secondary">Couldn&apos;t load your account</p>
        <Button variant="transparent" icon="error" onClick={retry} loading={isRetrying}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => openModal('register')}>Sign up</Button>
      <Button variant="secondary" onClick={() => openModal('login')}>
        Log in
      </Button>
    </div>
  )
}

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-linear-to-b from-page/60 to-transparent px-15 pt-7.5 pb-10">
      <nav className="flex items-center gap-9">
        <Logo className="gap-1.5 text-h2" />
        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            cn('text-overline uppercase transition-colors hover:text-red', isActive && 'text-red')
          }
        >
          Sessions
        </NavLink>
      </nav>

      <AccountArea />
    </header>
  )
}
