import { Howl, Howler } from 'howler'
import type { Settings } from '@/data/types'

import ambienceRoom from '@/assets/audio/ambience-room.mp3'
import droneTension from '@/assets/audio/drone-tension.mp3'
import staticNoise from '@/assets/audio/static.mp3'
import impact from '@/assets/audio/impact.mp3'
import footsteps from '@/assets/audio/footsteps.mp3'
import doorMetal from '@/assets/audio/door-metal.mp3'
import revealScore from '@/assets/audio/reveal-score.mp3'
import heartbeat from '@/assets/audio/heartbeat.mp3'
import flicker from '@/assets/audio/flicker.mp3'
import uiSelect from '@/assets/audio/ui-select.mp3'
import glitch from '@/assets/audio/glitch.mp3'
import whisper from '@/assets/audio/whisper.mp3'
import endingLastWitness from '@/assets/audio/ending-last-witness.mp3'
import endingSurvivor from '@/assets/audio/ending-survivor.mp3'
import endingMissing from '@/assets/audio/ending-missing.mp3'
import endingForbidden from '@/assets/audio/ending-forbidden.mp3'
import screamClose from '@/assets/audio/scream-close.mp3'
import screamDistant from '@/assets/audio/scream-distant.mp3'
import breathPanic from '@/assets/audio/breath-panic.mp3'
import stingCrime from '@/assets/audio/sting-crime.mp3'
import heartStop from '@/assets/audio/heart-stop.mp3'
import doorScream from '@/assets/audio/door-scream.mp3'

export type SoundId =
  | 'ambience-room'
  | 'drone-tension'
  | 'static'
  | 'impact'
  | 'footsteps'
  | 'door-metal'
  | 'reveal-score'
  | 'heartbeat'
  | 'flicker'
  | 'ui-select'
  | 'glitch'
  | 'whisper'
  | 'ending-last-witness'
  | 'ending-survivor'
  | 'ending-missing'
  | 'ending-forbidden'
  | 'scream-close'
  | 'scream-distant'
  | 'breath-panic'
  | 'sting-crime'
  | 'heart-stop'
  | 'door-scream'

/** Base mix levels — deliberately conservative, nothing jumps over 0.85. */
const SOURCES: Record<SoundId, { src: string; volume: number; loop: boolean; soften?: number }> = {
  'ambience-room': { src: ambienceRoom, volume: 0.34, loop: true },
  'drone-tension': { src: droneTension, volume: 0.26, loop: true },
  static: { src: staticNoise, volume: 0.3, loop: false, soften: 0.12 },
  impact: { src: impact, volume: 0.5, loop: false, soften: 0.2 },
  footsteps: { src: footsteps, volume: 0.4, loop: false, soften: 0.18 },
  'door-metal': { src: doorMetal, volume: 0.45, loop: false, soften: 0.2 },
  'reveal-score': { src: revealScore, volume: 0.36, loop: false },
  heartbeat: { src: heartbeat, volume: 0.3, loop: true },
  flicker: { src: flicker, volume: 0.2, loop: false, soften: 0.08 },
  'ui-select': { src: uiSelect, volume: 0.22, loop: false },
  glitch: { src: glitch, volume: 0.28, loop: false, soften: 0.1 },
  whisper: { src: whisper, volume: 0.34, loop: false, soften: 0.16 },
  'ending-last-witness': { src: endingLastWitness, volume: 0.4, loop: false },
  'ending-survivor': { src: endingSurvivor, volume: 0.4, loop: false },
  'ending-missing': { src: endingMissing, volume: 0.4, loop: false },
  'ending-forbidden': { src: endingForbidden, volume: 0.42, loop: false },
  /* ---- the new horror layer: synthesised from scratch, 48 kHz / 320 kbps ---- */
  'scream-close': { src: screamClose, volume: 0.46, loop: false, soften: 0.24 },
  'scream-distant': { src: screamDistant, volume: 0.4, loop: false, soften: 0.26 },
  'breath-panic': { src: breathPanic, volume: 0.32, loop: false, soften: 0.22 },
  'sting-crime': { src: stingCrime, volume: 0.48, loop: false, soften: 0.2 },
  'heart-stop': { src: heartStop, volume: 0.42, loop: false, soften: 0.3 },
  'door-scream': { src: doorScream, volume: 0.44, loop: false, soften: 0.2 },
}

