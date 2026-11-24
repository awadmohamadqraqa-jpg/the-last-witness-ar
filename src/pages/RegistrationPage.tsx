import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Check, Fingerprint, Terminal } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import SoundControl from '@/components/SoundControl'
import { BRAND, REGISTRATION } from '@/data/story'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'

type Step = 'form' | 'creating' | 'created'

/**
 * PAGE 03 — witness registration.
 * The alias is optional and only ever used inside the fiction.
 */
export default function RegistrationPage() {
  const navigate = useNavigate()
  const { progress, register, setPhase, patch } = useGameContext()
  const { settings } = useSettingsContext()
  const [alias, setAlias] = useState(progress.alias ?? '')
  const [step, setStep] = useState<Step>('form')
  const [typedLines, setTypedLines] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPhase('registration')
    if (!settings.muted) audio.loop('ambience-room', 1200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (step !== 'creating') return
    const timers = REGISTRATION.system.map((_, i) =>
      window.setTimeout(() => setTypedLines(i + 1), 420 + i * 460),
    )
    const done = window.setTimeout(() => {
      setStep('created')
      audio.play('ui-select')
    }, 420 + REGISTRATION.system.length * 460 + 300)
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.clearTimeout(done)
    }
  }, [step])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    audio.unlock()
    register(alias)
    setStep('creating')
  }

  const startInterview = () => {
    audio.play('door-metal')
    patch({ phase: 'test' })
    navigate('/session')
  }

  const displayName = alias.trim() ? alias.trim() : 'الشاهد'

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop scene="archive" dim={0.35} />

      <div className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-fg-dim/70">
          <Terminal size={12} className="text-surveil" />
          <span>{BRAND.facilityCode}</span>
        </div>
        <SoundControl />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
        <AnimatePresence mode="wait">
          {step !== 'created' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              className="panel w-full max-w-lg rounded-[3px]"
            >
              <div className="border-b border-surveil/20 px-5 py-4 sm:px-7">
                <div className="mb-1 flex items-center gap-2 text-[10px] tracking-[0.28em] text-surveil">
                  <Fingerprint size={13} />
                  <span>تسجيل هوية الشاهد</span>
                </div>
                <h1 className="text-lg font-semibold text-fg sm:text-xl">{REGISTRATION.title}</h1>
              </div>

              <form onSubmit={submit} className="px-5 py-5 sm:px-7">
                <p className="mb-5 text-[12.5px] leading-loose text-fg-dim">{REGISTRATION.intro}</p>

                <label htmlFor="alias" className="mb-1.5 block text-[12px] text-fg">
                  {REGISTRATION.aliasLabel}
                </label>
                <input
                  ref={inputRef}
                  id="alias"
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.slice(0, 24))}
                  placeholder={REGISTRATION.aliasPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={24}
                  disabled={step === 'creating'}
                  className="tabular w-full rounded-[2px] border border-surveil/30 bg-ink/70 px-3.5 py-3 text-[14px] text-fg outline-none transition-colors placeholder:text-fg-dim/40 focus:border-surveil/70 disabled:opacity-60"
                />
                <div className="mt-1.5 mb-5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-fg-dim/60">
                  <span>{REGISTRATION.aliasHint}</span>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[2px] border border-surveil/20 bg-ink/40 px-3 py-2.5">
                    <div className="mb-1 text-[9.5px] tracking-[0.2em] text-surveil/80">{REGISTRATION.caseLabel}</div>
                    <div className="tabular text-[13px] text-fg"><span className="ltr">{progress.caseNumber}</span></div>
                  </div>
                  <div className="rounded-[2px] border border-surveil/20 bg-ink/40 px-3 py-2.5">
                    <div className="mb-1 text-[9.5px] tracking-[0.2em] text-surveil/80">رقم الشاهد</div>
                    <div className="tabular text-[13px] text-fg">٠٠١</div>
                  </div>
                </div>

                {/* terminal output */}
                <div className="mb-5 rounded-[2px] border border-surveil/15 bg-ink/60 px-3 py-2.5">
                  {REGISTRATION.system.map((line, i) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: typedLines > i || step !== 'form' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'text-[10.5px] leading-relaxed',
                        i === REGISTRATION.system.length - 1 ? 'text-danger-soft/90' : 'text-surveil/80',
                      )}
                      style={{ fontFamily: 'var(--font-arabic)' }}
                    >
                      <span className="text-fg-dim/40">›</span> {line}
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                  <button type="button" onClick={() => navigate('/start')} className="btn btn-ghost flex-1 text-sm">
                    <ArrowLeft size={15} />
                    {REGISTRATION.back}
                  </button>
                  <button type="submit" disabled={step === 'creating'} className="btn btn-primary flex-1 text-sm">
                    {step === 'creating' ? 'جارٍ إنشاء الملف…' : REGISTRATION.submit}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="created"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="panel w-full max-w-md rounded-[3px] p-6 text-center sm:p-8"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
                className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-surveil/50 text-surveil"
              >
                <Check size={24} />
              </motion.div>

              <h1 className="mb-2 text-lg font-semibold text-fg">{REGISTRATION.accepted}</h1>
              <p className="mb-6 text-[12px] leading-relaxed text-fg-dim">
                {REGISTRATION.aliasNote}
              </p>

              <div className="mb-6 space-y-2 rounded-[2px] border border-surveil/20 bg-ink/50 px-4 py-3 text-right">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-fg-dim">الاسم في الملف</span>
                  <span className="max-w-[60%] truncate text-fg">{displayName}</span>
                </div>
                <div className="hairline" />
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-fg-dim">رقم القضية</span>
                  <span className="tabular text-fg"><span className="ltr">{progress.caseNumber}</span></span>
                </div>
                <div className="hairline" />
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-fg-dim">الحالة</span>
                  <span className="flex items-center gap-1.5 text-danger-soft">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
                    {REGISTRATION.connected(toArabicDigits('1'))}
                  </span>
                </div>
              </div>

              <button type="button" onClick={startInterview} className="btn btn-primary w-full text-sm">
                {REGISTRATION.start}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
