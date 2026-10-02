import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type MovieSectionProps = {
  title: string
  uppercase?: boolean
  /** Smaller header spacing, as Figma draws the "Recently viewed" row. */
  compact?: boolean
  action?: ReactNode
  /** Wraps the cards onto several lines instead of one scrolling row. */
  wrap?: boolean
  rowClassName?: string
  children: ReactNode
}

export function MovieSection({
  title,
  uppercase,
  compact,
  action,
  wrap,
  rowClassName,
  children,
}: MovieSectionProps) {
  return (
    <section className={cn('flex flex-col', compact ? 'gap-5 pt-2.25' : 'gap-6')}>
      <div className="flex items-end justify-between gap-6 px-17.5">
        <h2 className={cn('text-h1', uppercase && 'uppercase')}>{title}</h2>
        {action}
      </div>

      {/* As in Figma, the row is clipped 70px in from the page edges and has a faint inner shadow
          (the -z-10 layer sits behind the cards; `isolate` keeps it above the page background). */}
      <div className="relative isolate mx-17.5">
        <div className="pointer-events-none absolute inset-0 -z-10 shadow-[inset_0_0_4px_var(--color-shadow)]" />
        {/* Vertical padding keeps hover shadows from being clipped by the scroll container; the
            negative margin cancels it. The thin scrollbar (10px) is always reserved, so a row is
            equally tall whether or not it overflows. */}
        <div
          className={cn(
            '-my-6 flex pt-6',
            wrap
              ? 'flex-wrap pb-6'
              : '[scrollbar-width:thin] [scrollbar-color:var(--color-raised)_transparent] overflow-x-scroll pb-3.5',
            rowClassName,
          )}
        >
          {children}
        </div>
        {!wrap && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-45 bg-linear-to-l from-page" />
        )}
      </div>
    </section>
  )
}
