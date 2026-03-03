import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { useSettingsStore } from '@/store/settingsStore'

// ─────────────────────────────────────────────────────────────────────────────
// useHaptics — all haptic feedback funneled through a single hook that
// automatically respects the user's haptics setting.
// ─────────────────────────────────────────────────────────────────────────────

export function useHaptics() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled)

  /** Light tap — UI selections, chip taps */
  const light = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  }, [hapticsEnabled])

  /** Medium impact — button presses, confirmations */
  const medium = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
  }, [hapticsEnabled])

  /** Heavy impact — dramatic reveals (imposter card flip) */
  const heavy = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
  }, [hapticsEnabled])

  /** Selection changed — chip/toggle selection */
  const selection = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.selectionAsync().catch(() => {})
  }, [hapticsEnabled])

  /** Success notification — crew wins, correct guess */
  const success = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  }, [hapticsEnabled])

  /** Warning notification — timer running low */
  const warning = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
  }, [hapticsEnabled])

  /** Error notification — imposter caught, invalid action */
  const error = useCallback(() => {
    if (!hapticsEnabled) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
  }, [hapticsEnabled])

  return { light, medium, heavy, selection, success, warning, error }
}
