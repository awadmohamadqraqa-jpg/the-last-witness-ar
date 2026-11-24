import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { FolderOpen, ShieldAlert } from 'lucide-react'
import CinematicBackdrop from '@/components/CinematicBackdrop'
import EvidenceArchive from '@/components/EvidenceArchive'
import HudBar from '@/components/HudBar'
import { EVIDENCE } from '@/data/evidence'
import { SECRET_EVIDENCE } from '@/data/scoring'
import { REVELATION } from '@/data/story'
import { useGameContext } from '@/providers/GameProvider'
import { useSettingsContext } from '@/providers/SettingsProvider'
import audio from '@/engine/audio'
import { toArabicDigits } from '@/lib/format'

/**
 * Between the interview and the confrontation: the room after the questions.
 * The archive is the reward, and it is where the story starts to contradict
 * itself.
 */
export default function ArchivePage() {
  const navigate = useNavigate()
  const { progress, setPhase } = useGameContext()
  const { settings } = useSettingsContext()
  const [revealed, setRevealed] = useState(false)

  const secretFound = useMemo(
    () => SECRET_EVIDENCE.filter((id) => progress.discovered.includes(id)).length,
    [progress.discovered],
  )
  const total = EVIDENCE.length
  const found = progress.discovered.length

  useEffect(() => {
    setPhase('evidence')
    if (!settings.muted) {
      audio.loop('ambience-room', 1400)
      audio.loop('drone-tension', 2200)
      audio.play('door-metal')
    }
    const t = window.setTimeout(() => setRevealed(true), 700)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const proceed = () => {
    audio.play('impact')
    navigate('/confrontation')
  }

  return (
    <main className="scene-shell flex min-h-[100svh] flex-col">
      <CinematicBackdrop scene="archive" dim={0.12} />
      <HudBar location="الأرشيف — الجناح المغلق" showArchive={false} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
          transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-5 mt-2"
        >
          <div className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.3em] text-surveil">
            <FolderOpen size={13} />
            <span>{REVELATION.loadingLines[2]}</span>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-fg sm:text-3xl">
            ما جُمع عنك وعن الشاهد السابق
          </h1>
          <p className="max-w-xl text-[12.5px] leading-loose text-fg-dim">
            {REVELATION.evidenceNote(toArabicDigits(found), toArabicDigits(total))}{' '}
            كل ملف هنا مأخوذ من الغرفة نفسها. بعضها كان في مكان لم تنظر إليه، وبعضها الآخر لم يكن يجب أن تراه.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="min-h-0 flex-1"
        >
          <div className="h-[58vh] min-h-[380px] w-full md:h-[56vh]">
            <EvidenceArchive inline open onClose={() => {}} discovered={progress.discovered} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-[11px] text-fg-dim/70">
            <ShieldAlert size={12} className={secretFound > 0 ? 'text-danger-soft' : 'text-fg-dim/50'} />
            {secretFound > 0 ? (
              <span>
                أدلة سرّية عثرت عليها: <span className="tabular text-danger-soft">{toArabicDigits(secretFound)}</span>
              </span>
            ) : (
              <span>لا شيء هنا يشير إلى وجود ملف ثانٍ. ربما.</span>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={proceed} className="btn btn-primary text-sm">
              {REVELATION.readyLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
