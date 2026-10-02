import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type MovieSectionProps = {
  title: string
  uppercase?: boolean
  /** Smaller header spacing, as Figma draws the "Recently viewed" row. */
  compact?: boolean
  /** Faint inner shadow along the row's edges (Figma draws it on Now Playing only). */
  innerShadow?: boolean
  action?: ReactNode
  rowClassName?: string
  children: ReactNode
}

export function MovieSection({
  title,
  uppercase,
  compact,
  innerShadow,
  action,
  rowClassName,
  children,
}: MovieSectionProps) {
  return (
    <section className={cn('flex flex-col', compact ? 'gap-5 pt-2.25' : 'gap-6')}>
      <div className="flex items-end justify-between gap-6 px-17.5">
        <h2 className={cn('text-h1', uppercase && 'uppercase')}>{title}</h2>
        {action}
      </div>

      {/* As in Figma, the row is clipped 70px in from the page edges. The shadow layer sits behind
          the cards (-z-10); `isolate` keeps it above the page background. */}
      <div className="relative isolate mx-17.5">
        {innerShadow && (
          <div className="pointer-events-none absolute inset-0 -z-10 shadow-[inset_0_0_4px_var(--color-shadow)]" />
        )}
        {/* Vertical padding keeps hover shadows from being clipped by the scroll container; the
            negative margin cancels it. The thin scrollbar (10px) is always reserved, so a row is
            equally tall whether or not it overflows. */}
        <div
          className={cn(
            '-my-6 flex [scrollbar-width:thin] [scrollbar-color:var(--color-raised)_transparent] overflow-x-scroll pt-6 pb-3.5',
            rowClassName,
          )}
        >
          {children}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-45 bg-linear-to-l from-page" />
      </div>
    </section>
  )
}
