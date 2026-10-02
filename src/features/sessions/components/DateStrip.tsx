import { format, parseISO } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'

type DateStripProps = {
  dates: string[]
  selected: string
  onSelect: (date: string) => void
}

/** Figma's seven 37px pills are wider than the sidebar, so the row scrolls like the Home rows. */
export function DateStrip({ dates, selected, onSelect }: DateStripProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [scrolledToEnd, setScrolledToEnd] = useState(false)

  // Bring the selected day into view, e.g. the last day opened from a shared link.
  useEffect(() => {
    const row = rowRef.current
    const pill = row?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!row || !pill) return
    if (pill.offsetLeft < row.scrollLeft) {
      row.scrollLeft = pill.offsetLeft
    } else if (pill.offsetLeft + pill.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = pill.offsetLeft + pill.offsetWidth - row.clientWidth
    }
  }, [selected])

  return (
    <div className="relative">
      {/* The vertical padding keeps the pills' shadow from being clipped by the scroll container. */}
      <div
        ref={rowRef}
        onScroll={({ currentTarget: row }) =>
          setScrolledToEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 1)
        }
        className="relative -my-1 flex [scrollbar-width:none] gap-1.5 overflow-x-auto py-1"
      >
        {dates.map((date) => {
          const day = parseISO(date)
          const isSelected = date === selected
          return (
            <button
              key={date}
              type="button"
              aria-pressed={isSelected}
              aria-label={format(day, 'EEEE d MMMM')}
              onClick={() => onSelect(date)}
              className={cn(
                'flex h-13.5 w-9.25 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 text-label-s shadow-[0_1px_2px_var(--color-shadow)] transition-colors duration-300 ease-out',
                isSelected ? 'bg-red' : 'bg-raised hover:bg-card',
              )}
            >
              <span>{format(day, 'EEE')}</span>
              <span>{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-card transition-opacity duration-300',
          scrolledToEnd && 'opacity-0',
        )}
      />
    </div>
  )
}
