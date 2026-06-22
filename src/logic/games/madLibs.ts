import { shuffle } from '@/utils/shuffle'

// ─────────────────────────────────────────────────────────────────────────────
// MAD LIBS ("Crazy Story") — LOGIC
// Players supply words for typed blanks without seeing the story. The collected
// words are dropped into a template and the absurd result is read aloud.
// ─────────────────────────────────────────────────────────────────────────────

export interface MadLibsStory {
  id: string
  /** Hint shown for each blank, e.g. "an animal". Index matches {0}, {1}, … */
  blanks: string[]
  /** Template with numbered placeholders {0}, {1}, … */
  template: string
}

const STORIES: Record<string, MadLibsStory[]> = {
  en: require('@/data/prompts/mad-libs/en.json').stories as MadLibsStory[],
  tr: require('@/data/prompts/mad-libs/tr.json').stories as MadLibsStory[],
  de: require('@/data/prompts/mad-libs/de.json').stories as MadLibsStory[],
  es: require('@/data/prompts/mad-libs/es.json').stories as MadLibsStory[],
  fr: require('@/data/prompts/mad-libs/fr.json').stories as MadLibsStory[],
  it: require('@/data/prompts/mad-libs/it.json').stories as MadLibsStory[],
  pt: require('@/data/prompts/mad-libs/pt.json').stories as MadLibsStory[],
  nl: require('@/data/prompts/mad-libs/nl.json').stories as MadLibsStory[],
  sv: require('@/data/prompts/mad-libs/sv.json').stories as MadLibsStory[],
  da: require('@/data/prompts/mad-libs/da.json').stories as MadLibsStory[],
  nb: require('@/data/prompts/mad-libs/nb.json').stories as MadLibsStory[],
  pl: require('@/data/prompts/mad-libs/pl.json').stories as MadLibsStory[],
  id: require('@/data/prompts/mad-libs/id.json').stories as MadLibsStory[],
  'zh-Hant': require('@/data/prompts/mad-libs/zh-Hant.json').stories as MadLibsStory[],
  ja: require('@/data/prompts/mad-libs/ja.json').stories as MadLibsStory[],
  ko: require('@/data/prompts/mad-libs/ko.json').stories as MadLibsStory[],
  ru: require('@/data/prompts/mad-libs/ru.json').stories as MadLibsStory[],
  hi: require('@/data/prompts/mad-libs/hi.json').stories as MadLibsStory[],
  ar: require('@/data/prompts/mad-libs/ar.json').stories as MadLibsStory[],
  fi: require('@/data/prompts/mad-libs/fi.json').stories as MadLibsStory[],
}

function loadStories(locale: string): MadLibsStory[] {
  return STORIES[locale] ?? STORIES.en
}

const FALLBACK: MadLibsStory = {
  id: 'fallback',
  blanks: ['an adjective', 'an animal', 'a place'],
  template: 'It was a {0} day when a {1} wandered into {2} and changed everything.',
}

export const madLibsLogic = {
  /** Pick a random unused story for the locale (falls back to English). */
  getStory(locale: string, usedIds: string[]): MadLibsStory {
    const all = loadStories(locale)
    const unused = all.filter((s) => !usedIds.includes(s.id))
    const pool = unused.length > 0 ? unused : all
    return shuffle(pool)[0] ?? all[0] ?? FALLBACK
  },

  /** Replace {0}, {1}, … with the collected words. */
  assemble(story: MadLibsStory, words: string[]): string {
    return story.template.replace(/\{(\d+)\}/g, (_match, i: string) => {
      const w = words[Number(i)]
      return w && w.trim().length > 0 ? w.trim() : '______'
    })
  },

  getAll(locale: string): MadLibsStory[] {
    return loadStories(locale)
  },
}
