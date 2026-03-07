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

const DE_LISTS: WordListMap = {
  food:      require('@/data/words/de/food.json') as WordList,
  animals:   require('@/data/words/de/animals.json') as WordList,
  sports:    require('@/data/words/de/sports.json') as WordList,
  jobs:      require('@/data/words/de/jobs.json') as WordList,
  countries: require('@/data/words/de/countries.json') as WordList,
  'movies-tv': require('@/data/words/de/movies-tv.json') as WordList,
  music:     require('@/data/words/de/music.json') as WordList,
  objects:   require('@/data/words/de/objects.json') as WordList,
  nature:    require('@/data/words/de/nature.json') as WordList,
  hobbies:   require('@/data/words/de/hobbies.json') as WordList,
}

const FR_LISTS: WordListMap = {
  food:      require('@/data/words/fr/food.json') as WordList,
  animals:   require('@/data/words/fr/animals.json') as WordList,
  sports:    require('@/data/words/fr/sports.json') as WordList,
  jobs:      require('@/data/words/fr/jobs.json') as WordList,
  countries: require('@/data/words/fr/countries.json') as WordList,
  'movies-tv': require('@/data/words/fr/movies-tv.json') as WordList,
  music:     require('@/data/words/fr/music.json') as WordList,
  objects:   require('@/data/words/fr/objects.json') as WordList,
  nature:    require('@/data/words/fr/nature.json') as WordList,
  hobbies:   require('@/data/words/fr/hobbies.json') as WordList,
}

const ES_LISTS: WordListMap = {
  food:      require('@/data/words/es/food.json') as WordList,
  animals:   require('@/data/words/es/animals.json') as WordList,
  sports:    require('@/data/words/es/sports.json') as WordList,
  jobs:      require('@/data/words/es/jobs.json') as WordList,
  countries: require('@/data/words/es/countries.json') as WordList,
  'movies-tv': require('@/data/words/es/movies-tv.json') as WordList,
  music:     require('@/data/words/es/music.json') as WordList,
  objects:   require('@/data/words/es/objects.json') as WordList,
  nature:    require('@/data/words/es/nature.json') as WordList,
  hobbies:   require('@/data/words/es/hobbies.json') as WordList,
}

const PT_LISTS: WordListMap = {
  food:      require('@/data/words/pt/food.json') as WordList,
  animals:   require('@/data/words/pt/animals.json') as WordList,
  sports:    require('@/data/words/pt/sports.json') as WordList,
  jobs:      require('@/data/words/pt/jobs.json') as WordList,
  countries: require('@/data/words/pt/countries.json') as WordList,
  'movies-tv': require('@/data/words/pt/movies-tv.json') as WordList,
  music:     require('@/data/words/pt/music.json') as WordList,
  objects:   require('@/data/words/pt/objects.json') as WordList,
  nature:    require('@/data/words/pt/nature.json') as WordList,
  hobbies:   require('@/data/words/pt/hobbies.json') as WordList,
}

const RU_LISTS: WordListMap = {
  food:      require('@/data/words/ru/food.json') as WordList,
  animals:   require('@/data/words/ru/animals.json') as WordList,
  sports:    require('@/data/words/ru/sports.json') as WordList,
  jobs:      require('@/data/words/ru/jobs.json') as WordList,
  countries: require('@/data/words/ru/countries.json') as WordList,
  'movies-tv': require('@/data/words/ru/movies-tv.json') as WordList,
  music:     require('@/data/words/ru/music.json') as WordList,
  objects:   require('@/data/words/ru/objects.json') as WordList,
  nature:    require('@/data/words/ru/nature.json') as WordList,
  hobbies:   require('@/data/words/ru/hobbies.json') as WordList,
}

const IT_LISTS: WordListMap = {
  food:      require('@/data/words/it/food.json') as WordList,
  animals:   require('@/data/words/it/animals.json') as WordList,
  sports:    require('@/data/words/it/sports.json') as WordList,
  jobs:      require('@/data/words/it/jobs.json') as WordList,
  countries: require('@/data/words/it/countries.json') as WordList,
  'movies-tv': require('@/data/words/it/movies-tv.json') as WordList,
  music:     require('@/data/words/it/music.json') as WordList,
  objects:   require('@/data/words/it/objects.json') as WordList,
  nature:    require('@/data/words/it/nature.json') as WordList,
  hobbies:   require('@/data/words/it/hobbies.json') as WordList,
}

const NL_LISTS: WordListMap = {
  food:      require('@/data/words/nl/food.json') as WordList,
  animals:   require('@/data/words/nl/animals.json') as WordList,
  sports:    require('@/data/words/nl/sports.json') as WordList,
  jobs:      require('@/data/words/nl/jobs.json') as WordList,
  countries: require('@/data/words/nl/countries.json') as WordList,
  'movies-tv': require('@/data/words/nl/movies-tv.json') as WordList,
  music:     require('@/data/words/nl/music.json') as WordList,
  objects:   require('@/data/words/nl/objects.json') as WordList,
  nature:    require('@/data/words/nl/nature.json') as WordList,
  hobbies:   require('@/data/words/nl/hobbies.json') as WordList,
}

const AR_LISTS: WordListMap = {
  food:      require('@/data/words/ar/food.json') as WordList,
  animals:   require('@/data/words/ar/animals.json') as WordList,
  sports:    require('@/data/words/ar/sports.json') as WordList,
  jobs:      require('@/data/words/ar/jobs.json') as WordList,
  countries: require('@/data/words/ar/countries.json') as WordList,
  'movies-tv': require('@/data/words/ar/movies-tv.json') as WordList,
  music:     require('@/data/words/ar/music.json') as WordList,
  objects:   require('@/data/words/ar/objects.json') as WordList,
  nature:    require('@/data/words/ar/nature.json') as WordList,
  hobbies:   require('@/data/words/ar/hobbies.json') as WordList,
}

// Map of all available locale → category → WordList
const ALL_LISTS: Record<string, WordListMap> = {
  en: EN_LISTS,
  tr: TR_LISTS,
  de: DE_LISTS,
  fr: FR_LISTS,
  es: ES_LISTS,
  pt: PT_LISTS,
  ru: RU_LISTS,
  it: IT_LISTS,
  nl: NL_LISTS,
  ar: AR_LISTS,
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
