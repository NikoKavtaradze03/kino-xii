import { ButtonLink } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      className="pt-header"
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      action={<ButtonLink to="/">Back to home</ButtonLink>}
    />
  )
}
