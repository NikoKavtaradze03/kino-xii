import type { ReactNode } from 'react'
import { useCurrentUser } from '@/features/auth/hooks'
import { useFilterOptions } from '@/shared/api/filterOptions'
import type { AgeRating } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/Badge'
import { RetryLink } from '@/shared/ui/RetryLink'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ProfileForm } from './ProfileForm'

/** "You are 14, you cannot buy tickets for 16+ or 18+ titles", from the server-computed age. */
function eligibilityNotice(age: number, ratings: AgeRating[]) {
  const blocked = ratings.filter((rating) => rating.minAge > age).map((rating) => rating.code)
  if (blocked.length === 0) return `You are ${age}, you can buy tickets for all age ratings`
  return `You are ${age}, you cannot buy tickets for ${blocked.join(' or ')} titles`
}

/**
 * Not in Figma: sits beside the form so the form keeps Figma's layout. The top margin (label line
 * + gap) lines it up with the first input box rather than its label.
 */
function AgeCard({ note, children }: { note: ReactNode; children?: ReactNode }) {
  return (
    <aside className="mt-5.75 flex w-90 flex-col gap-4 rounded-2xl bg-card p-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-label-m">Age ratings you can book</h2>
        {note}
      </div>
      {children}
    </aside>
  )
}

function AgeEligibility({ age, ratings }: { age: number | null; ratings: AgeRating[] }) {
  return (
    <AgeCard
      note={
        <p className="text-body-s text-secondary">
          {age === null
            ? 'Add your date of birth to see which titles you can book'
            : eligibilityNotice(age, ratings)}
        </p>
      }
    >
      {age !== null && (
        <ul className="flex flex-wrap gap-2">
          {ratings.map((rating) => {
            const allowed = rating.minAge <= age
            return (
              <li key={rating.code} className={cn(!allowed && 'opacity-40')}>
                <Badge tone="red" size="sm" title={rating.description}>
                  {rating.code}
                  {!allowed && <span className="sr-only"> (not allowed)</span>}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </AgeCard>
  )
}

export function PersonalInformation() {
  const { user } = useCurrentUser()
  const { data: options, isError, isFetching, refetch } = useFilterOptions()
  if (!user) return null

  let ageCard = <AgeCard note={<Skeleton className="h-4 w-56" />} />
  if (options) {
    ageCard = <AgeEligibility age={user.age} ratings={options.ageRatings} />
  } else if (isError) {
    ageCard = (
      <AgeCard
        note={
          <p role="alert" className="text-body-s text-red">
            We couldn't load the age ratings.{' '}
            <RetryLink onRetry={() => void refetch()} retrying={isFetching} />
          </p>
        }
      />
    )
  }

  return (
    <div className="flex items-start justify-between gap-9">
      <div className="w-220">
        <ProfileForm user={user} />
      </div>
      {ageCard}
    </div>
  )
}
