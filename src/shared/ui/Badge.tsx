import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from './Icon'

type BadgeProps = {
  tone?: 'neutral' | 'red'
  size?: 'md' | 'sm'
  icon?: IconName
  title?: string
  className?: string
  children: ReactNode
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  icon,
  title,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full text-label-s whitespace-nowrap',
        size === 'md' ? 'px-3 py-1.5' : 'px-2 py-1',
        tone === 'red' ? 'bg-tint-red text-red' : 'bg-tint-white text-primary',
        className,
      )}
    >
      {icon && <Icon name={icon} className="size-3.5" />}
      {children}
    </span>
  )
}
