import { format, parseISO } from 'date-fns'
import { cn } from '@/shared/lib/cn'

type DateStripProps = {
  dates: string[]
  selected: string
  onSelect: (date: string) => void
}

export function DateStrip({ dates, selected, onSelect }: DateStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
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
              'flex h-13.5 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 text-label-s shadow-[0_1px_2px_var(--color-shadow)] transition-colors duration-300 ease-out',
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
