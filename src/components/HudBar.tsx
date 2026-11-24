import { useNavigate } from 'react-router-dom'
import { FolderSearch, LogOut } from 'lucide-react'
import { BRAND, TEST } from '@/data/story'
import { useGameContext } from '@/providers/GameProvider'
import SoundControl from '@/components/SoundControl'
import audio from '@/engine/audio'
import { cn } from '@/lib/cn'
import { toArabicDigits } from '@/lib/format'
import { TOTAL_EVIDENCE } from '@/data/evidence'

interface HudBarProps {
  /** Right-hand side scene label — changes as the room changes. */
  location?: string
  /** Shows the evidence button. */
  showArchive?: boolean
  onOpenArchive?: () => void
  /** Shows the exit button. */
  onExit?: () => void
  className?: string
}

/**
 * Persistent instrument strip: facility tag, running clock, evidence count,
 * sound + exit. Kept minimal so the photography stays the subject.
 */
export function HudBar({ location = BRAND.facilityCode, showArchive = true, onOpenArchive, onExit, className }: HudBarProps) {
  const { progress } = useGameContext()
  const navigate = useNavigate()
  const clock = '23:40' // time shown in the fictional case file

  const discovered = progress.discovered.length

  return (
    <header className={cn('relative z-30 flex items-center justify-between gap-3 px-3 py-3 sm:px-6', className)}>
      {/* left cluster (visually right in RTL) */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => { audio.stopAll(700); navigate('/') }}
          aria-label="العودة إلى الصفحة الرئيسية"
          className="group flex min-w-0 items-center gap-2.5 text-right"
        >
          <span className="relative grid h-7 w-7 shrink-0 place-items-center border border-surveil/50">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          </span>
          <span className="min-w-0">
            <span className="brand-latin block truncate text-[8.5px] leading-none text-surveil/90">
              {BRAND.latin}
            </span>
            <span className="mt-1 block truncate text-[9.5px] leading-none text-fg-dim/70 transition-colors group-hover:text-fg-dim">
              {location}
            </span>
          </span>
        </button>
      </div>

      {/* right cluster */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span className="hidden items-center gap-2 rounded-[2px] border border-surveil/20 px-2.5 py-1.5 text-[10px] text-fg-dim sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
          <span className="ltr">
            تسجيل {toArabicDigits(clock)}
          </span>
        </span>

        {showArchive && (
          <button
            type="button"
            onClick={onOpenArchive}
            aria-label="أرشيف الأدلة"
            className="flex h-10 items-center gap-2 rounded-[2px] border border-surveil/30 bg-ink/60 px-2.5 text-[11px] text-fg-dim backdrop-blur-sm transition-colors hover:border-surveil/70 hover:text-fg"
          >
            <FolderSearch size={15} />
            <span className="tabular ltr">
              {toArabicDigits(discovered)}/{toArabicDigits(TOTAL_EVIDENCE)}
            </span>
          </button>
        )}

        <SoundControl />

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            aria-label={TEST.exit}
            className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-surveil/30 bg-ink/60 text-fg-dim backdrop-blur-sm transition-colors hover:border-danger/70 hover:text-danger-soft"
          >
            <LogOut size={15} className="rotate-180" />
          </button>
        )}
      </div>
    </header>
  )
}

export default HudBar
