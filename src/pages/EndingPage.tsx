import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Archive, RotateCcw, ScrollText, Trash2 } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import HudBar from '@/components/HudBar'
import EvidenceArchive from '@/components/EvidenceArchive'
import { ConfirmDialog } from '@/components/Controls'
import { endingById } from '@/data/endings'
import { ENDING_ACCENTS, ENDING_UI } from '@/data/story'
import { ENDING_REQUIREMENTS } from '@/data/scoring'
import { loadFoundEndings } from '@/engine/storage'
import { buildReport } from '@/engine/endingReport'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'

/**
 * PAGE 09/10 — the ending and the case report.
 * Four destinations, all computed from the answers (never random).
 */
export default function EndingPage() {
  const navigate = useNavigate()
  const { progress, restart, clearSaved } = useGameContext()
  const { settings } = useSettingsContext()
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [foundEndings, setFoundEndings] = useState(() => loadFoundEndings())
  const [showReport, setShowReport] = useState(false)

  const ending = endingById(progress.ending ?? 'missing')
  const report = useMemo(() => buildReport(progress), [progress])
  const accent = ENDING_ACCENTS[ending.accent]

  useEffect(() => {
    if (!progress.ending) return
    setFoundEndings(loadFoundEndings())
    if (settings.muted) return
    audio.stopAll(2400)
    const timer = window.setTimeout(() => audio.loop(ending.audio as never, 3000), 1400)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ending.id, settings.muted])

  const replay = () => {
    audio.stopAll(800)
    restart()
    navigate('/', { replace: true })
  }

  const clearAll = () => {
    audio.stopAll(600)
    clearSaved()
    setClearOpen(false)
    setFoundEndings([])
    navigate('/', { replace: true })
  }

  const scoreRows = [
    { key: 'curiosity' as const, label: 'الفضول', value: report.scores.curiosity },
    { key: 'caution' as const, label: 'الحذر', value: report.scores.caution },
    { key: 'confrontation' as const, label: 'المواجهة', value: report.scores.confrontation },
  ]
  const maxScore = Math.max(1, ...scoreRows.map((r) => r.value))

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop scene={ending.scene} dim={0.42} emergency={ending.accent === 'danger' && !settings.reducedFlash} />
      <HudBar location="تقرير الشاهد" showArchive={false} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        {/* ending card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-6 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-2 text-[10px] tracking-[0.34em]" style={{ color: accent }}>
            <span className="h-px w-8" style={{ background: accent, opacity: 0.5 }} />
            {ENDING_UI.closing}
            <span className="h-px w-8" style={{ background: accent, opacity: 0.5 }} />
          </div>

          <h1
            className="title-shadow mb-2 text-[30px] font-semibold leading-tight sm:text-5xl"
            style={{ color: 'var(--color-fg)' }}
          >
            {ending.title}
          </h1>
          <div className="brand-latin mb-5 text-[9.5px] sm:text-[11px]" style={{ color: accent }}>
            {ending.latin}
          </div>
          <p className="mx-auto max-w-md text-[13.5px] leading-loose text-fg/85">{ending.hook}</p>
        </motion.div>

        {/* beats */}
        <div className="mb-8 space-y-4">
          {ending.beats.map((beat, i) => (
            <motion.p
              key={beat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 + i * 0.5 }}
              className={cn(
                'text-[13.5px] leading-[1.95] text-fg-dim',
                i === ending.beats.length - 1 && 'font-medium text-fg',
              )}
            >
              {beat}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 + ending.beats.length * 0.5 }}
          className="mb-8 flex items-center gap-3 rounded-[2px] border px-3.5 py-3"
          style={{ borderColor: `${accent}44`, background: `${accent}0d` }}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
          <span className="tabular text-[11px] leading-relaxed" style={{ color: accent }}>
            {ending.systemLine}
          </span>
        </motion.div>

        {/* actions */}
        <div className="mb-6 flex flex-col gap-2.5 sm:flex-row">
          <button type="button" onClick={() => setShowReport((v) => !v)} className="btn flex-1 text-sm">
            <ScrollText size={15} />
            {showReport ? 'إغلاق التقرير' : ENDING_UI.reportTitle}
          </button>
          <button type="button" onClick={() => setArchiveOpen(true)} className="btn flex-1 text-sm">
            <Archive size={15} />
            {ENDING_UI.archive}
          </button>
          <button type="button" onClick={replay} className="btn btn-primary flex-1 text-sm">
            <RotateCcw size={15} />
            {ENDING_UI.replay}
          </button>
        </div>

        {/* case report */}
        <AnimatePresence>
          {showReport && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="panel rounded-[3px] p-4 sm:p-6">
                <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-surveil/20 pb-4">
                  <div>
                    <div className="mb-1 text-[10px] tracking-[0.28em] text-surveil">{ENDING_UI.reportTitle}</div>
                    <h2 className="text-lg font-semibold text-fg">
                      {report.alias ? report.alias : 'الشاهد'} — ملف {report.caseNumber}
                    </h2>
                  </div>
                  <div className="text-left text-[10.5px] leading-relaxed text-fg-dim">
                    <div className="tabular">{ENDING_UI.durationLabel}: {toArabicDigits(report.durationLabel)}</div>
                    <div>{ENDING_UI.endingLabel}: {ending.title}</div>
                  </div>
                </header>

                <dl className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Meta label={ENDING_UI.caseLabel} value={report.caseNumber} />
                  <Meta label={ENDING_UI.witnessLabel} value={`٠٠${toArabicDigits(report.witnessNumber)}`} />
                  <Meta label={ENDING_UI.evidenceLabel} value={`${toArabicDigits(report.completeness.found)} / ${toArabicDigits(report.completeness.total)}`} />
                  <Meta label="تصنيف الملف" value={report.classification} />
                  <Meta
                    label={ENDING_UI.decisionLabel}
                    value={report.decision ? ENDING_UI.decisions[report.decision] : '—'}
                  />
                  <Meta label={ENDING_UI.aliasLabel} value={report.alias ?? 'الشاهد'} />
                </dl>

                {/* scores */}
                <div className="mb-5">
                  <div className="mb-2.5 text-[10px] tracking-[0.24em] text-surveil">{ENDING_UI.scoreLabel}</div>
                  <div className="space-y-2">
                    {scoreRows.map((row) => (
                      <div key={row.key} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-[11.5px] text-fg-dim">{row.label}</span>
                        <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-fg-dim/15">
                          <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.value / maxScore) * 100}%` }}
                            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
                            className="absolute inset-y-0 right-0 rounded-full"
                            style={{
                              background:
                                row.key === 'confrontation' ? 'var(--color-danger)' : row.key === 'curiosity' ? 'var(--color-surveil)' : '#8a8f98',
                            }}
                          />
                        </span>
                        <span className="tabular w-6 shrink-0 text-left text-[11px] text-fg">{toArabicDigits(row.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="mb-1.5 text-[10px] tracking-[0.24em] text-surveil">ملاحظات المحقّق</div>
                  <p className="mb-1 text-[12.5px] leading-relaxed text-fg/85">{report.dominant.note}</p>
                  {report.notes.map((n) => (
                    <p key={n} className="text-[11.5px] leading-relaxed text-fg-dim">
                      — {n}
                    </p>
                  ))}
                </div>

                {/* answers */}
                <details className="group mb-4">
                  <summary className="cursor-pointer list-none text-[10px] tracking-[0.24em] text-surveil transition-colors hover:text-fg">
                    {ENDING_UI.answersLabel} ({toArabicDigits(report.answers.length)})
                    <span className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <ol className="mt-2 space-y-1">
                    {report.answers.map((a) => (
                      <li key={a.qid} className="flex items-baseline gap-2 border-b border-surveil/10 py-1 text-[11.5px] last:border-0">
                        <span className="tabular w-6 shrink-0 text-fg-dim/50">{toArabicDigits(String(a.qid).padStart(2, '0'))}</span>
                        <span className="text-fg-dim">{a.label}</span>
                      </li>
                    ))}
                  </ol>
                </details>

                {/* evidence */}
                <div className="mb-4">
                  <div className="mb-1.5 text-[10px] tracking-[0.24em] text-surveil">{ENDING_UI.evidenceLabel}</div>
                  {report.evidence.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {report.evidence.map((e) => (
                        <span key={e.id} className="rounded-[2px] border border-surveil/25 px-2 py-1 text-[10.5px] text-fg-dim">
                          {toArabicDigits(e.index)}. {e.title}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11.5px] text-fg-dim/60">لم تحتفظ بأي دليل.</p>
                  )}
                </div>

                <div className="hairline mb-3" />
                <p className="mb-2 text-[11px] leading-relaxed text-fg-dim/70">{ENDING_UI.disclaimer}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] tracking-[0.18em] text-fg-dim/40">
                  <span>{ENDING_UI.reportFooter}</span>
                  <span className="tabular">{report.caseNumber}</span>
                </div>
              </div>

              {/* archive progress + requirements */}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="panel rounded-[3px] p-4">
                  <div className="mb-2 text-[10px] tracking-[0.24em] text-surveil">{ENDING_UI.endingsFoundLabel}</div>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="tabular text-2xl text-fg">{toArabicDigits(foundEndings.length)}</span>
                    <span className="text-[11px] text-fg-dim">/ ٤</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-fg-dim/70">{ENDING_UI.shareHint}</p>
                </div>
                <div className="panel rounded-[3px] p-4">
                  <div className="mb-2 text-[10px] tracking-[0.24em] text-surveil">شرط هذه النهاية</div>
                  <p className="mb-2 text-[11px] leading-relaxed text-fg/80">{ENDING_REQUIREMENTS[ending.id]}</p>
                  {progress.eligibility.length > 1 && (
                    <p className="text-[10.5px] leading-relaxed text-fg-dim/60">
                      كنت مؤهلًا أيضًا لـ: {progress.eligibility.filter((e) => e !== ending.id).map((e) => endingById(e).title).join('، ')}
                    </p>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="mt-auto flex items-center justify-center pt-4">
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            className="flex items-center gap-1.5 text-[10.5px] text-fg-dim/40 transition-colors hover:text-danger-soft"
          >
            <Trash2 size={11} />
            {ENDING_UI.clear}
          </button>
        </div>
      </div>

      <EvidenceArchive open={archiveOpen} onClose={() => setArchiveOpen(false)} discovered={progress.discovered} />

      <ConfirmDialog
        open={clearOpen}
        title={ENDING_UI.clear}
        body={ENDING_UI.clearConfirm}
        confirmLabel="مسح"
        cancelLabel="إلغاء"
        onConfirm={clearAll}
        onCancel={() => setClearOpen(false)}
      />
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2px] border border-surveil/15 bg-ink/40 px-2.5 py-2">
      <dt className="mb-0.5 text-[9px] tracking-[0.16em] text-surveil/70">{label}</dt>
      <dd className="truncate text-[11.5px] text-fg">{value}</dd>
    </div>
  )
}
