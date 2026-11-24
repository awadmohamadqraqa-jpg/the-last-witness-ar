import type { AnswerId, EndingId, EvidenceId, PickedAnswer, Progress, Scores } from '@/data/types'
import { QUESTIONS, questionById } from '@/data/questions'
import { EVIDENCE_RULES, addScores, evaluateEnding, scoresFor } from '@/data/scoring'
import { EVENT_EVIDENCE, eventAfter } from '@/data/events'

/**
 * Pure state transitions. Every function returns a NEW progress object so
 * React re-renders reliably and the engine stays trivially testable.
 */

export const pickedFromProgress = (progress: Progress): PickedAnswer[] =>
  progress.answers.map((a) => ({ qid: a.questionId, id: a.answerId, label: a.label }))

/** All evidence the visitor should own given their answers + seen events. */
export function computeEvidence(answers: PickedAnswer[], seenEvents: Progress['seenEvents']): EvidenceId[] {
  const found = new Set<EvidenceId>()
  for (const [id, rule] of Object.entries(EVIDENCE_RULES) as [EvidenceId, (a: PickedAnswer[]) => boolean][]) {
    if (rule(answers)) found.add(id)
  }
  for (const [eventId, evidenceId] of Object.entries(EVENT_EVIDENCE) as [keyof typeof EVENT_EVIDENCE, EvidenceId][]) {
    if (seenEvents.includes(eventId as never) && evidenceId) found.add(evidenceId)
  }
  return Array.from(found)
}

export function recomputeEvidence(progress: Progress): EvidenceId[] {
  return computeEvidence(pickedFromProgress(progress), progress.seenEvents)
}

/** Answer the question currently on screen. */
export function answerQuestion(progress: Progress, answerId: AnswerId): Progress {
  const q = questionById(progress.currentQuestion)
  const choice = q.answers.find((a) => a.id === answerId)
  if (!choice) return progress
  if (progress.answers.some((a) => a.questionId === q.id)) return progress

  const delta = scoresFor(q.id, answerId)
  const scores: Scores = addScores(progress.scores, delta)
  const answers = [
    ...progress.answers,
    { questionId: q.id, answerId, label: choice.label, at: Date.now() },
  ]

  const next: Progress = {
    ...progress,
    answers,
    scores,
    currentQuestion: Math.min(QUESTIONS.length, q.id + 1),
  }

  const ev = eventAfter(q.id)
  if (ev && !progress.seenEvents.includes(ev.id)) {
    next.seenEvents = [...progress.seenEvents, ev.id]
  }

  next.discovered = computeEvidence(pickedFromProgress(next), next.seenEvents)
  return next
}

/** Which scripted event (if any) should play right after the given question. */
export function pendingEvent(progress: Progress, questionId: number) {
  const ev = eventAfter(questionId)
  if (!ev) return null
  // only play it once
  const alreadyPlayed = progress.answers.length > questionId
  return alreadyPlayed ? null : ev
}

export function isLastQuestion(progress: Progress): boolean {
  return progress.currentQuestion >= QUESTIONS.length && progress.answers.length >= QUESTIONS.length
}

export function questionProgress(progress: Progress): number {
  return Math.min(progress.answers.length + (progress.phase === 'test' ? 0 : 0), QUESTIONS.length)
}

/** Final calculation: scores + evidence + chosen path -> ending. */
export function computeEnding(progress: Progress): { ending: EndingId; eligibility: EndingId[] } {
  const found = progress.discovered.length ? progress.discovered : recomputeEvidence(progress)
  return evaluateEnding(progress.scores, found, pickedFromProgress(progress))
}

/** A resume target for the landing CTA. */
export function resumeLabel(progress: Progress | null): 'new' | 'continue' {
  if (!progress) return 'new'
  if (progress.ending) return 'new'
  return progress.answers.length > 0 || progress.phase !== 'landing' ? 'continue' : 'new'
}

export function dominantAxis(scores: Scores): keyof Scores {
  const entries = Object.entries(scores) as [keyof Scores, number][]
  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

/** Behaviour profile shown on the final report. */
export function behaviorProfile(scores: Scores): { axis: keyof Scores; label: string; note: string } {
  const axis = dominantAxis(scores)
  const labels: Record<keyof Scores, { label: string; note: string }> = {
    curiosity: {
      label: 'دافع المعرفة',
      note: 'أجبت كمن يريد أن يرى ما في الداخل، ولو كان الثمن أن يُرى.',
    },
    caution: {
      label: 'دافع البقاء',
      note: 'أجبت كمن يحسب المسافة إلى الباب قبل أن يتحرك.',
    },
    confrontation: {
      label: 'دافع المواجهة',
      note: 'أجبت كمن لا يخفض بصره أمام ما ينظر إليه.',
    },
  }
  return { axis, ...labels[axis] }
}
