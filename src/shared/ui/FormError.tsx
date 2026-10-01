import { Icon } from '@/shared/ui/Icon'

export function FormError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p role="alert" className="flex items-center gap-2 text-label-s text-red">
      <Icon name="error" className="shrink-0" />
      {message}
    </p>
  )
}
