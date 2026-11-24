import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, CornerDownLeft } from 'lucide-react'
import type { AnswerId, Question } from '@/data/types'
import { TEST } from '@/data/story'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'

interface QuestionCardProps {
  question: Question
  selected: AnswerId | null
  onSelect: (id: AnswerId) => void
  onConfirm: () => void
  disabled?: boolean
  /** Reduced motion kills the slide-in and the stagger. */
  reducedMotion?: boolean
}

const KEYS: Record<string, AnswerId> = {
  '1': 'a',
  '2': 'b',
  '3': 'c',
  '١': 'a',
  '٢': 'b',
  '٣': 'c',
  ArrowUp: 'a',
  ArrowDown: 'b',
}

/**
 * The interview question. Deliberately not a survey card: mono label,
 * hairline rules, and full-width answers that read like a transcript.
 */
export function QuestionCard({ question, selected, onSelect, onConfirm, disabled, reducedMotion }: QuestionCardProps) {
  const [pulse, setPulse] = useState<AnswerId | null>(null)
  const refs = useRef<Record<AnswerId, HTMLButtonElement | null>>({ a: null, b: null, c: null })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      const mapped = KEYS[e.key]
      if (mapped) {
        e.preventDefault()
        onSelect(mapped)
        setPulse(mapped)
        window.setTimeout(() => setPulse(null), 420)
        refs.current[mapped]?.focus()
        return
      }
      if (e.key === 'Enter' && selected) {
        e.preventDefault()
        onConfirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, onSelect, onConfirm, selected])

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(3px)' }}
          transition={{ duration: reducedMotion ? 0.2 : 0.55, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-7 bg-danger/70" />
            <span className="tabular text-[10px] tracking-[0.3em] text-danger-soft">
              السؤال {toArabicDigits(question.id)}
            </span>
          </div>

          <h2
            className="mb-6 text-balance text-xl leading-[1.55] font-medium text-fg sm:text-2xl sm:leading-[1.5]"
            id="question-text"
          >
            {question.prompt}
          </h2>

          <div
            className="flex flex-col gap-2.5"
            role="group"
            aria-labelledby="question-text"
          >
            {question.answers.map((answer, i) => {
              const isSelected = selected === answer.id
              return (
                <motion.button
                  key={answer.id}
                  ref={(el) => {
                    refs.current[answer.id] = el
                  }}
                  type="button"
                  onClick={() => onSelect(answer.id)}
                  onDoubleClick={onConfirm}
                  data-selected={isSelected}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={`${TEST.answerAria(i + 1)}: ${answer.label}`}
                  initial={reducedMotion ? false : { opacity: 0, x: 10 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: pulse === answer.id ? [1, 0.995, 1] : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.4, delay: reducedMotion ? 0 : 0.08 + i * 0.07 },
                    x: { duration: 0.4, delay: reducedMotion ? 0 : 0.08 + i * 0.07 },
                    scale: { duration: 0.32 },
                  }}
                  className={cn('option text-[14.5px] sm:text-[15px]', pulse === answer.id && 'option-flash')}
                >
                  <span
                    className={cn(
                      'tabular grid h-6 w-6 shrink-0 place-items-center rounded-[2px] border text-[11px]',
                      isSelected ? 'border-danger/70 text-danger-soft' : 'border-fg-dim/35 text-fg-dim',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected ? <span className="h-1.5 w-1.5 bg-danger" /> : i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{answer.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selected || disabled}
          className="btn btn-primary w-full text-sm sm:w-auto sm:min-w-[168px]"
        >
          تثبيت الإجابة
          <CornerDownLeft size={15} />
        </button>

        <p className="flex items-center gap-2 text-[11px] text-fg-dim/70">
          <ArrowLeft size={12} className="opacity-60" />
          {TEST.keyboardHint}
        </p>
      </div>
    </div>
  )
}

export default QuestionCard
