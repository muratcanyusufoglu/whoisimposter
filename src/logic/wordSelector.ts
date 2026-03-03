import { WordList } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// STATIC WORD LIST IMPORTS
// All word lists are pre-imported so Metro can bundle them (offline-first).
// Dynamic require() paths with variables are not reliably bundled by Metro.
// ─────────────────────────────────────────────────────────────────────────────

type WordListMap = Record<string, WordList>

const EN_LISTS: WordListMap = {
  food:      require('@/data/words/en/food.json') as WordList,
  animals:   require('@/data/words/en/animals.json') as WordList,
  sports:    require('@/data/words/en/sports.json') as WordList,
  jobs:      require('@/data/words/en/jobs.json') as WordList,
  countries: require('@/data/words/en/countries.json') as WordList,
  'movies-tv': require('@/data/words/en/movies-tv.json') as WordList,
  music:     require('@/data/words/en/music.json') as WordList,
  objects:   require('@/data/words/en/objects.json') as WordList,
  nature:    require('@/data/words/en/nature.json') as WordList,
  hobbies:   require('@/data/words/en/hobbies.json') as WordList,
}

const TR_LISTS: WordListMap = {
  food:      require('@/data/words/tr/food.json') as WordList,
  animals:   require('@/data/words/tr/animals.json') as WordList,
  sports:    require('@/data/words/tr/sports.json') as WordList,
  jobs:      require('@/data/words/tr/jobs.json') as WordList,
  countries: require('@/data/words/tr/countries.json') as WordList,
  'movies-tv': require('@/data/words/tr/movies-tv.json') as WordList,
  music:     require('@/data/words/tr/music.json') as WordList,
  objects:   require('@/data/words/tr/objects.json') as WordList,
  nature:    require('@/data/words/tr/nature.json') as WordList,
  hobbies:   require('@/data/words/tr/hobbies.json') as WordList,
}

// Map of all available locale → category → WordList
const ALL_LISTS: Record<string, WordListMap> = {
  en: EN_LISTS,
  tr: TR_LISTS,
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD SELECTOR
// Pure object — no React, no AsyncStorage, fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

export const wordSelector = {

  /**
   * Pick one random word from the selected categories in the given locale.
   * Excludes words already used this session.
   * Falls back to 'en' if the locale has no list for a category.
   * If all words are exhausted, the pool resets (all words eligible again).
   */
  pick(categoryIds: string[], locale: string, usedWords: string[]): string {
    const pool = this.buildPool(categoryIds, locale)

    if (pool.length === 0) return ''

    const available = pool.filter((w) => !usedWords.includes(w))

    // Reset when exhausted
    const source = available.length > 0 ? available : pool

    return source[Math.floor(Math.random() * source.length)]
  },

  /**
   * Build the full word pool for given categories and locale.
   * Merges words from all selected categories.
   * Falls back to EN if the locale doesn't have a list for a given category.
   */
  buildPool(categoryIds: string[], locale: string): string[] {
    const pool: string[] = []
    const localeMap = ALL_LISTS[locale] ?? ALL_LISTS['en']

    for (const catId of categoryIds) {
      const list = localeMap?.[catId] ?? EN_LISTS[catId]
      if (list?.words) {
        pool.push(...list.words)
      }
    }

    return pool
  },

  /**
   * Get the word count for a specific category + locale.
   * Returns 0 if not available.
   */
  getWordCount(categoryId: string, locale: string): number {
    const localeMap = ALL_LISTS[locale]
    return localeMap?.[categoryId]?.words?.length ?? 0
  },

  /**
   * Check if a locale has a word list for the given category.
   */
  hasLocale(categoryId: string, locale: string): boolean {
    return !!ALL_LISTS[locale]?.[categoryId]
  },
}
