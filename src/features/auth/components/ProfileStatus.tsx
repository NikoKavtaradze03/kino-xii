import { Icon } from '@/shared/ui/Icon'

/** Figma's profile status box: green when booking is enabled, orange with the reason when not. */
export function ProfileStatus({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <div className="flex items-center gap-1.5 rounded-[10px] bg-tint-green px-3 py-2.5 text-label-m text-green">
        Profile Complete
        <Icon name="check" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 rounded-[10px] bg-tint-orange px-3 py-2.5">
      <p className="text-label-m text-orange">Profile incomplete</p>
      <p className="text-body-s text-secondary">Please complete your profile to enable booking</p>
    </div>
  )
}
