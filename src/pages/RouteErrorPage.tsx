import { ErrorState } from '@/shared/ui/ErrorState'

export function RouteErrorPage() {
  return (
    <ErrorState
      className="min-h-screen justify-center"
      message="Something went wrong while showing this page."
      onRetry={() => window.location.reload()}
    />
  )
}
