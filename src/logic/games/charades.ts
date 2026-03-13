import { shuffle } from '@/utils/shuffle'
import { wordSelector } from '@/logic/wordSelector'

// ─────────────────────────────────────────────────────────────────────────────
// CHARADES — LOGIC
// Actor sees a word, acts it out without speaking.
// Team (or other players) tries to guess. Timer per turn.
// Score = correct guesses during timer.
// ─────────────────────────────────────────────────────────────────────────────

export type CharadesAction = 'correct' | 'skip' | 'timer_end'

export interface CharadesRoundResult {
  actorId: string
  correct: number
  skipped: number
  words: Array<{ word: string; result: 'correct' | 'skip' }>
}

// Default category set for charades when user hasn't selected any specific ones.
// These map exactly to the category IDs available in wordSelector / ALL_LISTS.
const DEFAULT_CHARADES_CATEGORIES = [
  'movies-tv', 'jobs', 'objects', 'hobbies', 'animals', 'food',
]

export const charadesLogic = {
  /**
   * Build a shuffled word pool for one round, excluding used words.
   * Uses wordSelector so the locale and category selection are both respected.
   *
   * @param locale          Current app language (e.g. 'tr', 'en')
   * @param usedWords       Words already played this session
   * @param selectedCategories  Categories chosen on the setup screen (empty = all defaults)
   */
  buildRoundPool(locale: string, usedWords: string[], selectedCategories: string[] = []): string[] {
    const categories = selectedCategories.length > 0
      ? selectedCategories
      : DEFAULT_CHARADES_CATEGORIES
    const all = shuffle(wordSelector.buildPool(categories, locale))
    const fresh = all.filter((w) => !usedWords.includes(w))
    return fresh.length >= 5 ? fresh : all
  },

  /**
   * Resolve a completed round, computing scores.
   */
  resolveRound(
    actorId: string,
    actions: Array<{ word: string; action: CharadesAction }>,
  ): CharadesRoundResult {
    let correct = 0
    let skipped = 0
    const words: CharadesRoundResult['words'] = []

    actions.forEach(({ word, action }) => {
      if (action === 'correct') {
        correct++
        words.push({ word, result: 'correct' })
      } else if (action === 'skip') {
        skipped++
        words.push({ word, result: 'skip' })
      }
    })

    return { actorId, correct, skipped, words }
  },

  /** Default timer for one player's charades turn in seconds */
  defaultTimerSeconds: 60,
}
