import { Link } from 'react-router'
import { cn } from '@/shared/lib/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="Kino XII home" className={cn('flex', className)}>
      <span>KINO</span>
      <span className="text-red">XII</span>
    </Link>
  )
}
