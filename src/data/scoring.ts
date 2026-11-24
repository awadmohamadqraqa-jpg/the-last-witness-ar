import type { AnswerId, EndingId, EvidenceId, PickedAnswer, Question, Scores } from './types'

/**
 * ============================================================
 * SCORING RULES — the heart of the decision engine.
 * ============================================================
 * The three axes are weighted so that no single answer can dominate an
 * ending: the four endings live in different regions of the same space.
 *
 *   curiosity      — wanting to know, opening the file, entering the door
 *   caution        — holding back, asking for proof, looking for the exit
 *   confrontation  — denying, forcing, staring back at whatever stares
 *
 * Point budget: 15 questions x 2 points = 30 points.
 */

/** Per-question overrides. Anything not listed falls back to AXIS_BY_POSITION. */
export const SCORE_TABLE: Record<number, Record<'a' | 'b' | 'c', Partial<Scores>>> = {
  1: {
    a: { caution: 2 },                 // comfortable alone = grounded
    b: { caution: 1, curiosity: 1 },   // tense alone = alert, listening
    c: { caution: 2, confrontation: 1 },
  },
  2: {
    a: { caution: 1, confrontation: 1 }, // fully trusts memory = stubborn
    b: { caution: 2 },
    c: { curiosity: 2, caution: 1 },     // doubts own record = questions everything
  },
  3: {
    a: { curiosity: 2, confrontation: 1 }, // goes to check the sound
    b: { caution: 2 },
    c: { caution: 2, curiosity: 1 },       // looks for the exit
  },
  4: {
    a: { curiosity: 2 },                   // knows someone never met
    b: { confrontation: 2 },               // refuses the idea outright
    c: { caution: 2 },
  },
  5: {
    a: { curiosity: 2, confrontation: 1 }, // demands an explanation
    b: { caution: 2 },
    c: { confrontation: 2, caution: 1 },   // destroys the evidence
  },
  6: {
    a: { confrontation: 2 },               // can sit in the dark
    b: { caution: 1, curiosity: 1 },
    c: { caution: 2 },
  },
  7: {
    a: { confrontation: 2 },               // denies hiding anything
    b: { caution: 2 },
    c: { curiosity: 2, confrontation: 2 }, // admits it — and holds your stare
  },
  8: {
    a: { confrontation: 3 },               // opens the door on your own voice
    b: { caution: 2 },
    c: { curiosity: 2, caution: 1 },
  },
  9: {
    a: { curiosity: 2, confrontation: 1 }, // says yes, it saw something
    b: { caution: 1 },
    c: { confrontation: 2, caution: 1 },
  },
  10: {
    a: { curiosity: 2, confrontation: 2 }, // walks into the open door
    b: { caution: 3 },
    c: { caution: 1, curiosity: 2 },       // watches first
  },
  11: {
    a: { curiosity: 2 },                   // believes the stranger
    b: { caution: 2, curiosity: 1 },       // demands proof
    c: { confrontation: 2, caution: 1 },   // denies knowing them
  },
  12: {
    a: { curiosity: 3 },                   // wants the previous witness
    b: { confrontation: 1, caution: 1 },
    c: { caution: 3 },                     // wants out
  },
  13: {
    a: { curiosity: 3, confrontation: 1 }, // opens the file with your name
    b: { caution: 2 },
    c: { caution: 1, curiosity: 1 },
  },
  14: {
    a: { curiosity: 2 },                   // believes the one who knows
    b: { confrontation: 2 },               // refuses the claim
    c: { caution: 2, curiosity: 2 },       // demands a demonstration
  },
  15: {
    a: { curiosity: 3, confrontation: 1 }, // expose the truth
    b: { caution: 3 },                     // leave
    c: { curiosity: 3 },                   // the previous witness again
  },
}

/** Fallback if a question is added without an explicit rule row. */
const AXIS_BY_POSITION: Record<'a' | 'b' | 'c', Partial<Scores>> = {
  a: { curiosity: 2 },
  b: { caution: 2 },
  c: { confrontation: 2 },
}

export function scoresFor(questionId: number, answerId: 'a' | 'b' | 'c'): Partial<Scores> {
  return SCORE_TABLE[questionId]?.[answerId] ?? AXIS_BY_POSITION[answerId]
}

export const EMPTY_SCORES: Scores = { curiosity: 0, caution: 0, confrontation: 0 }

export function addScores(base: Scores, delta: Partial<Scores>): Scores {
  return {
    curiosity: base.curiosity + (delta.curiosity ?? 0),
    caution: base.caution + (delta.caution ?? 0),
    confrontation: base.confrontation + (delta.confrontation ?? 0),
  }
}

export function totalPoints(scores: Scores): number {
  return scores.curiosity + scores.caution + scores.confrontation
}

/* ------------------------------------------------------------------
 * EVIDENCE UNLOCK RULES
 * Some evidence is guaranteed by a choice, some is shared between two
 * answers, and two pieces are strictly optional (secret).
 * ------------------------------------------------------------------ */
