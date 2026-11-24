/**
 * Type definitions shared across the witness experience.
 */
export type Axis = 'curiosity' | 'caution' | 'confrontation'

export type Scores = Record<Axis, number>

export type AnswerId = 'a' | 'b' | 'c'

export type StageId = 'calm' | 'doubt' | 'surveillance' | 'confrontation' | 'revelation'

export type SceneKey =
  | 'landing'
  | 'corridor'
  | 'mirror-room'
  | 'surveillance'
  | 'door'
  | 'archive'
  | 'ev-old-photo'
  | 'ev-missing-report'
  | 'ev-camera-frame'
  | 'ev-handwritten'
  | 'crime-scene'
  | 'screaming-figure'
  | 'evidence-wall'

export type EvidenceId =
  | 'old-photo'
  | 'missing-report'
  | 'unknown-recording'
  | 'camera-frame'
  | 'case-file'
  | 'handwritten-note'

export type StoryEventId =
  | 'event-1-light'
  | 'event-2-camera'
  | 'event-3-shadow'
  | 'event-4-motion'
  | 'event-5-witness'
  | 'event-6-blackout'
  | 'event-7-revelation'
  | 'event-8-scream'
  | 'event-9-crime-scene'

export type EndingId = 'forbidden-truth' | 'last-witness' | 'survivor' | 'missing'

export interface AnswerChoice {
  id: AnswerId
  label: string
  /** Points contributed to each axis (see data/scoring.ts for the table). */
  scores?: Partial<Scores>
  /** Evidence unlocked by this answer (optional). */
  unlocks?: EvidenceId
  /** Short internal note used by the report generator. */
  tag?: string
}

export interface Question {
  id: number
  stage: StageId
  /** Marks questions whose answers create evidence. */
  prompt: string
  /** Optional secondary line printed in the terminal framing. */
  subtext?: string
  answers: AnswerChoice[]
}

export interface Stage {
  id: StageId
  title: string
  subtitle: string
  /** Scene backdrop used while the stage is active. */
  scene: SceneKey
  /** How the terminal describes the stage. */
  code: string
}

export interface EvidenceItem {
  id: EvidenceId
  index: number
  title: string
  short: string
  description: string
  /** Folded-in story paragraph revealed in the archive. */
  detail: string
  scene: SceneKey
  /** Shown in the archive panel header. */
  stamp: string
  /** Evidence only reachable via a specific choice. */
  secret?: boolean
  /** Required for the forbidden-truth ending. */
  requiredFor?: EndingId[]
}

export interface StoryEvent {
  id: StoryEventId
  /** Fires after this question is answered. */
  afterQuestion: number
  /** Scene change caused by the event, if any. */
  scene?: SceneKey
  title: string
  lines: string[]
  /** seconds the overlay stays on screen (rough pacing hint) */
  duration: number
  tone: 'cold' | 'danger' | 'blackout'
  sound?: string
}

export interface Ending {
  id: EndingId
  title: string
  latin: string
  scene: SceneKey
  /** One-line hook shown on the reveal card. */
  hook: string
  /** Long-form epilogue, split into beats. */
  beats: string[]
  /** Final system line, printed in terminal style. */
  systemLine: string
  /** Music cue. */
  audio: string
  accent: 'warm' | 'cold' | 'danger' | 'void'
}

/** A choice the visitor actually made, used by the scoring + evidence rules. */
export interface PickedAnswer {
  qid: number
  id: AnswerId
  label?: string
}

export interface StoredAnswer {
  questionId: number
  answerId: AnswerId
  label: string
  at: number
}

export interface Settings {
  muted: boolean
  volume: number
  reducedMotion: boolean
  reducedFlash: boolean
  reducedSound: boolean
}

export type ConfrontationChoice = 'open-file' | 'open-door' | 'look-mirror'

export type Phase =
  | 'landing'
  | 'warning'
  | 'registration'
  | 'test'
  | 'evidence'
  | 'confrontation'
  | 'revelation'
  | 'ending'

export interface Progress {
  phase: Phase
  /** 1-based index of the question currently on screen. */
  currentQuestion: number
  answers: StoredAnswer[]
  scores: Scores
  discovered: EvidenceId[]
  seenEvents: StoryEventId[]
  alias: string | null
  caseNumber: string
  /** True once the witness file has been created (gate for every later page). */
  registered: boolean
  startedAt: number
  finishedAt: number | null
  ending: EndingId | null
  /** Which ending(s) the player qualified for at the moment of calculation. */
  eligibility: EndingId[]
  /** The final decision taken in the confrontation room. */
  confrontationChoice: ConfrontationChoice | null
}
