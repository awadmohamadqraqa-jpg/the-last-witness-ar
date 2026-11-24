import { useEffect, useState } from 'react'

/** Render something only after a delay — used for the cinematic button reveal. */
export function useDelayedRender(delay: number, immediate = false): boolean {
  const [ready, setReady] = useState(immediate)

  useEffect(() => {
    if (immediate) return
    const t = window.setTimeout(() => setReady(true), delay)
    return () => window.clearTimeout(t)
  }, [delay, immediate])

  return ready
}
