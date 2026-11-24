import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ListChecks } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import HudBar from '@/components/HudBar'
import ProgressMeter from '@/components/ProgressMeter'
import QuestionCard from '@/components/QuestionCard'
import SystemOverlay from '@/components/SystemOverlay'
import EvidenceArchive from '@/components/EvidenceArchive'
import { ConfirmDialog } from '@/components/Controls'
import { stageOfQuestion } from '@/data/questions'
import { TEST } from '@/data/story'
import type { AnswerId, StoryEvent } from '@/data/types'
import { eventAfter } from '@/data/events'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'

const STAGE_DIM = [0.04, 0.1, 0.16, 0.22, 0.3]

/**
 * PAGE 04 — the interview.
 * One question at a time, on top of the room. Answering the last question
 * hands the visitor to the archive, not to a results screen.
 */
export default function TestPage() {
  const navigate = useNavigate()
  const { progress, currentQuestion, totalQuestions, answer, markEventSeen, setPhase } = useGameContext()
  const { settings } = useSettingsContext()

  const [selected, setSelected] = useState<AnswerId | null>(null)
  const [busy, setBusy] = useState(false)
  const [activeEvent, setActiveEvent] = useState<StoryEvent | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)

  const stage = useMemo(() => stageOfQuestion(currentQuestion.id), [currentQuestion.id])
  const stageIndex = ['calm', 'doubt', 'surveillance', 'confrontation', 'revelation'].indexOf(stage.id)

  /* ambience follows the stage */
  useEffect(() => {
    setPhase('test')
    if (settings.muted) return
    audio.loop('ambience-room', 1600)
    if (stageIndex >= 2) audio.loop('drone-tension', 2600)
    if (stageIndex >= 3) audio.loop('heartbeat', 3200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, settings.muted])

  /* resuming a finished session goes straight to the archive */
  useEffect(() => {
    if (progress.answers.length >= totalQuestions && !progress.ending && !activeEvent && !busy) {
      navigate('/archive', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.answers.length, activeEvent, busy])

  const handleConfirm = useCallback(() => {
    if (!selected || busy) return
    const q = currentQuestion
    const ev = eventAfter(q.id)
    setBusy(true)
    audio.play('ui-select')

    window.setTimeout(() => {
      answer(selected)
      setSelected(null)
      if (ev) {
        markEventSeen(ev.id)
        setActiveEvent(ev)
        if (ev.id === 'event-6-blackout') audio.stopAll(600)
        if (ev.sound) audio.play(ev.sound as never)
      }
      if (!ev && q.id === totalQuestions) {
        audio.play('door-metal')
        navigate('/archive')
      }
      setBusy(false)
    }, 420)
  }, [answer, busy, currentQuestion, markEventSeen, navigate, selected, totalQuestions])

  const handleEventDone = () => {
    const wasFinal = activeEvent?.id === 'event-7-revelation'
    setActiveEvent(null)
    if (wasFinal) navigate('/archive')
  }

  /* Escape closes overlays / opens the exit dialog */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (archiveOpen) setArchiveOpen(false)
      else if (!activeEvent) setExitOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [archiveOpen, activeEvent])

  const leaveSession = () => {
    audio.stopAll(900)
    setExitOpen(false)
    navigate('/')
  }

  const dark = activeEvent?.tone === 'blackout'

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop
        scene={stage.scene}
        dim={dark ? 0.94 : STAGE_DIM[Math.max(0, stageIndex)]}
        emergency={stageIndex >= 3 && !settings.reducedFlash}
      />

      <HudBar
        location={`المرحلة ${stageIndex + 1} — ${stage.title}`}
        showArchive
        onOpenArchive={() => setArchiveOpen(true)}
        onExit={() => setExitOpen(true)}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6 sm:px-6">
        <ProgressMeter
          current={currentQuestion.id}
          total={totalQuestions}
          stage={stage.id}
          className="mb-8 mt-1 sm:mb-12"
        />

        <div className="flex flex-1 flex-col justify-center pb-4">
          <QuestionCard
            question={currentQuestion}
            selected={selected}
            onSelect={(id) => {
              if (busy) return
              setSelected(id)
              audio.play('ui-select')
            }}
            onConfirm={handleConfirm}
            disabled={busy}
            reducedMotion={settings.reducedMotion}
          />
        </div>

        {/* transcript strip */}
        <TranscriptStrip />
      </div>

      <SystemOverlay event={activeEvent} onDone={handleEventDone} reducedFlash={settings.reducedFlash} reducedMotion={settings.reducedMotion} />

      <EvidenceArchive
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        discovered={progress.discovered}
      />

      <ConfirmDialog
        open={exitOpen}
        title={TEST.exitConfirmTitle}
        body={TEST.exitConfirmBody}
        confirmLabel={TEST.exitConfirmLeave}
        cancelLabel={TEST.exitConfirmStay}
        onConfirm={leaveSession}
        onCancel={() => setExitOpen(false)}
      />
    </main>
  )
}

/** The last three answers, printed like an interrogation transcript. */
function TranscriptStrip() {
  const { progress } = useGameContext()
  const [open, setOpen] = useState(false)
  const last = progress.answers.slice(-3)

  useEffect(() => {
    if (progress.answers.length === 0) setOpen(false)
  }, [progress.answers.length])

  if (progress.answers.length === 0) return null

  return (
    <div className="mt-2 border-t border-surveil/15 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-[10.5px] tracking-[0.18em] text-fg-dim/60 transition-colors hover:text-fg-dim"
      >
        <span className="flex items-center gap-1.5">
          <ListChecks size={12} />
          {open ? TEST.hideTranscript : TEST.showTranscript}
        </span>
        <span className="tabular ltr">{progress.answers.length} / 15</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            {last.map((a) => (
              <li
                key={a.questionId}
                className="flex items-baseline justify-between gap-3 border-b border-surveil/10 py-1.5 text-[11px] last:border-0"
              >
                <span className="tabular ltr shrink-0 text-fg-dim/50">
                  السؤال {a.questionId}
                </span>
                <span className="flex-1 truncate text-fg-dim/85">{a.label}</span>
                <span className="tabular shrink-0 text-[10px] text-surveil/60">مسجّل</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
