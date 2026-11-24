import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronDown, Clock, FileWarning, Volume2 } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import SoundControl from '@/components/SoundControl'
import { BRAND, LANDING } from '@/data/story'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { preloadScenes } from '@/engine/scenes'
import { cn } from '@/lib/cn'

/**
 * PAGE 01 — the waiting room.
 * One chair, one light, and the sentence the facility has been saving.
 */
export default function LandingPage() {
  const navigate = useNavigate()
  const { progress, startSession, canResume } = useGameContext()
  const { settings } = useSettingsContext()
  const [ready, setReady] = useState(false)
  const [showResume, setShowResume] = useState(false)

  useEffect(() => {
    // Warm the next scenes while the visitor reads the title.
    preloadScenes(['corridor', 'archive'])
    const t = window.setTimeout(() => setReady(true), 2600)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    setShowResume(canResume)
  }, [canResume])

  const begin = () => {
    audio.unlock()
    startSession()
    if (settings.muted) {
      /* the visitor chose silence — respect it */
    } else {
      audio.loop('ambience-room', 2600)
    }
    navigate('/start')
  }

  const resume = () => {
    audio.unlock()
    audio.loop('ambience-room', 1800)
    if (progress.ending) navigate('/ending')
    else if (progress.phase === 'revelation') navigate('/revelation')
    else if (progress.phase === 'confrontation') navigate('/confrontation')
    else if (progress.answers.length >= 15) navigate('/archive')
    else navigate('/session')
  }

  const reduced = settings.reducedMotion

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop scene="landing" />

      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4 }}
          className="flex items-center gap-2.5"
        >
          <span className="relative grid h-7 w-7 place-items-center border border-surveil/40">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
          </span>
          <div>
            <div className="brand-latin text-[8.5px] leading-none text-surveil/90">{BRAND.latin}</div>
            <div className="mt-1 text-[10px] leading-none text-fg-dim/60">{BRAND.facility}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.7 }}>
          <SoundControl variant="icon" />
        </motion.div>
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-6 flex items-center gap-3 text-surveil"
        >
          <span className="h-px w-8 bg-surveil/40" />
          <span className="brand-latin text-[9.5px] sm:text-[11px]">{BRAND.latin}</span>
          <span className="h-px w-8 bg-surveil/40" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.2, delay: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className={cn('title-shadow mb-4 text-[32px] leading-[1.3] font-semibold text-fg sm:text-5xl', !reduced && 'flicker-soft')}
          style={{ textShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 90px rgba(0,0,0,0.75)' }}
        >
          {LANDING.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 1.7 }}
          className="mb-2 max-w-md text-[13.5px] leading-relaxed text-fg-dim sm:text-[15px]"
        >
          {LANDING.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 2.1 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10.5px] tracking-wider text-fg-dim/60"
        >
          <span className="flex items-center gap-1.5">
            <Clock size={11} /> {LANDING.badges[2]}
          </span>
          <span className="h-3 w-px bg-fg-dim/20" />
          <span className="flex items-center gap-1.5">
            <Volume2 size={11} /> {LANDING.badges[1]}
          </span>
          <span className="h-3 w-px bg-fg-dim/20" />
          <span className="flex items-center gap-1.5">
            <FileWarning size={11} /> {LANDING.badges[0]}
          </span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex w-full max-w-xs flex-col items-stretch gap-2.5"
        >
          <button
            type="button"
            onClick={begin}
            className="btn btn-primary group relative w-full overflow-hidden text-[15px] tracking-wide"
          >
            <span className="relative z-10">{LANDING.cta}</span>
            <motion.span
              className="absolute inset-0 z-0 bg-linear-to-l from-transparent via-danger/25 to-transparent"
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
              aria-hidden="true"
            />
          </button>

          {showResume && (
            <button type="button" onClick={resume} className="btn btn-ghost w-full text-xs">
              {LANDING.ctaResume}
            </button>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 3.4 }}
          className="mt-8 max-w-xs text-[10.5px] leading-relaxed text-fg-dim/50"
        >
          {LANDING.note}
        </motion.p>
      </div>

      {/* footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 3 }}
        className="relative z-10 flex flex-col items-center gap-1 px-5 pb-5 text-center"
      >
        <div className="flex items-center gap-2 text-[9.5px] tracking-[0.24em] text-fg-dim/40">
          <span className="tabular">{LANDING.footer}</span>
        </div>
        <ChevronDown size={13} className="mt-1 text-fg-dim/25" aria-hidden="true" />
      </motion.footer>
    </main>
  )
}
