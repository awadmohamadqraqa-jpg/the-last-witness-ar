import type { SceneKey } from '@/data/types'

import landing from '@/assets/scenes/landing.webp'
import landingSm from '@/assets/scenes/landing-sm.webp'
import corridor from '@/assets/scenes/corridor.webp'
import corridorSm from '@/assets/scenes/corridor-sm.webp'
import mirrorRoom from '@/assets/scenes/mirror-room.webp'
import mirrorRoomSm from '@/assets/scenes/mirror-room-sm.webp'
import surveillance from '@/assets/scenes/surveillance.webp'
import surveillanceSm from '@/assets/scenes/surveillance-sm.webp'
import door from '@/assets/scenes/door.webp'
import doorSm from '@/assets/scenes/door-sm.webp'
import archive from '@/assets/scenes/archive.webp'
import archiveSm from '@/assets/scenes/archive-sm.webp'
import evOldPhoto from '@/assets/scenes/ev-old-photo.webp'
import evOldPhotoSm from '@/assets/scenes/ev-old-photo-sm.webp'
import evMissingReport from '@/assets/scenes/ev-missing-report.webp'
import evMissingReportSm from '@/assets/scenes/ev-missing-report-sm.webp'
import evCameraFrame from '@/assets/scenes/ev-camera-frame.webp'
import evCameraFrameSm from '@/assets/scenes/ev-camera-frame-sm.webp'
import evHandwritten from '@/assets/scenes/ev-handwritten.webp'
import evHandwrittenSm from '@/assets/scenes/ev-handwritten-sm.webp'
import crimeScene from '@/assets/scenes/crime-scene.webp'
import crimeSceneSm from '@/assets/scenes/crime-scene-sm.webp'
import screamingFigure from '@/assets/scenes/screaming-figure.webp'
import screamingFigureSm from '@/assets/scenes/screaming-figure-sm.webp'
import evidenceWall from '@/assets/scenes/evidence-wall.webp'
import evidenceWallSm from '@/assets/scenes/evidence-wall-sm.webp'

export const SCENES: Record<SceneKey, { full: string; small: string }> = {
  landing: { full: landing, small: landingSm },
  corridor: { full: corridor, small: corridorSm },
  'mirror-room': { full: mirrorRoom, small: mirrorRoomSm },
  surveillance: { full: surveillance, small: surveillanceSm },
  door: { full: door, small: doorSm },
  archive: { full: archive, small: archiveSm },
  'ev-old-photo': { full: evOldPhoto, small: evOldPhotoSm },
  'ev-missing-report': { full: evMissingReport, small: evMissingReportSm },
  'ev-camera-frame': { full: evCameraFrame, small: evCameraFrameSm },
  'ev-handwritten': { full: evHandwritten, small: evHandwrittenSm },
  'crime-scene': { full: crimeScene, small: crimeSceneSm },
  'screaming-figure': { full: screamingFigure, small: screamingFigureSm },
  'evidence-wall': { full: evidenceWall, small: evidenceWallSm },
}

const cache = new Map<SceneKey, HTMLImageElement>()

/** Preload one scene, resolving when decoded (or on error — never blocks). */
export function preloadScene(key: SceneKey): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const existing = cache.get(key)
  if (existing?.complete) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      cache.set(key, img)
      resolve()
    }
    img.onerror = () => resolve()
    img.src = SCENES[key].full
    cache.set(key, img)
  })
}

/** Warm the next couple of backdrops without blocking the UI. */
export function preloadScenes(keys: SceneKey[]): void {
  keys.forEach((k) => {
    void preloadScene(k)
  })
}
