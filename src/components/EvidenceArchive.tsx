import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, FileSearch, Lock, TriangleAlert, X } from 'lucide-react'
import type { EvidenceId, EvidenceItem } from '@/data/types'
import { EVIDENCE, TOTAL_EVIDENCE } from '@/data/evidence'
import { EVIDENCE_UI } from '@/data/story'
import { SCENES } from '@/engine/scenes'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'

interface EvidenceArchiveProps {
  open: boolean
  onClose: () => void
  discovered: EvidenceId[]
  /** Renders the panel inline instead of as a full-screen overlay. */
  inline?: boolean
}

/**
 * Dark archive reader. Locked entries are visible but unreadable — the
 * visitor always knows how much of the case they are missing.
 */
export function EvidenceArchive({ open, onClose, discovered, inline = false }: EvidenceArchiveProps) {
  const [active, setActive] = useState<EvidenceItem | null>(null)

  useEffect(() => {
    if (!open) setActive(null)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (active) setActive(null)
        else onClose()
      }
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, open, onClose])

  const sorted = useMemo(() => [...EVIDENCE].sort((a, b) => a.index - b.index), [])
  const found = discovered.length

  const body = (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-start justify-between gap-4 border-b border-surveil/20 px-5 py-4 sm:px-7">
        <div className="text-right">
          <div className="mb-1 flex items-center gap-2 text-[10px] tracking-[0.3em] text-surveil">
            <FileSearch size={13} />
            <span>{EVIDENCE_UI.stamp}</span>
          </div>
          <h2 className="text-lg font-semibold text-fg sm:text-xl">{EVIDENCE_UI.title}</h2>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-fg-dim">{EVIDENCE_UI.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="tabular rounded-[2px] border border-surveil/30 px-2 py-1 text-[11px] text-surveil">
            {EVIDENCE_UI.counter(toArabicDigits(found), toArabicDigits(TOTAL_EVIDENCE))}
          </span>
          {!inline && (
            <button
              type="button"
              onClick={onClose}
              aria-label={EVIDENCE_UI.close}
              className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-surveil/30 text-fg-dim transition-colors hover:border-surveil/70 hover:text-fg"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* body */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[320px_1fr] md:grid-rows-1">
        <ul className="max-h-[30vh] overflow-y-auto border-b border-surveil/15 p-3 md:max-h-none md:border-b-0 md:border-l md:border-surveil/15">
          {sorted.map((item) => {
            const unlocked = discovered.includes(item.id)
            const isActive = active?.id === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => setActive(unlocked ? item : null)}
                  aria-current={isActive}
                  className={cn(
                    'group mb-1.5 flex w-full items-start gap-3 rounded-[2px] border px-3 py-3 text-right transition-colors',
                    isActive
                      ? 'border-danger/60 bg-danger/10'
                      : 'border-transparent bg-surface/40 hover:border-surveil/40 hover:bg-surface/70',
                    !unlocked && 'cursor-not-allowed opacity-45',
                  )}
                >
                  <span
                    className={cn(
                      'tabular mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-[2px] border text-[11px]',
                      unlocked ? 'border-surveil/50 text-surveil' : 'border-fg-dim/30 text-fg-dim',
                    )}
                  >
                    {unlocked ? toArabicDigits(item.index) : <Lock size={12} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm text-fg">{unlocked ? item.title : EVIDENCE_UI.locked}</span>
                      {item.secret && unlocked && (
                        <TriangleAlert size={12} className="shrink-0 text-danger" aria-hidden="true" />
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-fg-dim">
                      {unlocked ? item.short : EVIDENCE_UI.lockedHint}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="relative min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.article
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="p-4 sm:p-6"
              >
                <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-[2px] border border-surveil/25 bg-ink">
                  <img
                    src={SCENES[active.scene].full}
                    alt={active.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-90"
                    style={{ filter: 'saturate(0.75) contrast(1.1) brightness(0.9)' }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/25 to-transparent" />
                  <div className="layer-scanlines opacity-20" />
                  <div className="absolute right-3 top-3 rounded-[2px] border border-surveil/40 bg-ink/80 px-2 py-1 text-[10px] tracking-[0.2em] text-surveil">
                    {active.stamp}
                  </div>
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {active.secret && (
                    <span className="rounded-[2px] border border-danger/60 bg-danger/10 px-2 py-0.5 text-[10px] tracking-wider text-danger-soft">
                      {EVIDENCE_UI.secretBadge}
                    </span>
                  )}
                </div>

                <h3 className="mb-2 text-base font-semibold text-fg sm:text-lg">{active.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-fg/85">{active.description}</p>
                <div className="hairline mb-4" />
                <div className="mb-1.5 text-[10px] tracking-[0.24em] text-surveil">{EVIDENCE_UI.detailLabel}</div>
                <p className="text-[13px] leading-loose text-fg-dim">{active.detail}</p>
              </motion.article>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[240px] flex-col items-center justify-center p-8 text-center"
              >
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-surveil/25 text-surveil/60">
                  <FileSearch size={22} />
                </div>
                {found === 0 ? (
                  <>
                    <h3 className="mb-1.5 text-sm text-fg">{EVIDENCE_UI.emptyTitle}</h3>
                    <p className="max-w-xs text-xs leading-relaxed text-fg-dim">{EVIDENCE_UI.emptyBody}</p>
                  </>
                ) : (
                  <>
                    <h3 className="mb-1.5 text-sm text-fg">اختر دليلًا من القائمة</h3>
                    <p className="max-w-xs text-xs leading-relaxed text-fg-dim">
                      كل ملف هنا مرتبط بشيء رأيته في الغرفة، ولو لم تنتبه إليه حينها.
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!inline && (
        <div className="border-t border-surveil/20 px-5 py-3">
          <button type="button" onClick={onClose} className="btn btn-ghost w-full text-xs sm:w-auto">
            <ArrowRight size={14} className="rotate-180" />
            {EVIDENCE_UI.back}
          </button>
        </div>
      )}
    </div>
  )

  if (inline) {
    return <div className="panel h-full overflow-hidden rounded-[3px]">{body}</div>
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-stretch justify-center bg-ink/85 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={EVIDENCE_UI.title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.985, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: 6 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="panel h-full w-full max-w-4xl overflow-hidden rounded-none sm:h-[86vh] sm:rounded-[3px]"
          >
            {body}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EvidenceArchive
