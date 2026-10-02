import type { ComponentProps } from 'react'
import type { AgeRating } from '@/shared/api/types'
import { Badge } from '@/shared/ui/Badge'

type AgeBadgeProps = {
  rating: AgeRating
  size?: ComponentProps<typeof Badge>['size']
}

export function AgeBadge({ rating, size = 'sm' }: AgeBadgeProps) {
  return (
    <Badge tone="red" size={size} title={rating.description}>
      {rating.code}
    </Badge>
  )
}
