import type { ReactNode } from 'react'

/** Figma's two columns: 720px for the map or form, a 1px divider, 321px for the summary. */
export function BookingColumns({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex w-180 flex-col">{main}</div>
      <div className="w-px shrink-0 rounded-full bg-card" />
      <div className="flex w-80.25 flex-col justify-between gap-6">{aside}</div>
    </div>
  )
}
