import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}>
      <p className="text-h3">{title}</p>
      {description && <p className="max-w-md text-body-m text-secondary">{description}</p>}
      {action}
    </div>
  )
}
