import { useEffect, useState } from 'react'
import { Volume2, VolumeX, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { cn } from '@/lib/cn'

interface SoundControlProps {
  /** 'icon' for the compact HUD version, 'full' for the landing page. */
  variant?: 'icon' | 'full'
  className?: string
}

/**
 * Master sound control: mute toggle + volume + reduced-sound toggle.
 * Never starts audio on its own; the first tap is what unlocks the context.
 */
export function SoundControl({ variant = 'icon', className }: SoundControlProps) {
  const { settings, toggleMute, setVolume, update } = useSettingsContext()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onToggleMute = () => {
    audio.unlock()
    toggleMute()
    if (settings.muted) audio.play('ui-select')
  }

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={onToggleMute}
        aria-pressed={settings.muted}
        aria-label={settings.muted ? 'تشغيل الصوت' : 'كتم الصوت'}
        className={cn(
          'group flex items-center justify-center gap-2 rounded-[2px] border border-surveil/30 bg-ink/70 text-fg-dim backdrop-blur-sm transition-colors hover:border-surveil/70 hover:text-fg',
          variant === 'icon' ? 'h-11 w-11' : 'h-11 px-4',
        )}
      >
        {settings.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        {variant === 'full' && (
          <span className="text-xs tracking-wide">{settings.muted ? 'الصوت مكتوم' : 'الصوت مفعّل'}</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="إعدادات الصوت"
        className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-surveil/30 bg-ink/70 text-fg-dim backdrop-blur-sm transition-colors hover:border-surveil/70 hover:text-fg"
      >
        <SlidersHorizontal size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="إعدادات الصوت"
            className="panel absolute top-14 left-0 z-50 w-64 rounded-[3px] p-4 text-right"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.2em] text-fg-dim">إعدادات الصوت</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="text-fg-dim transition-colors hover:text-fg"
              >
                <X size={14} />
              </button>
            </div>

            <label className="mb-2 block text-xs text-fg-dim" htmlFor="master-volume">
              مستوى الصوت العام
            </label>
            <input
              id="master-volume"
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="h-1 w-full cursor-pointer appearance-none rounded bg-surveil/30 accent-surveil [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surveil"
              aria-valuetext={`${Math.round(settings.volume * 100)} بالمئة`}
            />

            <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-xs text-fg-dim">
              <input
                type="checkbox"
                checked={settings.reducedSound}
                onChange={(e) => update({ reducedSound: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-danger"
              />
              <span>
                <span className="block text-fg">تخفيف الأصوات القوية</span>
                <span className="block text-[11px] leading-relaxed text-fg-dim/80">
                  يقلل حدة الأصوات المفاجئة دون إلغائها.
                </span>
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SoundControl
