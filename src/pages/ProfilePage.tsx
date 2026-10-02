import { Tabs } from 'radix-ui'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { PersonalInformation } from '@/features/profile/components/PersonalInformation'
import { MyTickets, UpcomingTicketCount } from '@/features/tickets/components/MyTickets'

type Tab = 'info' | 'tickets'

function TabTrigger({ value, children }: { value: Tab; children: ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="group flex cursor-pointer flex-col gap-3.5 text-label-m text-secondary outline-none data-[state=active]:text-primary"
    >
      <span className="flex items-center gap-2 px-0.5">{children}</span>
      <span className="h-0.5 rounded-t-xs group-data-[state=active]:bg-red" />
    </Tabs.Trigger>
  )
}

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'tickets' ? 'tickets' : 'info'

  // Links such as "View my tickets" open /profile?tab=tickets; other params are dropped on switch.
  const changeTab = (next: string) =>
    setSearchParams(next === 'tickets' ? { tab: next } : {}, { replace: true })

  return (
    <Tabs.Root
      value={tab}
      onValueChange={changeTab}
      className="flex flex-col gap-9 px-gutter pt-header pb-34"
    >
      <div className="flex flex-col gap-7 border-b border-card">
        <h1 className="text-h1">My Profile</h1>
        <Tabs.List aria-label="Profile" className="flex items-end gap-8">
          <TabTrigger value="info">Personal Information</TabTrigger>
          <TabTrigger value="tickets">
            My Tickets
            <UpcomingTicketCount />
          </TabTrigger>
        </Tabs.List>
      </div>

      <Tabs.Content value="info" className="outline-none">
        <PersonalInformation />
      </Tabs.Content>
      <Tabs.Content value="tickets" className="outline-none">
        <MyTickets />
      </Tabs.Content>
    </Tabs.Root>
  )
}