class AudioEngine {
  private sounds = new Map<SoundId, Howl>()
  private loops = new Map<SoundId, number>()
  private settings: Settings = {
    muted: false,
    volume: 0.7,
    reducedMotion: false,
    reducedFlash: false,
    reducedSound: false,
  }
  /** Safari/iOS require a gesture before any context can resume. */
  private unlocked = false
  private pendingLoop: { id: SoundId; fade: number } | null = null
  private listeners = new Set<(muted: boolean) => void>()

  configure(settings: Settings) {
    this.settings = settings
    Howler.volume(settings.muted ? 0 : settings.volume)
    this.listeners.forEach((l) => l(settings.muted))
  }

  onMuteChange(fn: (muted: boolean) => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  /** Called from a real user gesture (button click). */
  unlock() {
    if (this.unlocked) return
    this.unlocked = true
    try {
      Howler.ctx?.resume?.()
    } catch {
      /* noop */
    }
    if (this.pendingLoop) {
      const { id, fade } = this.pendingLoop
      this.pendingLoop = null
      this.loop(id, fade)
    }
  }

  private howl(id: SoundId): Howl {
    const existing = this.sounds.get(id)
    if (existing) return existing
    const cfg = SOURCES[id]
    const softened = this.settings.reducedSound && cfg.soften != null
    const h = new Howl({
      src: [cfg.src],
      loop: cfg.loop,
      volume: softened ? cfg.volume * cfg.soften! * 2.2 : cfg.volume,
      preload: true,
      html5: false,
      onloaderror: () => {
        // Never break the experience because of a missing file.
        console.warn(`[audio] failed to load ${id}`)
      },
    })
    this.sounds.set(id, h)
    return h
  }

  /** One-shot effect. */
  play(id: SoundId) {
    if (this.settings.muted || !this.unlocked) return
    const h = this.howl(id)
    if (this.settings.reducedSound) h.volume(SOURCES[id].volume * (SOURCES[id].soften ?? 0.5) * 2)
    else h.volume(SOURCES[id].volume)
    h.play()
  }

  /** Ambient loop with fade-in (no fade on reduced-motion). */
  loop(id: SoundId, fade = 1800) {
    if (!this.unlocked) {
      this.pendingLoop = { id, fade }
      return
    }
    const h = this.howl(id)
    if (this.loops.has(id)) return
    const target = this.settings.reducedSound
      ? SOURCES[id].volume * (SOURCES[id].soften ?? 0.5) * 2
      : SOURCES[id].volume
    h.volume(0)
    const soundId = h.play()
    h.fade(0, target, this.settings.reducedMotion ? 200 : fade, soundId)
    this.loops.set(id, soundId)
  }

  stopLoop(id: SoundId, fade = 1400) {
    const soundId = this.loops.get(id)
    const h = this.sounds.get(id)
    if (!h || soundId == null) return
    this.loops.delete(id)
    const current = h.volume(soundId) as number
    h.fade(current, 0, this.settings.reducedMotion ? 120 : fade, soundId)
    window.setTimeout(() => {
      try {
        h.stop(soundId)
      } catch {
        /* noop */
      }
    }, (this.settings.reducedMotion ? 120 : fade) + 120)
  }

  stopAll(fade = 900) {
    this.pendingLoop = null
    shouldStop: for (const [id, soundId] of this.loops) {
      const h = this.sounds.get(id)
      if (!h) continue shouldStop
      const current = (h.volume(soundId) as number) ?? 0
      h.fade(current, 0, fade, soundId)
      const ref = soundId
      window.setTimeout(() => {
        try {
          h.stop(ref)
        } catch {
          /* noop */
        }
      }, fade + 120)
    }
    this.loops.clear()
  }

  /** Cross-fade the ambience when the scene changes weight. */
  crossfade(from: SoundId, to: SoundId, fade = 2200) {
    this.stopLoop(from, fade)
    this.loop(to, fade)
  }
}

export const audio = new AudioEngine()
export default audio