export const EVIDENCE_RULES: Record<EvidenceId, (picked: PickedAnswer[]) => boolean> = {
  // handed to everyone — it is inside the room
  'old-photo': () => true,
  // either confronting the possibility of a previous witness (Q12) or wanting the truth (Q15)
  'missing-report': (picked) =>
    picked.some((p) => (p.qid === 12 && p.id === 'a') || (p.qid === 12 && p.id === 'c') || (p.qid === 15 && p.id === 'c')),
  // secret: only if the witness asks for proof / keeps hold of the recording
  'unknown-recording': (picked) =>
    picked.some((p) => (p.qid === 11 && p.id === 'b') || (p.qid === 14 && p.id === 'c')),
  // observing the room (Q9 a) or watching first instead of entering (Q10 c)
  'camera-frame': (picked) => picked.some((p) => (p.qid === 9 && p.id === 'a') || (p.qid === 10 && p.id === 'c')),
  // the case file exists for those who wanted to know what happened (Q12 a) or opened their own file (13 a)
  'case-file': (picked) => picked.some((p) => (p.qid === 12 && p.id === 'a') || (p.qid === 13 && p.id === 'a')),
  // secret: the note is only in the hand of someone who tried to hide something (Q5 c, Q13 c)
  'handwritten-note': (picked) => picked.some((p) => (p.qid === 5 && p.id === 'c') || (p.qid === 13 && p.id === 'c')),
}

/** Evidence required to reach the forbidden truth. */
export const SECRET_EVIDENCE: EvidenceId[] = ['unknown-recording', 'handwritten-note', 'camera-frame']

/* ------------------------------------------------------------------
 * ENDING RULES (evaluated in order — first match wins)
 * ------------------------------------------------------------------ */
export interface EndingRule {
  id: EndingId
  test: (ctx: { scores: Scores; discovered: EvidenceId[]; answers: PickedAnswer[] }) => boolean
}

const has = (list: EvidenceId[], id: EvidenceId) => list.includes(id)
const picked = (answers: PickedAnswer[], qid: number, id: AnswerId) =>
  answers.some((a) => a.qid === qid && a.id === id)

/**
 * Order = priority: the secret ending is always evaluated first, then the
 * committed paths, and `missing` (the story's default fate) is the fallback.
 */
export const ENDING_RULES: EndingRule[] = [
  {
    // 4 — THE FORBIDDEN TRUTH: evaluated first, secret ending
    id: 'forbidden-truth',
    test: ({ scores, discovered }) =>
      scores.confrontation >= 14 &&
      SECRET_EVIDENCE.every((e) => has(discovered, e)) &&
      discovered.length >= 5,
  },
  {
    // 1 — THE LAST WITNESS: high curiosity + enough of the file
    id: 'last-witness',
    test: ({ scores, discovered }) =>
      scores.curiosity >= 13 &&
      scores.curiosity >= scores.caution &&
      scores.curiosity >= scores.confrontation &&
      discovered.length >= 4,
  },
  {
    // 2 — THE SURVIVOR: caution dominates and the exit is chosen
    id: 'survivor',
    test: ({ scores, answers }) =>
      scores.caution >= 13 &&
      scores.caution > scores.curiosity &&
      scores.caution > scores.confrontation &&
      (picked(answers, 15, 'b') || picked(answers, 12, 'c') || picked(answers, 10, 'b')),
  },
  {
    // 3 — THE MISSING: total disengagement. The witness never opened their own
    //     file, never pushed back, and never asked for the door — so the facility
    //     quietly drops them from the record.
    id: 'missing',
    test: ({ scores, answers, discovered }) =>
      (picked(answers, 13, 'b') || picked(answers, 9, 'c')) &&
      !picked(answers, 15, 'b') &&
      scores.curiosity <= 10 &&
      scores.confrontation <= 9 &&
      discovered.length <= 5,
  },
]

/** Human-readable requirements, surfaced on the ending report. */
export const ENDING_REQUIREMENTS: Record<EndingId, string> = {
  'forbidden-truth': 'مواجهة عالية (١٤+) + ثلاثة أدلة سرّية + خمسة أدلة على الأقل',
  'last-witness': 'فضول عالٍ (١٣+) + أربعة أدلة على الأقل',
  survivor: 'حذر عالٍ (١٣+) يتجاوز الفضول والمواجهة + اختيار طريق الخروج',
  missing: 'تجنّب الملف مع فضول (١٠ أو أقل) ومواجهة (٩ أو أقل)',
}

export const evaluateEnding = (
  scores: Scores,
  discovered: EvidenceId[],
  answers: PickedAnswer[],
): { ending: EndingId; eligibility: EndingId[] } => {
  const ctx = { scores, discovered, answers }
  const eligibility = ENDING_RULES.filter((r) => r.test(ctx)).map((r) => r.id)
  // first rule in order wins; the missing ending is the fallback of the story
  const ending = eligibility[0] ?? 'missing'
  return { ending, eligibility: eligibility.length ? eligibility : ['missing'] }
}

/** Score deltas keyed by question, for the debug/report view. */
export function scoreBreakdown(questions: Question[], answers: PickedAnswer[]) {
  return answers.map((a) => {
    const q = questions.find((x) => x.id === a.qid)
    return {
      questionId: a.qid,
      answer: a.label ?? q?.answers.find((x) => x.id === a.id)?.label ?? '',
      delta: scoresFor(a.qid, a.id),
    }
  })
}
