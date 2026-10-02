import { useState, type CSSProperties } from 'react'
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
// Figma's map at full size. Seats shrink to fit a wide hall into the map or a tall one into the
// window, and the gaps and corners below shrink with them (`var(--seat) * px / 52` in the classes).
const SEAT = 52
const SEAT_GAP = 8
const AISLE = 16
const ROW_GAP = 10
const HEADING_GAP = 24
const SECTION_GAP = 32
// Everything in the modal around the sections that does not scale (header, step pills, screen,
// legend, paddings, window margin), and each section heading's line.
const MODAL_CHROME = 359
const HEADING = 13

function seatSize(seatMap: SeatMapData) {
  const rows = seatMap.sections.flatMap((section) => section.rows)
  const sections = seatMap.sections.length

  // Row width = label + seats + scaled gaps and aisles, all but the label in units of one seat.
  const widthFit = Math.min(
    ...rows.map(({ seats }) => {
      const aisles = seats.slice(0, -1).filter((seat) => seat.aisleAfter).length
      const seatUnits = seats.length + (SEAT_GAP * (seats.length + aisles) + AISLE * aisles) / SEAT
      return Math.floor((MAP_WIDTH - ROW_LABEL) / seatUnits)
    }),
  )

  const scaledGaps =
    ROW_GAP * (rows.length - sections) + HEADING_GAP * sections + SECTION_GAP * (sections - 1)
  const heightUnits = (rows.length + scaledGaps / SEAT).toFixed(3)
  const fixedHeight = MODAL_CHROME + HEADING * sections

  return `max(28px, min(${SEAT}px, ${widthFit}px, calc((100dvh - ${fixedHeight}px) / ${heightUnits})))`
}

function rowRange(rows: { label: string }[]) {
  const first = rows[0]?.label
  const last = rows.at(-1)?.label
  return first === last ? `Row ${first}` : `Rows ${first}-${last}`
}

const RIPPLE_MS_PER_SEAT = 16
// In the prototype the wave travels down the rows at about half the speed it travels along them.
const RIPPLE_ROW_WEIGHT = 1.8

/**
 * Entrance delay of every seat: seats appear in a wave spreading out from the middle of the front
 * row, as in the prototype. Distances are in seat widths, measured on the drawn map.
 */
function rippleDelays(seatMap: SeatMapData) {
  const delays = new Map<number, number>()
  const rowPitch = 1 + ROW_GAP / SEAT
  const sectionPitch = (HEADING + HEADING_GAP + SECTION_GAP) / SEAT
  let y = 0

  seatMap.sections.forEach((section, sectionIndex) => {
    section.rows.forEach((row) => {
      const xs: number[] = []
      let x = 0
      for (const seat of row.seats) {
        xs.push(x + 0.5)
        x += 1 + SEAT_GAP / SEAT + (seat.aisleAfter ? (AISLE + SEAT_GAP) / SEAT : 0)
      }
      const middle = (x - SEAT_GAP / SEAT) / 2
      row.seats.forEach((seat, index) => {
        const distance = Math.hypot(xs[index] - middle, y * RIPPLE_ROW_WEIGHT)
        delays.set(seat.id, Math.round(distance * RIPPLE_MS_PER_SEAT))
      })
      y += rowPitch
    })
    if (sectionIndex < seatMap.sections.length - 1) y += sectionPitch - ROW_GAP / SEAT
  })
  return delays
}

type SeatMapProps = {
  seatMap: SeatMapData
  selectedIds: number[]
  lostCodes: string[]
  /** Play the entrance ripple; only the first time the map is shown. */
  ripple: boolean
  onToggle: (seat: Seat) => void
}

export function SeatMap({ seatMap, selectedIds, lostCodes, ripple, onToggle }: SeatMapProps) {
  const [delays] = useState(() => (ripple ? rippleDelays(seatMap) : null))

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
      <div className="flex flex-col gap-[calc(var(--seat)*32/52)]">
        {seatMap.sections.map((section) => (
          <section
            key={section.name}
            aria-label={section.name}
            className="flex flex-col gap-[calc(var(--seat)*24/52)]"
          >
            <h3 className="text-center text-label-s text-secondary uppercase">
              {section.name} · {rowRange(section.rows)}
            </h3>
            <div className="flex flex-col items-center gap-[calc(var(--seat)*10/52)]">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-[calc(var(--seat)*8/52)]">
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
                          style={
                            delays ? { animationDelay: `${delays.get(seat.id)}ms` } : undefined
                          }
                          className={cn(
                            'flex size-(--seat) shrink-0 items-center justify-center rounded-[calc(var(--seat)*10/52)] text-button',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            delays && 'animate-seat-in motion-reduce:animate-none',
                            seatClasses[look],
                          )}
                        >
                          {seat.label}
                        </button>
                      ),
                      seat.aisleAfter && (
                        <span
                          key={`${seat.id}-aisle`}
                          aria-hidden
                          className="w-[calc(var(--seat)*16/52)] shrink-0"
                        />
                      ),
                    ]
                  })}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
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
