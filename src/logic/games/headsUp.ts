import { shuffle } from '@/utils/shuffle'
import { wordSelector } from '@/logic/wordSelector'

// ─────────────────────────────────────────────────────────────────────────────
// HEADS UP — LOGIC
// Active player holds phone on forehead. Phone shows a word.
// Others give clues. Player tilts phone down = correct, tilts up = skip.
// Timer per round. Score = correct words during timer.
// ─────────────────────────────────────────────────────────────────────────────

export type HeadsUpAction = 'correct' | 'skip' | 'timer_end'

export interface HeadsUpRoundResult {
  playerId: string
  correct: number
  skipped: number
  words: Array<{ word: string; result: 'correct' | 'skip' }>
}

/** Tilt threshold in g-units for down/up detection */
export const TILT_THRESHOLD = 0.7

/**
 * Interpret raw accelerometer z-axis value into an action.
 * z ≈ +1  → phone face-up (neutral / starting position)
 * z << 0  → phone tilted face-down (= CORRECT)
 * z >> +1 → phone tilted face-up / back (= SKIP)
 */
export function interpretTilt(z: number): 'correct' | 'skip' | null {
  if (z < -TILT_THRESHOLD) return 'correct'   // face-down → got it!
  if (z > 1 + TILT_THRESHOLD) return 'skip'   // fully back → pass
  return null
}

// Default category set for heads-up when user hasn't selected any specific ones.
// These map exactly to the category IDs available in wordSelector / ALL_LISTS.
const DEFAULT_HEADSUP_CATEGORIES = [
  'animals', 'food', 'sports', 'jobs', 'nature', 'objects',
]

export const headsUpLogic = {
  /**
   * Get a shuffled pool of words for a round, excluding already-used ones.
   * Uses wordSelector so the locale and category selection are both respected.
   *
   * @param locale          Current app language (e.g. 'tr', 'en')
   * @param usedWords       Words already played this session
   * @param selectedCategories  Categories chosen on the setup screen (empty = all defaults)
   */
  buildRoundPool(locale: string, usedWords: string[], selectedCategories: string[] = []): string[] {
    const categories = selectedCategories.length > 0
      ? selectedCategories
      : DEFAULT_HEADSUP_CATEGORIES
    const all = shuffle(wordSelector.buildPool(categories, locale))
    const fresh = all.filter((w) => !usedWords.includes(w))
    // Auto-reset when pool exhausted
    return fresh.length >= 10 ? fresh : all
  },

  /**
   * Resolve a completed round, computing scores.
   */
  resolveRound(
    playerId: string,
    actions: Array<{ word: string; action: HeadsUpAction }>,
  ): HeadsUpRoundResult {
    let correct = 0
    let skipped = 0
    const words: HeadsUpRoundResult['words'] = []

    actions.forEach(({ word, action }) => {
      if (action === 'correct') {
        correct++
        words.push({ word, result: 'correct' })
      } else if (action === 'skip') {
        skipped++
        words.push({ word, result: 'skip' })
      }
      // timer_end: don't count current word
    })

    return { playerId, correct, skipped, words }
  },

  /** Default timer for one player's turn in seconds */
  defaultTimerSeconds: 60,
}
