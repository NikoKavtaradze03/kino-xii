import { useEffect, useState } from 'react'

/** Whole seconds until `until` (an ISO time), updated four times a second. */
export function useSecondsLeft(until: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(interval)
  }, [])

  return Math.max(0, Math.ceil((Date.parse(until) - now) / 1000))
}
