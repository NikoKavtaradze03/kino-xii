import type { AgeRating } from '@/shared/api/types'
import { Badge } from '@/shared/ui/Badge'

export function AgeBadge({ rating, size = 'sm' }: { rating: AgeRating; size?: 'md' | 'sm' }) {
  return (
    <Badge tone="red" size={size} title={rating.description}>
      {rating.code}
    </Badge>
  )
}
