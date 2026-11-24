import { addScores, scoresFor, evaluateEnding } from '../src/data/scoring'
import { computeEvidence } from '../src/engine/game'
import { QUESTIONS } from '../src/data/questions'
import type { AnswerId, PickedAnswer } from '../src/data/types'

const seenEvents = ['event-1-light','event-2-camera','event-3-shadow','event-4-motion','event-5-witness','event-6-blackout'] as never[]

const humanPaths: Record<string, string> = {
  'الفضولي الشجاع': 'aabaaabaaaaaaac',
  'الحذر الكلاسيكي': 'bbcbbcbbbcbcbbc',
  'المتشكك المواجه': 'cbcbcbbcbcbcbca',
  'الصامت الهارب':   'bbbbbbbbbbbbbbb',
  'المتوازن':        'abababababababa',
  'الباحث عن الحقيقة': 'aacaaacaaaccaca',
}

for (const [name, path] of Object.entries(humanPaths)) {
  const ids = path.split('') as AnswerId[]
  const answers: PickedAnswer[] = ids.map((id, i) => ({ qid: i + 1, id }))
  let scores = { curiosity: 0, caution: 0, confrontation: 0 }
  answers.forEach((a) => { scores = addScores(scores, scoresFor(a.qid, a.id)) })
  const discovered = computeEvidence(answers, seenEvents)
  const { ending, eligibility } = evaluateEnding(scores, discovered, answers)
  console.log(name.padEnd(22), '→', ending.padEnd(16), JSON.stringify(scores), 'ev=' + discovered.length, 'all=' + eligibility.join('|'))
}
void QUESTIONS
console.log('---')
const extra: Record<string,string> = {
  'المحايد الكلاسيكي': 'bbcbbcbbbcbcbbb',
  'حذر لكن فضولي': 'bbcbbcbbbcbcaab',
  'هارب بلا فضول': 'bbbbbbbbbbbbbbb',
  'هارب مواجه': 'bcbbcbbcbbcbbcb',
}
for (const [name, path] of Object.entries(extra)) {
  const ids = path.split('') as AnswerId[]
  const answers: PickedAnswer[] = ids.map((id, i) => ({ qid: i + 1, id }))
  let scores = { curiosity: 0, caution: 0, confrontation: 0 }
  answers.forEach((a) => { scores = addScores(scores, scoresFor(a.qid, a.id)) })
  const discovered = computeEvidence(answers, seenEvents)
  const { ending, eligibility } = evaluateEnding(scores, discovered, answers)
  console.log(name.padEnd(22), '→', ending.padEnd(16), JSON.stringify(scores), 'ev=' + discovered.length, 'all=' + eligibility.join('|'))
}
