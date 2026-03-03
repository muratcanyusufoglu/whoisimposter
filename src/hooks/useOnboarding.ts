import { useCallback } from 'react'
import { getItem, setItem, STORAGE_KEYS } from '@/utils/storage'
import { RatingState } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// useOnboarding — reads/writes onboarding lifecycle flags from AsyncStorage.
// Used in the index.tsx router and the onboarding screens.
// ─────────────────────────────────────────────────────────────────────────────

export function useOnboarding() {
  const checkCompleted = useCallback(async (): Promise<boolean> => {
    const result = await getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED)
    return result === true
  }, [])

  const markCompleted = useCallback(async (): Promise<void> => {
    await setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true)
  }, [])

  const getRatingState = useCallback(async (): Promise<RatingState> => {
    const result = await getItem<RatingState>(STORAGE_KEYS.RATING_STATE)
    return result ?? 'unseen'
  }, [])

  const setRatingState = useCallback(async (state: RatingState): Promise<void> => {
    await setItem(STORAGE_KEYS.RATING_STATE, state)
    if (state === 'later') {
      await setItem(STORAGE_KEYS.RATING_LAST_PROMPT_AT, Date.now())
    }
  }, [])

  const shouldShowRating = useCallback(async (): Promise<boolean> => {
    const state = await getItem<RatingState>(STORAGE_KEYS.RATING_STATE)
    if (state === 'done') return false
    if (state === 'later') {
      const lastPrompt = await getItem<number>(STORAGE_KEYS.RATING_LAST_PROMPT_AT)
      if (lastPrompt) {
        const hoursSince = (Date.now() - lastPrompt) / (1000 * 60 * 60)
        return hoursSince >= 48
      }
    }
    return true
  }, [])

  return {
    checkCompleted,
    markCompleted,
    getRatingState,
    setRatingState,
    shouldShowRating,
  }
}
