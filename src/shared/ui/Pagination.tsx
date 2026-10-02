import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

const MAX_SLOTS = 5

/**
 * Always five slots, as in Figma (page 3 of 10 shows "1 2 3 ... 10"), so the pager keeps its width:
 * near the start "1 2 3 ... n", near the end "1 ... n-2 n-1 n", otherwise "1 ... p ... n".
 */
function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= MAX_SLOTS) return Array.from({ length: pageCount }, (_, i) => i + 1)
  if (page <= 3) return [1, 2, 3, 'gap', pageCount]
  if (page >= pageCount - 2) return [1, 'gap', pageCount - 2, pageCount - 1, pageCount]
  return [1, 'gap', page, 'gap', pageCount]
}

const cellClasses =
  'flex size-10 items-center justify-center rounded-full text-label-m transition-colors duration-300 ease-out'

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const arrowClasses = cn(
    cellClasses,
    'cursor-pointer bg-card text-secondary hover:bg-raised disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card',
  )

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={arrowClasses}
      >
        <Icon name="arrow-left" />
      </button>

      {pageItems(page, pageCount).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className={cn(cellClasses, 'text-secondary')}>
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              cellClasses,
              'cursor-pointer',
              item === page ? 'bg-red text-primary' : 'text-secondary hover:bg-raised',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className={arrowClasses}
      >
        <Icon name="arrow-left" className="rotate-180" />
      </button>
    </nav>
  )
}
