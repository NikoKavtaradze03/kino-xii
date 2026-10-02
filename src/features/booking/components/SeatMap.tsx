import type { CSSProperties } from 'react'
import type { Seat, SeatMap as SeatMapData } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { isSelectable } from '../rules'

type SeatLook = 'available' | 'selected' | 'sold' | 'held'

const seatClasses: Record<SeatLook, string> = {
  available:
    'cursor-pointer bg-card text-primary shadow-[0_1px_2px_var(--color-shadow)] ring-1 ring-disabled ring-inset',
  selected: 'cursor-pointer bg-red text-primary ring-1 ring-page ring-inset',
  sold: 'bg-card text-disabled',
  held: 'bg-card bg-hatched text-secondary',
}

const seatStatus: Record<SeatLook, string> = {
  available: 'available',
  selected: 'selected',
  sold: 'sold',
  held: 'held by another user',
}

const MAP_WIDTH = 720
const ROW_LABEL = 20
const SEAT_GAP = 8
const AISLE = 16
const ROW_GAP = 10
// Height of everything in the modal around the sections (header, step pills, screen, legend,
// paddings, window margin); the rows share what is left of the window.
const MODAL_CHROME = 355
const SECTION_HEADING = 37
const SECTION_GAP = 32

/** Figma's 52px seats, made smaller when the hall is too wide for the map or too tall for the window. */
function seatSize(seatMap: SeatMapData) {
  const rows = seatMap.sections.flatMap((section) => section.rows)
  const widthFit = Math.min(
    ...rows.map(({ seats }) => {
      const aisles = seats.slice(0, -1).filter((seat) => seat.aisleAfter).length
      const gaps = ROW_LABEL + SEAT_GAP * seats.length + (AISLE + SEAT_GAP) * aisles
      return Math.floor((MAP_WIDTH - gaps) / seats.length)
    }),
  )
  const sections = seatMap.sections.length
  const fixedHeight =
    MODAL_CHROME +
    SECTION_HEADING * sections +
    SECTION_GAP * (sections - 1) +
    ROW_GAP * (rows.length - sections)
  return `max(28px, min(52px, ${widthFit}px, calc((100dvh - ${fixedHeight}px) / ${rows.length})))`
}

function rowRange(rows: { label: string }[]) {
  const first = rows[0]?.label
  const last = rows.at(-1)?.label
  return first === last ? `Row ${first}` : `Rows ${first}-${last}`
}

type SeatMapProps = {
  seatMap: SeatMapData
  selectedIds: number[]
  lostCodes: string[]
  onToggle: (seat: Seat) => void
}

export function SeatMap({ seatMap, selectedIds, lostCodes, onToggle }: SeatMapProps) {
  const lookOf = (seat: Seat): SeatLook => {
    if (selectedIds.includes(seat.id)) return 'selected'
    if (seat.state === 'sold' || lostCodes.includes(seat.code)) return 'sold'
    return isSelectable(seat) ? 'available' : 'held'
  }

  return (
    <div className="flex flex-col gap-8" style={{ '--seat': seatSize(seatMap) } as CSSProperties}>
      <div className="mx-5 flex h-7.5 items-center justify-center rounded-b-[20px] bg-raised text-label-s">
        SCREEN
      </div>
      {seatMap.sections.map((section) => (
        <section key={section.name} aria-label={section.name} className="flex flex-col gap-6">
          <h3 className="text-center text-label-s text-secondary uppercase">
            {section.name} · {rowRange(section.rows)}
          </h3>
          <div className="flex flex-col items-center gap-2.5">
            {section.rows.map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="w-5 text-center text-label-s">{row.label}</span>
                {row.seats.map((seat) => {
                  const look = lookOf(seat)
                  return [
                    seat.state === 'unavailable' ? (
                      <span key={seat.id} aria-hidden className="size-(--seat) shrink-0" />
                    ) : (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={look === 'sold' || look === 'held'}
                        aria-pressed={look === 'selected'}
                        aria-label={`Seat ${seat.code}, ${seatStatus[look]}`}
                        onClick={() => onToggle(seat)}
                        className={cn(
                          'flex size-(--seat) shrink-0 items-center justify-center rounded-[10px] text-button',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                          seatClasses[look],
                        )}
                      >
                        {seat.label}
                      </button>
                    ),
                    seat.aisleAfter && (
                      <span key={`${seat.id}-aisle`} aria-hidden className="w-4 shrink-0" />
                    ),
                  ]
                })}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const legend: { label: string; className: string }[] = [
  { label: 'Available', className: 'bg-card ring-1 ring-disabled ring-inset' },
  { label: 'Selected', className: 'bg-red' },
  { label: 'Sold', className: 'bg-card' },
  { label: 'Held by another user', className: 'bg-card bg-hatched' },
]

export function SeatLegend() {
  return (
    <ul className="flex justify-center gap-6">
      {legend.map(({ label, className }) => (
        <li key={label} className="flex items-center gap-2 text-body-s text-secondary">
          <span aria-hidden className={cn('size-4 rounded-[5px]', className)} />
          {label}
        </li>
      ))}
    </ul>
  )
}
