import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

/** The first and last pages and the current one with its neighbours; "..." marks skipped pages. */
function pageItems(page: number, pageCount: number) {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b)

  return pages.flatMap((p, i): (number | 'gap')[] => {
    const previous = pages[i - 1]
    if (i === 0 || p - previous === 1) return [p]
    // A gap of exactly one page shows that page instead of "...".
    return p - previous === 2 ? [previous + 1, p] : ['gap', p]
  })
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
