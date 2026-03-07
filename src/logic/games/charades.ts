import { shuffle } from '@/utils/shuffle'

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

// Module-level cache (reuse same pool approach as headsUp)
let _wordPool: string[] | null = null

function loadWordPool(locale: string): string[] {
  if (!_wordPool) {
    try {
      const movies = require('@/data/words/en/movies.json') as { words: string[] }
      const objects = require('@/data/words/en/objects.json') as { words: string[] }
      const jobs = require('@/data/words/en/jobs.json') as { words: string[] }
      _wordPool = shuffle([...movies.words, ...objects.words, ...jobs.words])
    } catch {
      _wordPool = [
        'Dancing', 'Swimming', 'Cooking', 'Flying', 'Surfing',
        'Lawyer', 'Dentist', 'Fireman', 'Astronaut', 'Chef',
        'Piano', 'Telephone', 'Umbrella', 'Bicycle', 'Mirror',
        'Sleeping', 'Singing', 'Running', 'Reading', 'Painting',
        'Elephant', 'Kangaroo', 'Penguin', 'Giraffe', 'Dolphin',
      ]
    }
  }
  return _wordPool
}

export const charadesLogic = {
  /**
   * Build a shuffled word pool for one round, excluding used words.
   */
  buildRoundPool(locale: string, usedWords: string[]): string[] {
    const all = loadWordPool(locale)
    const fresh = all.filter((w) => !usedWords.includes(w))
    return shuffle(fresh.length >= 5 ? fresh : all)
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
