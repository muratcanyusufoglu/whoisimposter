import { useCallback, useEffect, useRef } from 'react'
import { Audio } from 'expo-av'
import { useSettingsStore } from '@/store/settingsStore'

// ─────────────────────────────────────────────────────────────────────────────
// SOUND NAMES
// ─────────────────────────────────────────────────────────────────────────────

export type SoundName =
  | 'reveal'     // Card flip whoosh
  | 'imposter'   // Dramatic sting on imposter reveal
  | 'vote'       // Soft click when casting a vote
  | 'win'        // Crew wins fanfare
  | 'lose'       // Imposter escapes dark tone
  | 'tick'       // Timer tick (plays every second when < 10s remain)
  | 'select'     // UI selection feedback

// ─────────────────────────────────────────────────────────────────────────────
// SOUND FILE MAP
// NOTE: Actual .mp3 files will be added in F13 (Audio & Polish).
// Paths are commented out so they don't cause missing-module errors at compile time.
// ─────────────────────────────────────────────────────────────────────────────

const SOUND_FILES: Partial<Record<SoundName, Parameters<typeof Audio.Sound.createAsync>[0]>> = {
  // reveal:   require('@/assets/sounds/reveal.mp3'),
  // imposter: require('@/assets/sounds/imposter.mp3'),
  // vote:     require('@/assets/sounds/vote.mp3'),
  // win:      require('@/assets/sounds/win.mp3'),
  // lose:     require('@/assets/sounds/lose.mp3'),
  // tick:     require('@/assets/sounds/tick.mp3'),
  // select:   require('@/assets/sounds/select.mp3'),
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useSound() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const soundObjects = useRef<Partial<Record<SoundName, Audio.Sound>>>({})

  // Configure audio session on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {})

    return () => {
      // Unload all sounds on unmount
      Object.values(soundObjects.current).forEach((s) => {
        s?.unloadAsync().catch(() => {})
      })
    }
  }, [])

  /**
   * Preload a sound so it's ready for instant playback.
   * Call this during game setup, not on demand.
   */
  const preload = useCallback(async (name: SoundName) => {
    if (!soundEnabled) return
    const source = SOUND_FILES[name]
    if (!source) return // File not yet added

    try {
      if (soundObjects.current[name]) return // Already loaded
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false })
      soundObjects.current[name] = sound
    } catch {
      // Fail silently — missing sound file is non-critical
    }
  }, [soundEnabled])

  /**
   * Play a preloaded sound. Rewinds and plays immediately.
   */
  const play = useCallback(async (name: SoundName) => {
    if (!soundEnabled) return
    const sound = soundObjects.current[name]
    if (!sound) return

    try {
      await sound.setPositionAsync(0)
      await sound.playAsync()
    } catch {
      // Fail silently
    }
  }, [soundEnabled])

  /**
   * Stop and unload all preloaded sounds (call on game reset).
   */
  const unloadAll = useCallback(async () => {
    for (const sound of Object.values(soundObjects.current)) {
      await sound?.unloadAsync().catch(() => {})
    }
    soundObjects.current = {}
  }, [])

  return { preload, play, unloadAll }
}
