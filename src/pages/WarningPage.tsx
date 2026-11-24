import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { AlertTriangle, ArrowLeft, Clock, ShieldCheck, Volume2 } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import { SettingsToggle } from '@/components/Controls'
import { WARNING } from '@/data/story'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'

/**
 * PAGE 02 — content warning + consent.
 * Nothing is requested from the device; the toggles only change the
 * presentation of the fiction.
 */
export default function WarningPage() {
  const navigate = useNavigate()
  const { settings, update, toggleMute } = useSettingsContext()

  useEffect(() => {
    // Keep the ambience from the landing page running (user already interacted).
    if (!settings.muted) audio.loop('ambience-room', 1600)
  }, [settings.muted])

  const accept = () => {
    audio.unlock()
    if (!settings.muted) {
      audio.loop('ambience-room', 1400)
      audio.loop('drone-tension', 4200)
    }
    navigate('/register')
  }

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop scene="corridor" dim={0.25} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="panel w-full max-w-lg rounded-[3px] p-5 sm:p-7"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-danger/45 text-danger-soft">
              <AlertTriangle size={18} />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-fg sm:text-xl">{WARNING.title}</h1>
              <p className="tabular text-[10px] tracking-[0.26em] text-danger-soft/80">تنبيه المحتوى</p>
            </div>
          </div>

          <div className="mb-5 space-y-3">
            <p className="text-[14px] leading-loose text-fg">{WARNING.body}</p>
            <div className="rounded-[2px] border border-surveil/20 bg-surveil/[0.04] px-3.5 py-3">
              <p className="flex gap-2 text-[12px] leading-relaxed text-fg-dim">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-surveil" />
                <span>{WARNING.body2}</span>
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.24em] text-surveil">{WARNING.settingsTitle}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-fg-dim/60">
                <Clock size={10} /> {WARNING.duration}
              </span>
            </div>
            <div className="space-y-2">
              <SettingsToggle
                id="reduced-motion"
                checked={settings.reducedMotion}
                onChange={(v) => update({ reducedMotion: v })}
                label={WARNING.reducedMotion}
                hint={WARNING.reducedMotionHint}
              />
              <SettingsToggle
                id="reduced-flash"
                checked={settings.reducedFlash}
                onChange={(v) => update({ reducedFlash: v })}
                label={WARNING.reducedFlash}
                hint={WARNING.reducedFlashHint}
              />
              <SettingsToggle
                id="reduced-sound"
                checked={settings.reducedSound}
                onChange={(v) => update({ reducedSound: v })}
                label={WARNING.reducedSound}
                hint={WARNING.reducedSoundHint}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                audio.unlock()
                toggleMute()
              }}
              className="mt-2 flex w-full items-center justify-between gap-3 rounded-[2px] border border-surveil/15 bg-surface/40 px-3.5 py-3 text-right transition-colors hover:border-surveil/35"
              aria-pressed={!settings.muted}
            >
              <span className="flex items-center gap-2 text-[13px] text-fg">
                <Volume2 size={14} className="text-fg-dim" />
                {WARNING.sound}
              </span>
              <span className={settings.muted ? 'text-[11px] text-fg-dim' : 'text-[11px] text-surveil'}>
                {settings.muted ? WARNING.soundOff : WARNING.soundOn}
              </span>
            </button>
          </div>

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <button type="button" onClick={() => navigate('/')} className="btn btn-ghost flex-1 text-sm">
              <ArrowLeft size={15} />
              {WARNING.back}
            </button>
            <button type="button" onClick={accept} className="btn btn-primary flex-1 text-sm">
              {WARNING.accept}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
