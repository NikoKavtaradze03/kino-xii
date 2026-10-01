import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from './Icon'

type BadgeProps = {
  tone?: 'neutral' | 'red'
  icon?: IconName
  title?: string
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon, title, className, children }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-label-s whitespace-nowrap',
        tone === 'red' ? 'bg-tint-red text-red' : 'bg-tint-white text-primary',
        className,
      )}
    >
      {icon && <Icon name={icon} className="size-3.5" />}
      {children}
    </span>
  )
}
