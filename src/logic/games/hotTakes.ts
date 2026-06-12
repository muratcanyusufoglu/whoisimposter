import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

const PROMPTS: Record<string, PromptItem[]> = {
  en: require('@/data/prompts/hot-takes/en.json').prompts as PromptItem[],
  tr: require('@/data/prompts/hot-takes/tr.json').prompts as PromptItem[],
  de: require('@/data/prompts/hot-takes/de.json').prompts as PromptItem[],
  fr: require('@/data/prompts/hot-takes/fr.json').prompts as PromptItem[],
  es: require('@/data/prompts/hot-takes/es.json').prompts as PromptItem[],
  pt: require('@/data/prompts/hot-takes/pt.json').prompts as PromptItem[],
  ru: require('@/data/prompts/hot-takes/ru.json').prompts as PromptItem[],
  ar: require('@/data/prompts/hot-takes/ar.json').prompts as PromptItem[],
  it: require('@/data/prompts/hot-takes/it.json').prompts as PromptItem[],
  nl: require('@/data/prompts/hot-takes/nl.json').prompts as PromptItem[],
  ja: require('@/data/prompts/hot-takes/ja.json').prompts as PromptItem[],
  ko: require('@/data/prompts/hot-takes/ko.json').prompts as PromptItem[],
  'zh-Hant': require('@/data/prompts/hot-takes/zh-Hant.json').prompts as PromptItem[],
  sv: require('@/data/prompts/hot-takes/sv.json').prompts as PromptItem[],
  pl: require('@/data/prompts/hot-takes/pl.json').prompts as PromptItem[],
  da: require('@/data/prompts/hot-takes/da.json').prompts as PromptItem[],
  nb: require('@/data/prompts/hot-takes/nb.json').prompts as PromptItem[],
  fi: require('@/data/prompts/hot-takes/fi.json').prompts as PromptItem[],
  hi: require('@/data/prompts/hot-takes/hi.json').prompts as PromptItem[],
  id: require('@/data/prompts/hot-takes/id.json').prompts as PromptItem[],
}

function loadPrompts(locale: string): PromptItem[] {
  return PROMPTS[locale] ?? PROMPTS.en
}

export const hotTakesLogic = {
  getNextPrompt(
    locale: string,
    intensity: 'mild' | 'medium' | 'spicy',
    usedIds: string[],
  ): PromptItem {
    const all     = loadPrompts(locale)
    const matches = all.filter((p) => p.intensity === intensity)
    const unused  = matches.filter((p) => !usedIds.includes(p.id))
    const pool    = unused.length > 0 ? unused : matches

    const fallback: PromptItem = {
      id: 'fallback',
      text: 'Pineapple absolutely belongs on pizza.',
      intensity,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
