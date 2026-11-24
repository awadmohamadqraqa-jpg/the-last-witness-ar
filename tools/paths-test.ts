/**
 * Ending path simulator — exhaustively checks that all four endings are
 * reachable through valid answer paths, and reports the distribution.
 * Run: npx tsx tools/paths-test.ts
 */
import { QUESTIONS } from '../src/data/questions'
import { computeEnding, computeEvidence } from '../src/engine/game'
import { addScores, scoresFor } from '../src/data/scoring'
import type { AnswerId, PickedAnswer } from '../src/data/types'

const IDS: AnswerId[] = ['a', 'b', 'c']

function makeProgress(path: AnswerId[]) {
  const answers: PickedAnswer[] = path.map((id, i) => ({ qid: i + 1, id }))
  // replicate answerQuestion scoring
  let scores = { curiosity: 0, caution: 0, confrontation: 0 }
  answers.forEach((a) => { scores = addScores(scores, scoresFor(a.qid, a.id)) })
  const seenEvents = ['event-1-light','event-2-camera','event-3-shadow','event-4-motion','event-5-witness','event-6-blackout'] as never[]
  const discovered = computeEvidence(answers, seenEvents)
  return { answers, scores, discovered, seenEvents }
}

const counts: Record<string, number> = {}
const examples: Record<string, { path: string; scores: any; evidence: number }> = {}
let total = 0
const RECORD = process.env.RECORD

function walk(prefix: AnswerId[], idx: number) {
  if (idx === QUESTIONS.length) {
    total++
    const p = makeProgress(prefix)
    const { ending } = computeEnding({ ...p, answers: prefix.map((id, i) => ({ questionId: i + 1, answerId: id, label: '', at: 0 })), phase: 'test', currentQuestion: 15, alias: null, caseNumber: 'x', startedAt: 0, finishedAt: null, ending: null, eligibility: [] } as never)
    counts[ending] = (counts[ending] ?? 0) + 1
    if (!examples[ending]) examples[ending] = { path: prefix.join(''), scores: p.scores, evidence: p.discovered.length }
    if (RECORD && ending === RECORD && !process.env.RECORD_DONE && prefix.join('') === process.env.RECORD_PATH) {
      console.log('record', ending, p)
    }
    return
  }
  for (const id of IDS) walk([...prefix, id], idx + 1)
}

walk([], 0)
console.log('total paths:', total)
for (const k of Object.keys(counts).sort((a,b)=>counts[b]-counts[a])) {
  console.log(`${k.padEnd(18)} ${String(counts[k]).padStart(6)}  ${((counts[k]/total)*100).toFixed(1)}%   example=${examples[k].path} scores=${JSON.stringify(examples[k].scores)} evidence=${examples[k].evidence}`)
}
