import { format, parseISO } from 'date-fns'
import { cn } from '@/shared/lib/cn'

type DayPickerProps = {
  dates: string[]
  selected: string
  /** Days with no sessions are disabled. */
  availableDates: string[]
  onSelect: (date: string) => void
}

export function DayPicker({ dates, selected, availableDates, onSelect }: DayPickerProps) {
  return (
    <div className="flex gap-1.75">
      {dates.map((date) => {
        const day = parseISO(date)
        const isSelected = date === selected
        return (
          <button
            key={date}
            type="button"
            aria-pressed={isSelected}
            aria-label={format(day, 'EEEE d MMMM')}
            disabled={!isSelected && !availableDates.includes(date)}
            onClick={() => onSelect(date)}
            className={cn(
              // The selected day widens from 80 to 109px, as in Figma's prototype (200 ms).
              'flex h-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl transition-[width,background-color] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40',
              isSelected ? 'w-27.25 bg-red' : 'w-20 bg-card',
            )}
          >
            <span className="text-label-s">{format(day, 'EEE')}</span>
            <span className="text-h3">{format(day, 'd')}</span>
          </button>
        )
      })}
    </div>
  )
}
