import { useEffect, useState } from 'react'

/** Detects slow connections / small devices so we can serve the -sm backdrops. */
export function useLightAssets(): boolean {
  const [light, setLight] = useState(false)

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
    const saveData = nav.connection?.saveData === true
    const slow = /(^|-)2g$/.test(nav.connection?.effectiveType ?? '')
    const smallScreen = window.matchMedia('(max-width: 720px)').matches
    setLight(Boolean(saveData || slow || smallScreen))
  }, [])

  return light
}
