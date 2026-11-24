import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { SceneKey } from '@/data/types'
import { SCENES, preloadScene } from '@/engine/scenes'
import { cn } from '@/lib/cn'
import { useLightAssets } from '@/hooks/usePrefersReducedData'

interface CinematicBackdropProps {
  scene: SceneKey
  /** Additional classes on the <img>. */
  className?: string
  /** Camera push animation (disabled under reduced-motion). */
  push?: boolean
  /** Overlay darkness, 0..1 — the room gets darker as the session goes on. */
  dim?: number
  /** Red emergency wash. */
  emergency?: boolean
  /** Distortion filter class, e.g. 'glitch-active'. */
  fx?: string
}

/**
 * The photographic layer. Cross-fades between scenes, keeps film grain,
 * scanlines, fog and vignette on top so every page shares the same look.
 */
export function CinematicBackdrop({
  scene,
  className,
  push = true,
  dim = 0,
  emergency = false,
  fx,
}: CinematicBackdropProps) {
  const light = useLightAssets()
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const src = light ? SCENES[scene].small : SCENES[scene].full
    const img = new Image()
    img.onload = () => {
      if (mounted.current) setLoaded((l) => (l[src] ? l : { ...l, [src]: true }))
    }
    img.src = src
    void preloadScene(scene)
  }, [scene, light])

  const src = light ? SCENES[scene].small : SCENES[scene].full

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden bg-ink', className)} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <img
            src={src}
            alt=""
            decoding="async"
            loading="eager"
            className={cn(
              'h-full w-full object-cover',
              push && 'camera-push',
              fx,
              !loaded[src] && 'opacity-0',
              'transition-opacity duration-700',
            )}
            style={{ filter: 'saturate(0.85) contrast(1.05) brightness(0.82)' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* cold grade + falloff so text always sits on darkness */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_10%,rgba(8,9,12,0.55)_62%,rgba(8,9,12,0.92)_100%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-ink/85 via-ink/25 to-ink/95" />
      {dim > 0 && <div className="absolute inset-0 bg-ink" style={{ opacity: dim }} />}
      {emergency && (
        <motion.div
          className="absolute inset-0 mix-blend-color-dodge"
          style={{ background: 'radial-gradient(80% 60% at 50% 50%, rgba(163,19,32,0.28), transparent 70%)' }}
          animate={{ opacity: [0.35, 0.7, 0.4] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="layer-fog" />
      <div className="layer-vignette" />
      <div className="layer-grain" />
      <div className="layer-scanlines" />
    </div>
  )
}

export default CinematicBackdrop
