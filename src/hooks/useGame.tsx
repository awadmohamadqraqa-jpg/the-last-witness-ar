import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { AnswerId, EndingId, EvidenceId, Phase, Progress, Scores, StoryEventId } from '@/data/types'
import { QUESTIONS } from '@/data/questions'
import { loadProgress, normalizeProgress, rememberEnding, resetEverything, clearProgress, saveProgress } from '@/engine/storage'
import { answerQuestion, computeEnding, recomputeEvidence } from '@/engine/game'

/**
 * Single source of truth for the witness session.
 * Settings live in SettingsProvider so a volume change never re-renders the
 * questionnaire; the audio engine is the only consumer of those values.
 */
export function useGame() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress() ?? normalizeProgress({}))
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const setPhase = useCallback((phase: Phase) => {
    setProgress((p) => ({ ...p, phase }))
  }, [])

  const patch = useCallback((next: Partial<Progress>) => {
    setProgress((p) => ({ ...p, ...next }))
  }, [])

  /** Landing -> warning. Resets the interview but keeps this device's case number. */
  const startSession = useCallback(() => {
    setProgress((p) => ({
      ...normalizeProgress({ caseNumber: p.caseNumber }),
      phase: 'warning',
      startedAt: Date.now(),
    }))
  }, [])

  const register = useCallback((alias: string) => {
    setProgress((p) => ({
      ...p,
      alias: alias.trim() ? alias.trim().slice(0, 24) : null,
      registered: true,
      phase: 'registration',
    }))
  }, [])

  const answer = useCallback((answerId: AnswerId) => {
    setProgress((p) => answerQuestion(p, answerId))
  }, [])

  const markEventSeen = useCallback((eventId: StoryEventId) => {
    setProgress((p) => {
      if (p.seenEvents.includes(eventId)) return p
      const seenEvents = [...p.seenEvents, eventId]
      return { ...p, seenEvents, discovered: recomputeEvidence({ ...p, seenEvents }) }
    })
  }, [])

  const discover = useCallback((id: EvidenceId) => {
    setProgress((p) => (p.discovered.includes(id) ? p : { ...p, discovered: [...p.discovered, id] }))
  }, [])

  const finish = useCallback((): EndingId => {
    const current = progressRef.current
    const { ending, eligibility } = computeEnding(current)
    const finished: Progress = {
      ...current,
      phase: 'ending',
      ending,
      eligibility,
      finishedAt: Date.now(),
      discovered: current.discovered.length ? current.discovered : recomputeEvidence(current),
    }
    rememberEnding(ending)
    setProgress(finished)
    return ending
  }, [])

  const restart = useCallback(() => {
    clearProgress()
    setProgress({ ...normalizeProgress({}), phase: 'landing', startedAt: Date.now() })
  }, [])

  const clearSaved = useCallback(() => {
    resetEverything()
    setProgress({ ...normalizeProgress({}), phase: 'landing' })
  }, [])

  const currentQuestion = useMemo(
    () => QUESTIONS[Math.min(progress.currentQuestion, QUESTIONS.length) - 1],
    [progress.currentQuestion],
  )

  const scores: Scores = progress.scores

  return {
    progress,
    scores,
    currentQuestion,
    totalQuestions: QUESTIONS.length,
    answeredCount: progress.answers.length,
    canResume: progress.registered,
    setPhase,
    patch,
    startSession,
    register,
    answer,
    markEventSeen,
    discover,
    finish,
    restart,
    clearSaved,
  }
}

export type GameApi = ReturnType<typeof useGame>

export const GameContext = createContext<GameApi | null>(null)

export function useGameContext(): GameApi {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameContext must be used inside <GameProvider>')
  return ctx
}
