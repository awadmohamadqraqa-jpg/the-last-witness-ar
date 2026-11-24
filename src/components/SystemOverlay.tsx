import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, Radio, ShieldAlert } from 'lucide-react'
import type { StoryEvent } from '@/data/types'
import { cn } from '@/lib/cn'
import { SCENES } from '@/engine/scenes'

interface SystemOverlayProps {
  event: StoryEvent | null
  onDone: () => void
  reducedFlash?: boolean
  reducedMotion?: boolean
}

/**
 * Full-screen system interruption played between questions.
 * Tone drives the colour: cold = facility blue, danger = red alert,
 * blackout = the room loses its light entirely.
 */
export function SystemOverlay({ event, onDone, reducedFlash = false, reducedMotion = false }: SystemOverlayProps) {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (!event) return
    setLineIndex(0)
    const perLine = Math.max(560, Math.min(1400, event.duration / (event.lines.length + 1)))
    const timers: number[] = []
    event.lines.forEach((_, i) => {
      timers.push(window.setTimeout(() => setLineIndex(i), perLine * (i + 1)))
    })
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [event])

  /* never trap the visitor inside an event */
  useEffect(() => {
    if (!event) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onDone()
      }
    }
    window.addEventListener('keydown', onKey)
    const timeout = window.setTimeout(onDone, event.duration + 6200)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timeout)
    }
  }, [event, onDone])

  const tone = event?.tone ?? 'cold'
  const accent =
    tone === 'danger' ? 'var(--color-danger)' : tone === 'blackout' ? '#4a4c53' : 'var(--color-surveil)'

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          role="status"
          aria-live="polite"
        >
          <div
            className={cn(
              'absolute inset-0 cursor-pointer',
              tone === 'blackout' ? 'bg-ink' : 'bg-ink/92',
              tone === 'danger' && 'bg-[#0b0406]/95',
            )}
            onClick={onDone}
            aria-hidden="true"
          />
          {/* Every interruption now shows its own room behind the warning,
              so the escalation is visible, not just read. */}
          {event.scene && tone !== 'blackout' && (
            <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: reducedMotion ? 0.23 : 0.32 }} transition={{ duration: reducedMotion ? 0 : 1.4 }}>
              <img src={SCENES[event.scene ?? 'ev-camera-frame'].small} alt="" className="h-full w-full object-cover" style={{ filter: 'blur(8px) grayscale(1) brightness(.5)' }} />
              <div className="absolute inset-0 bg-ink/55" />
            </motion.div>
          )}
          {tone !== 'blackout' && <div className="layer-grain pointer-events-none absolute inset-0 opacity-25" />}
          {tone === 'danger' && !reducedFlash && !reducedMotion && (
            <motion.div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(70% 50% at 50% 50%, rgba(163,19,32,0.22), transparent 72%)' }}
              animate={{ opacity: [0.5, 1, 0.6] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <motion.div
            className="relative w-full max-w-lg text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div
              className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              {tone === 'danger' ? <ShieldAlert size={20} /> : tone === 'blackout' ? <Radio size={20} /> : <Activity size={20} />}
            </div>

            <div className="mb-2 text-[10px] tracking-[0.34em]" style={{ color: accent }}>
              {tone === 'danger' ? 'تنبيه' : tone === 'blackout' ? 'انقطاع الإشارة' : 'إشعار النظام'}
            </div>

            <h2
              className="mb-6 text-xl font-semibold sm:text-2xl"
              style={{ color: tone === 'blackout' ? 'var(--color-fg-dim)' : 'var(--color-fg)' }}
            >
              {event.title}
            </h2>

            <div className="space-y-2.5">
              {event.lines.map((line, i) => (
                <motion.p
                  key={`${event.id}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i <= lineIndex ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'text-sm leading-relaxed',
                    i === event.lines.length - 1 ? 'text-fg' : 'text-fg-dim',
                  )}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.max(1.2, event.duration / 1000 - 1.1) }}
              className="mt-9 flex items-center justify-center gap-4"
            >
              <span className="tabular text-[10px] tracking-[0.3em] text-fg-dim/60">مفتاح الهروب</span>
              <button type="button" onClick={onDone} className="btn btn-ghost min-h-11 px-5 text-xs">
                تابع
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SystemOverlay
