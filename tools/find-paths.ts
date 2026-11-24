import { QUESTIONS } from '../src/data/questions'
import { addScores, scoresFor, evaluateEnding } from '../src/data/scoring'
import { computeEvidence } from '../src/engine/game'
import type { AnswerId, EndingId, PickedAnswer } from '../src/data/types'

const IDS: AnswerId[] = ['a', 'b', 'c']
const seenEvents = ['event-1-light','event-2-camera','event-3-shadow','event-4-motion','event-5-witness','event-6-blackout'] as never[]
const wanted: EndingId[] = ['last-witness', 'survivor', 'missing', 'forbidden-truth']
const found: Partial<Record<EndingId, string>> = {}

function walk(prefix: AnswerId[], idx: number) {
  if (wanted.every((w) => found[w])) return
  if (idx === QUESTIONS.length) {
    const answers: PickedAnswer[] = prefix.map((id, i) => ({ qid: i + 1, id }))
    let scores = { curiosity: 0, caution: 0, confrontation: 0 }
    answers.forEach((a) => { scores = addScores(scores, scoresFor(a.qid, a.id)) })
    const discovered = computeEvidence(answers, seenEvents)
    const { ending } = evaluateEnding(scores, discovered, answers)
    if (!found[ending]) {
      found[ending] = prefix.join('')
      console.log(ending.padEnd(16), prefix.join(''), JSON.stringify(scores), 'evidence=' + discovered.length, discovered.join(','))
    }
    return
  }
  for (const id of IDS) walk([...prefix, id], idx + 1)
}
walk([], 0)
