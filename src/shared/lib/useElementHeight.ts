import { useCallback, useState } from 'react'

/** Attach `ref` to an element to get its current height; updates whenever the element resizes. */
export function useElementHeight<T extends HTMLElement>() {
  const [height, setHeight] = useState(0)

  const ref = useCallback((element: T | null) => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, height] as const
}
