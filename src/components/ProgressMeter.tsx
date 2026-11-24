import { motion } from 'motion/react'
import type { StageId } from '@/data/types'
import { STAGES } from '@/data/questions'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'
import { TEST } from '@/data/story'

interface ProgressMeterProps {
  current: number
  total: number
  stage: StageId
  className?: string
  /** compact = the thin HUD strip used on mobile */
  variant?: 'full' | 'compact'
}

/**
 * Question progress presented as a piece of facility equipment rather than
 * a survey bar: segment ticks per stage, a mono counter, and the stage code.
 */
export function ProgressMeter({ current, total, stage, className, variant = 'full' }: ProgressMeterProps) {
  const stageDef = STAGES.find((s) => s.id === stage) ?? STAGES[0]
  const stageIndex = STAGES.findIndex((s) => s.id === stage)

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-surveil">
            <span className="h-1 w-1 rotate-45 bg-danger" />
            <span className="truncate">{stageDef.code}</span>
          </div>
          {variant === 'full' && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[15px] font-medium text-fg">المرحلة: {stageDef.title}</span>
              <span className="hidden text-[11px] text-fg-dim sm:inline">{stageDef.subtitle}</span>
            </div>
          )}
        </div>
        <div className="tabular ltr shrink-0 text-[11px] text-fg-dim">
          {TEST.questionLabel} {toArabicDigits(current)}
          <span className="mx-1 text-fg-dim/50">/</span>
          {toArabicDigits(total)}
        </div>
      </div>

      {/* segment track */}
      <div className="flex items-center gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label="تقدم الجلسة">
        {Array.from({ length: total }).map((_, i) => {
          const q = i + 1
          const stageOfTick = STAGES.findIndex((s) => s.id === questionStage(q))
          const passed = q <= current
          return (
            <motion.span
              key={q}
              initial={false}
              animate={{ opacity: passed ? 1 : 0.28 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'h-[3px] flex-1 rounded-[1px]',
                passed
                  ? stageOfTick === stageIndex
                    ? 'bg-danger'
                    : 'bg-surveil/70'
                  : 'bg-fg-dim/25',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

function questionStage(id: number): StageId {
  if (id <= 3) return 'calm'
  if (id <= 6) return 'doubt'
  if (id <= 9) return 'surveillance'
  if (id <= 12) return 'confrontation'
  return 'revelation'
}

export default ProgressMeter
