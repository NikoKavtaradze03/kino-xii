import { SessionsBrowser } from '@/features/sessions/components/SessionsBrowser'

export function SessionsPage() {
  return (
    <div className="grid grid-cols-[20rem_minmax(0,1fr)] gap-x-12.75 gap-y-9 px-gutter pt-header pb-34">
      <header className="flex h-11.75 flex-col gap-1.5">
        <h1 className="text-h1">Sessions</h1>
        <p className="text-body-m text-secondary">Browse showtimes across all venues</p>
      </header>
      <SessionsBrowser />
    </div>
  )
}
