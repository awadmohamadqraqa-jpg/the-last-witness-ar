import type { ConfrontationChoice, EvidenceId, PickedAnswer, Progress, Scores } from '@/data/types'
import { EVIDENCE } from '@/data/evidence'
import { REPORT_NOTES } from '@/data/story'
import { behaviorProfile, dominantAxis } from '@/engine/game'

export interface CaseReport {
  caseNumber: string
  alias: string | null
  witnessNumber: string
  startedAt: number
  finishedAt: number
  durationLabel: string
  scores: Scores
  dominant: { axis: keyof Scores; label: string; note: string }
  notes: string[]
  answers: PickedAnswer[]
  evidence: { id: EvidenceId; title: string; index: number }[]
  completeness: { found: number; total: number }
  classification: string
  decision: ConfrontationChoice | null
}

const two = (n: number) => String(n).padStart(2, '0')

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${two(m)}:${two(s)}`
}

/** Deterministic "random" pick so the same witness always gets the same notes. */
function pickNotes(scores: Scores, seed: number): string[] {
  const axis = dominantAxis(scores)
  const pool = REPORT_NOTES[axis]
  const second = (Object.entries(scores) as [keyof Scores, number][])
    .filter(([k]) => k !== axis)
    .sort((a, b) => b[1] - a[1])[0][0]
  const secondary = REPORT_NOTES[second]
  return [pool[seed % pool.length], secondary[(seed + 1) % secondary.length]]
}

const classify = (scores: Scores): string => {
  const axis = dominantAxis(scores)
  if (axis === 'curiosity') return 'الشاهد المتعاون — فئة أ'
  if (axis === 'caution') return 'الشاهد المتحفّظ — فئة ب'
  return 'الشاهد المعادي — فئة ج'
}

export function buildReport(progress: Progress): CaseReport {
  const finishedAt = progress.finishedAt ?? Date.now()
  const seed = progress.answers.reduce((acc, a) => acc + a.questionId * 7 + a.answerId.charCodeAt(0), 0)
  return {
    caseNumber: progress.caseNumber,
    alias: progress.alias,
    witnessNumber: '001',
    startedAt: progress.startedAt,
    finishedAt,
    durationLabel: formatDuration(finishedAt - progress.startedAt),
    scores: progress.scores,
    dominant: behaviorProfile(progress.scores),
    notes: pickNotes(progress.scores, seed),
    answers: progress.answers.map((a) => ({ qid: a.questionId, id: a.answerId, label: a.label })),
    evidence: progress.discovered
      .map((id) => EVIDENCE.find((e) => e.id === id))
      .filter((e): e is (typeof EVIDENCE)[number] => !!e)
      .map((e) => ({ id: e.id, title: e.title, index: e.index }))
      .sort((a, b) => a.index - b.index),
    completeness: { found: progress.discovered.length, total: EVIDENCE.length },
    classification: classify(progress.scores),
    decision: progress.confrontationChoice,
  }
}
