import type { ReactNode } from 'react'

/** Figma's orange "Rating note" box; the age-gate message reuses its look. */
export function NoteBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.75 rounded-xl bg-tint-orange px-3.25 py-2.25 text-orange">
      {children}
    </div>
  )
}
