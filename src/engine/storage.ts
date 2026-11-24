import type { EndingId, EvidenceId, Progress, Scores, Settings, StoredAnswer } from '@/data/types'
import { EMPTY_SCORES } from '@/data/scoring'
import { toArabicDigits } from '@/lib/format'

/** Versioned localStorage keys — bumping the version invalidates old saves. */
const VERSION = 'v1'
export const PROGRESS_KEY = `tlw.progress.${VERSION}`
export const SETTINGS_KEY = `tlw.settings.${VERSION}`
export const ENDINGS_KEY = `tlw.endings.${VERSION}`

export const defaultSettings: Settings = {
  muted: false,
  volume: 0.7,
  reducedMotion: false,
  reducedFlash: false,
  reducedSound: false,
}

export const createProgress = (): Progress => ({
  phase: 'landing',
  currentQuestion: 1,
  answers: [],
  scores: { ...EMPTY_SCORES },
  discovered: [],
  seenEvents: [],
  alias: null,
  caseNumber: makeCaseNumber(),
  registered: false,
  startedAt: Date.now(),
  finishedAt: null,
  ending: null,
  eligibility: [],
  confrontationChoice: null,
})

/** Fictional case number — deterministic per browser profile, e.g. QT-1973-8821 */
export function makeCaseNumber(): string {
  const seq = Math.floor(1000 + Math.random() * 8999)
  const block = Math.floor(10 + Math.random() * 89)
  return `١٩٧٣-${toArabicDigits(block)}${toArabicDigits(seq)}`
}

const canUseStorage = (): boolean => {
  try {
    const probe = '__tlw__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const HAS_STORAGE = typeof window !== 'undefined' && canUseStorage()

function read<T>(key: string): T | null {
  if (!HAS_STORAGE) return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  if (!HAS_STORAGE) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or privacy mode — the experience keeps working in memory */
  }
}

function remove(key: string): void {
  if (!HAS_STORAGE) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------- progress */
export function loadProgress(): Progress | null {
  const raw = read<Progress>(PROGRESS_KEY)
  if (!raw || typeof raw !== 'object') return null
  return normalizeProgress(raw)
}

export function saveProgress(progress: Progress): void {
  write(PROGRESS_KEY, progress)
}

export function clearProgress(): void {
  remove(PROGRESS_KEY)
}

/** Defensive merge so an old/partial save can never crash the app. */
export function normalizeProgress(raw: Partial<Progress>): Progress {
  const base = createProgress()
  const scores: Scores = { ...EMPTY_SCORES, ...(raw.scores ?? {}) }
  const answers = Array.isArray(raw.answers) ? (raw.answers as StoredAnswer[]).filter((a) => !!a && typeof a.questionId === 'number') : []
  return {
    ...base,
    ...raw,
    scores,
    answers,
    discovered: Array.isArray(raw.discovered) ? (raw.discovered as EvidenceId[]) : [],
    seenEvents: Array.isArray(raw.seenEvents) ? raw.seenEvents : [],
    currentQuestion: Math.min(15, Math.max(1, Number(raw.currentQuestion) || 1)),
    caseNumber: typeof raw.caseNumber === 'string' && raw.caseNumber ? raw.caseNumber : base.caseNumber,
    registered: raw.registered === true,
    eligibility: Array.isArray(raw.eligibility) ? raw.eligibility : [],
    confrontationChoice:
      raw.confrontationChoice === 'open-file' || raw.confrontationChoice === 'open-door' || raw.confrontationChoice === 'look-mirror'
        ? raw.confrontationChoice
        : null,
  }
}

/* ------------------------------------------------------------- settings */
export function loadSettings(): Settings {
  const raw = read<Partial<Settings>>(SETTINGS_KEY)
  if (!raw) return { ...defaultSettings }
  return {
    muted: typeof raw.muted === 'boolean' ? raw.muted : defaultSettings.muted,
    volume: typeof raw.volume === 'number' ? Math.min(1, Math.max(0, raw.volume)) : defaultSettings.volume,
    reducedMotion: !!raw.reducedMotion,
    reducedFlash: !!raw.reducedFlash,
    reducedSound: !!raw.reducedSound,
  }
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings)
}

/* -------------------------------------------------------------- endings */
export function loadFoundEndings(): EndingId[] {
  const raw = read<EndingId[]>(ENDINGS_KEY)
  return Array.isArray(raw) ? raw : []
}

export function rememberEnding(id: EndingId): EndingId[] {
  const found = loadFoundEndings()
  if (!found.includes(id)) {
    const next = [...found, id]
    write(ENDINGS_KEY, next)
    return next
  }
  return found
}

export function resetEverything(): void {
  clearProgress()
  remove(ENDINGS_KEY)
}

export const storageAvailable = HAS_STORAGE
