import type { ReactNode } from 'react'
import type { SceneKey } from '@/data/types'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import { cn } from '@/lib/cn'

interface SceneFrameProps {
  scene: SceneKey
  children: ReactNode
  /** Room darkness 0..1 — the deeper into the session, the darker. */
  dim?: number
  emergency?: boolean
  fx?: string
  className?: string
  /** Removes the default max-width content wrapper. */
  bleed?: boolean
}

/** Full-viewport cinematic stage: backdrop photo + content, always 100svh. */
export function SceneFrame({ scene, children, dim = 0, emergency, fx, className, bleed }: SceneFrameProps) {
  return (
    <main className={cn('scene-shell safe-pad flex min-h-[100svh] flex-col', className)}>
      <CinematicBackdrop scene={scene} dim={dim} emergency={emergency} fx={fx} />
      <div className={cn('relative z-10 flex min-h-0 flex-1 flex-col', !bleed && 'mx-auto w-full max-w-5xl')}>
        {children}
      </div>
    </main>
  )
}

export default SceneFrame
