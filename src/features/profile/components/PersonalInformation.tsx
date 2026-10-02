import { ProfileStatus } from '@/features/auth/components/ProfileStatus'
import { useCurrentUser } from '@/features/auth/hooks'
import { useFilterOptions } from '@/shared/api/filterOptions'
import type { AgeRating } from '@/shared/api/types'
import { ProfileForm } from './ProfileForm'

/** "You are 14, you cannot buy tickets for 16+ or 18+ titles", from the server-computed age. */
function eligibilityNotice(age: number, ratings: AgeRating[]) {
  const blocked = ratings.filter((rating) => rating.minAge > age).map((rating) => rating.code)
  if (blocked.length === 0) return `You are ${age}, you can buy tickets for all age ratings`
  return `You are ${age}, you cannot buy tickets for ${blocked.join(' or ')} titles`
}

export function PersonalInformation() {
  const { user } = useCurrentUser()
  const { data: options } = useFilterOptions()
  if (!user) return null

  return (
    <div className="flex w-220 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ProfileStatus complete={user.profileComplete} />
        {user.age !== null && options && (
          <p className="text-body-s text-secondary">
            {eligibilityNotice(user.age, options.ageRatings)}
          </p>
        )}
      </div>
      <ProfileForm user={user} />
    </div>
  )
}
