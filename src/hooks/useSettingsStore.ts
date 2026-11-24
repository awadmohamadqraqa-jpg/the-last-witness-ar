import { useCallback, useEffect, useState } from 'react'
import type { Settings } from '@/data/types'
import { loadSettings, saveSettings } from '@/engine/storage'
import { defaultSettings } from '@/engine/storage'
import audio from '@/engine/audio'

/**
 * Settings live in their own provider so pages never re-render because of a
 * slider move, and so the audio engine stays the only consumer of volume.
 */
export interface SettingsApi {
  settings: Settings
  update: (next: Partial<Settings>) => void
  toggleMute: () => void
  setVolume: (v: number) => void
}

export function useSettingsStore(): SettingsApi {
  const [settings, setSettings] = useState<Settings>(() => loadSettings() ?? defaultSettings)

  useEffect(() => {
    saveSettings(settings)
    audio.configure(settings)
    const root = document.documentElement
    root.dataset.reducedMotion = String(settings.reducedMotion)
    root.dataset.reducedFlash = String(settings.reducedFlash)
    root.dataset.reducedSound = String(settings.reducedSound)
  }, [settings])

  const update = useCallback((next: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...next }))
  }, [])

  const toggleMute = useCallback(() => {
    setSettings((s) => {
      const muted = !s.muted
      if (!muted) audio.unlock()
      return { ...s, muted }
    })
  }, [])

  const setVolume = useCallback((volume: number) => {
    setSettings((s) => ({ ...s, volume: Math.min(1, Math.max(0, volume)) }))
  }, [])

  return { settings, update, toggleMute, setVolume }
}

export type SettingsStore = ReturnType<typeof useSettingsStore>
