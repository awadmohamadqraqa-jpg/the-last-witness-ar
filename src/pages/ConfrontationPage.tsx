import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { DoorOpen, Eye, FileText } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import HudBar from '@/components/HudBar'
import { CONFRONTATION } from '@/data/story'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { cn } from '@/lib/cn'

type ChoiceId = (typeof CONFRONTATION.choices)[number]['id']

const ICONS: Record<ChoiceId, typeof DoorOpen> = {
  'open-file': FileText,
  'open-door': DoorOpen,
  'look-mirror': Eye,
}

/**
 * The final room. Three ways to be in it — and each one changes what the
 * revelation says about you.
 */
export default function ConfrontationPage() {
  const navigate = useNavigate()
  const { progress, setPhase, patch } = useGameContext()
  const { settings } = useSettingsContext()
  const [choice, setChoice] = useState<ChoiceId | null>(null)
  const [committing, setCommitting] = useState(false)

  useEffect(() => {
    setPhase('confrontation')
    if (settings.muted) return
    audio.stopLoop('ambience-room', 2000)
    audio.loop('reveal-score', 2600)
    audio.play('flicker')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirm = () => {
    if (!choice || committing) return
    setCommitting(true)
    // Each door into the truth sounds different: you either face it (scream),
    // leave it (metal), or hear it happen to someone else (distant).
    if (choice === 'look-mirror') audio.play('scream-close')
    else if (choice === 'open-door') audio.play('door-scream')
    else audio.play('sting-crime')
    // The confrontation choice is recorded as the final beat of the record.
    patch({
      confrontationChoice: choice,
      seenEvents: progress.seenEvents.includes('event-7-revelation')
        ? progress.seenEvents
        : [...progress.seenEvents, 'event-7-revelation'],
    })
    window.setTimeout(() => navigate('/revelation'), 900)
  }

  const dark = choice === 'open-door'

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop
        scene={choice === 'look-mirror' ? 'mirror-room' : 'door'}
        dim={dark ? 0.08 : 0.14}
        emergency={!settings.reducedFlash}
      />
      <HudBar location="القاعة — المواجهة الأخيرة" showArchive={false} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(8,9,12,0.55),transparent_75%)]" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.3em] text-danger-soft/80">
            <span className="h-1 w-1 animate-pulse rounded-full bg-danger" />
            القرار الأخير
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-fg sm:text-3xl">{CONFRONTATION.title}</h1>
          <p className="mb-1 text-[13px] text-fg-dim">{CONFRONTATION.subtitle}</p>
          <p className="mb-7 text-[15px] leading-relaxed text-fg/90">{CONFRONTATION.prompt}</p>
        </motion.div>

        <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={CONFRONTATION.prompt}>
          {CONFRONTATION.choices.map((c, i) => {
            const Icon = ICONS[c.id]
            const active = choice === c.id
            return (
              <motion.button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-selected={active}
                onClick={() => {
                  setChoice(c.id)
                  audio.play('ui-select')
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.09 }}
                className={cn('option items-start py-4', active && 'shadow-[0_0_0_1px_rgba(163,19,32,0.35)]')}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[2px] border',
                    active ? 'border-danger/70 text-danger-soft' : 'border-surveil/35 text-surveil',
                  )}
                  aria-hidden="true"
                >
                  <Icon size={15} />
                </span>
                <span className="flex-1">
                  <span className="block text-[14.5px] leading-relaxed text-fg">{c.title}</span>
                  <span className="mt-1 block text-[11.5px] leading-relaxed text-fg-dim">{c.body}</span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          <motion.div
            initial={false}
            animate={{ opacity: choice ? 1 : 0.35 }}
            className="mt-7 flex items-center justify-between gap-3"
          >
            <span className="text-[10.5px] text-fg-dim/60">
              {choice ? 'القرار يُسجّل في ملفك النهائي.' : 'لم تختر بعد.'}
            </span>
            <button
              type="button"
              onClick={confirm}
              disabled={!choice || committing}
              className="btn btn-primary min-w-[168px] text-sm"
            >
              {committing ? 'جارٍ فتح الملف…' : CONFRONTATION.continue}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
