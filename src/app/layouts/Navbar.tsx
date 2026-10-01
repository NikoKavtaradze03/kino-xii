import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Logo } from '@/shared/ui/Logo'

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

      <div className="flex items-center gap-3">
        <Button>Sign up</Button>
        <Button variant="secondary">Log in</Button>
      </div>
    </header>
  )
}
