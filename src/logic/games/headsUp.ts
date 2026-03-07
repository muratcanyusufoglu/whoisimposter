import { shuffle } from '@/utils/shuffle'

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

// Module-level cache
let _wordPool: string[] | null = null

function loadWordPool(locale: string): string[] {
  if (!_wordPool) {
    // Heads Up uses the same word data as imposter categories
    // We merge several categories into one big pool for variety
    try {
      const en = require('@/data/words/en/animals.json') as { words: string[] }
      const food = require('@/data/words/en/food.json') as { words: string[] }
      const famous = require('@/data/words/en/famous.json') as { words: string[] }
      _wordPool = shuffle([...en.words, ...food.words, ...famous.words])
    } catch {
      _wordPool = [
        'Elephant', 'Pizza', 'Michael Jackson', 'Batman', 'Guitar',
        'Spaghetti', 'Volcano', 'Kangaroo', 'Shakespeare', 'Submarine',
        'Saxophone', 'Pyramid', 'Astronaut', 'Tornado', 'Crocodile',
        'Helicopter', 'Waterfall', 'Flamingo', 'Accordion', 'Lighthouse',
      ]
    }
  }
  return _wordPool
}

export const headsUpLogic = {
  /**
   * Get a shuffled pool of words for a round, excluding already-used ones.
   */
  buildRoundPool(locale: string, usedWords: string[]): string[] {
    const all = loadWordPool(locale)
    const fresh = all.filter((w) => !usedWords.includes(w))
    // Auto-reset when pool exhausted
    return shuffle(fresh.length >= 10 ? fresh : all)
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
