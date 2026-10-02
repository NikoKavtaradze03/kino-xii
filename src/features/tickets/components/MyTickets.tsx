import { Tabs } from 'radix-ui'
import { useSearchParams } from 'react-router'
import type { Order } from '@/shared/api/types'
import { ButtonLink } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useMyTickets } from '../hooks'
import { TicketCard } from './TicketCard'

type Period = 'upcoming' | 'past'

const PARAM = 'tickets'

function PeriodTab({ value, label, count }: { value: Period; label: string; count?: number }) {
  return (
    <Tabs.Trigger
      value={value}
      className="group flex cursor-pointer items-center gap-2 rounded-[10px] px-3.5 py-1.75 text-label-m text-secondary transition-colors outline-none data-[state=active]:bg-raised data-[state=active]:text-primary"
    >
      {label}
      {count !== undefined && (
        <span className="text-label-s text-disabled group-data-[state=active]:text-primary">
          {count}
        </span>
      )}
    </Tabs.Trigger>
  )
}

function TicketList({ orders, period }: { orders: Order[]; period: Period }) {
  if (orders.length === 0) {
    return period === 'upcoming' ? (
      <EmptyState
        title="No upcoming tickets"
        description="Tickets you buy will show up here until the session starts."
        action={<ButtonLink to="/sessions">Browse sessions</ButtonLink>}
      />
    ) : (
      <EmptyState
        title="No past tickets"
        description="Sessions you've been to and refunded orders will show up here."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-5">
      {orders.map((order) => (
        <li key={order.id}>
          <TicketCard order={order} />
        </li>
      ))}
    </ul>
  )
}

export function MyTickets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const period: Period = searchParams.get(PARAM) === 'past' ? 'past' : 'upcoming'
  const { data, isPending, isError, refetch, isRefetching } = useMyTickets()

  const changePeriod = (next: string) =>
    setSearchParams(
      (params) => {
        if (next === 'past') params.set(PARAM, next)
        else params.delete(PARAM)
        return params
      },
      { replace: true },
    )

  return (
    <Tabs.Root value={period} onValueChange={changePeriod} className="flex flex-col gap-5">
      <Tabs.List aria-label="Tickets" className="flex w-fit rounded-xl bg-card p-1.25">
        <PeriodTab value="upcoming" label="Upcoming" count={data?.upcoming.length} />
        <PeriodTab value="past" label="Past" count={data?.past.length} />
      </Tabs.List>

      {isPending ? (
        <div aria-busy className="flex flex-col gap-5">
          <Skeleton className="h-45.75 rounded-[26px]" />
          <Skeleton className="h-45.75 rounded-[26px]" />
        </div>
      ) : isError ? (
        <ErrorState
          message="We couldn't load your tickets. Please try again."
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      ) : (
        <>
          <Tabs.Content value="upcoming" className="outline-none">
            <TicketList orders={data.upcoming} period="upcoming" />
          </Tabs.Content>
          <Tabs.Content value="past" className="outline-none">
            <TicketList orders={data.past} period="past" />
          </Tabs.Content>
        </>
      )}
    </Tabs.Root>
  )
}

/** The number on the "My Tickets" tab: upcoming tickets, once they have loaded. */
export function UpcomingTicketCount() {
  const { data } = useMyTickets()
  if (!data?.upcoming.length) return null

  return (
    <span className="rounded-full bg-red px-1.5 py-0.5 text-label-s text-primary">
      {data.upcoming.length}
    </span>
  )
}
