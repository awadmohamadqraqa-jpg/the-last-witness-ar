import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, SkipForward } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import HudBar from '@/components/HudBar'
import { REVELATION } from '@/data/story'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'
import { TOTAL_EVIDENCE } from '@/data/evidence'

/**
 * The revelation sequence.
 * Deliberately slow: one beat at a time, no way to rush past the first
 * line, and the ending is computed only when the visitor asks for it.
 */
export default function RevelationPage() {
  const navigate = useNavigate()
  const { progress, setPhase, finish } = useGameContext()
  const { settings } = useSettingsContext()
  const [index, setIndex] = useState(-1)
  const [done, setDone] = useState(false)
  const timer = useRef<number | null>(null)

  const beats = useMemo(() => {
    const personal = progress.confrontationChoice
      ? REVELATION.personalBeat[progress.confrontationChoice]
      : undefined
    return personal ? [...REVELATION.beats, personal] : REVELATION.beats
  }, [progress.confrontationChoice])
  const reduced = settings.reducedMotion

  useEffect(() => {
    setPhase('revelation')
    if (!settings.muted) {
      audio.stopLoop('heartbeat', 1200)
      audio.stopLoop('drone-tension', 1800)
      audio.loop('reveal-score', 2400)
    }
    const t = window.setTimeout(() => setIndex(0), 900)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* auto-advance the beats unless the visitor is driving manually */
  useEffect(() => {
    if (index < 0 || done) return
    timer.current = window.setTimeout(() => {
      if (index < beats.length - 1) setIndex((i) => i + 1)
      else {
        setDone(true)
        audio.play('heart-stop')
      }
    }, Math.max(4200, beats[index].length * 62))
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [index, done, beats])

  const advance = () => {
    if (timer.current) window.clearTimeout(timer.current)
    if (index < beats.length - 1) setIndex((i) => i + 1)
    else {
      setDone(true)
      audio.play('heart-stop')
    }
  }

  const reveal = () => {
    audio.play('door-metal')
    finish()
    window.setTimeout(() => navigate('/ending', { replace: true }), 600)
  }

  const counter = useMemo(
    () => `${toArabicDigits(Math.max(1, index + 1))} / ${toArabicDigits(beats.length)}`,
    [index, beats.length],
  )

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop scene={done ? 'crime-scene' : 'evidence-wall'} dim={done ? 0.62 : 0.4} push={!reduced} />
      <HudBar location="الانكشاف" showArchive={false} />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10">
        <AnimatePresence mode="wait">
          {index < 0 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {REVELATION.intro.map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9, delay: 0.25 + i * 0.55 }}
                  className={cn(
                    'title-shadow leading-relaxed',
                    i === REVELATION.intro.length - 1
                      ? 'mt-4 text-xl font-medium text-fg sm:text-2xl'
                      : 'text-sm text-fg-dim',
                  )}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          ) : done ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="panel w-full max-w-lg rounded-[3px] p-6 text-center sm:p-8"
            >
              <div className="mb-3 text-[10px] tracking-[0.34em] text-surveil">اكتمل الملف</div>
              <h1 className="mb-3 text-2xl font-semibold text-fg sm:text-3xl">{REVELATION.title}</h1>
              <p className="mb-5 text-[12.5px] leading-loose text-fg-dim">
                كل ما قرأته الآن سيُطابق مع إجاباتك. تقريرك النهائي جاهز — لكن لا يمكن التراجع عنه بعد فتحه.
              </p>
              <div className="mb-6 rounded-[2px] border border-surveil/20 bg-ink/50 px-4 py-3 text-[11.5px] text-fg-dim">
                {REVELATION.evidenceNote(toArabicDigits(progress.discovered.length), toArabicDigits(TOTAL_EVIDENCE))}
              </div>
              <button type="button" onClick={reveal} className="btn btn-primary w-full text-sm">
                {REVELATION.readyLabel}
                <ChevronLeft size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: reduced ? 0.25 : 0.9, ease: [0.22, 0.61, 0.36, 1] }}
              className="w-full max-w-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="tabular text-[10px] tracking-[0.3em] text-danger-soft/80">{counter}</span>
                <span className="h-px flex-1 bg-linear-to-l from-transparent via-surveil/40 to-transparent" />
              </div>
              <p className="title-shadow text-[19px] leading-[1.85] font-normal text-fg sm:text-[23px] sm:leading-[1.8]">
                {beats[index]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {index >= 0 && !done && (
          <div className="mt-10 flex items-center gap-3">
            <button type="button" onClick={advance} className="btn btn-ghost text-xs">
              <SkipForward size={13} className="rotate-180" />
              التالي
            </button>
            <span className="text-[10px] text-fg-dim/40">اضغط المسافة أو انتظر</span>
          </div>
        )}
      </div>

      <KeyAdvance onAdvance={advance} enabled={index >= 0 && !done} />
    </main>
  )
}

function KeyAdvance({ onAdvance, enabled }: { onAdvance: () => void; enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowLeft') {
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, onAdvance])
  return null
}
