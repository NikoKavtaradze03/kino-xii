import { format, parseISO } from 'date-fns'
import { cn } from '@/shared/lib/cn'

type DateStripProps = {
  dates: string[]
  selected: string
  onSelect: (date: string) => void
}

export function DateStrip({ dates, selected, onSelect }: DateStripProps) {
  return (
    // As in Figma, the 37px pills run into the sidebar's right padding (-mr-6). The row scrolls like
    // the Home rows if they ever overflow; the vertical padding keeps their shadow from being clipped.
    <div className="-my-1 -mr-6 flex [scrollbar-width:none] gap-1.5 overflow-x-auto py-1">
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
  )
}
