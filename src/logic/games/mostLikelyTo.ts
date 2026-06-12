import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

const PROMPTS: Record<string, PromptItem[]> = {
  en: require('@/data/prompts/most-likely-to/en.json').prompts as PromptItem[],
  tr: require('@/data/prompts/most-likely-to/tr.json').prompts as PromptItem[],
  de: require('@/data/prompts/most-likely-to/de.json').prompts as PromptItem[],
  fr: require('@/data/prompts/most-likely-to/fr.json').prompts as PromptItem[],
  es: require('@/data/prompts/most-likely-to/es.json').prompts as PromptItem[],
  pt: require('@/data/prompts/most-likely-to/pt.json').prompts as PromptItem[],
  ru: require('@/data/prompts/most-likely-to/ru.json').prompts as PromptItem[],
  ar: require('@/data/prompts/most-likely-to/ar.json').prompts as PromptItem[],
  it: require('@/data/prompts/most-likely-to/it.json').prompts as PromptItem[],
  nl: require('@/data/prompts/most-likely-to/nl.json').prompts as PromptItem[],
  ja: require('@/data/prompts/most-likely-to/ja.json').prompts as PromptItem[],
  ko: require('@/data/prompts/most-likely-to/ko.json').prompts as PromptItem[],
  'zh-Hant': require('@/data/prompts/most-likely-to/zh-Hant.json').prompts as PromptItem[],
  sv: require('@/data/prompts/most-likely-to/sv.json').prompts as PromptItem[],
  pl: require('@/data/prompts/most-likely-to/pl.json').prompts as PromptItem[],
  da: require('@/data/prompts/most-likely-to/da.json').prompts as PromptItem[],
  nb: require('@/data/prompts/most-likely-to/nb.json').prompts as PromptItem[],
  fi: require('@/data/prompts/most-likely-to/fi.json').prompts as PromptItem[],
  hi: require('@/data/prompts/most-likely-to/hi.json').prompts as PromptItem[],
  id: require('@/data/prompts/most-likely-to/id.json').prompts as PromptItem[],
}

function loadPrompts(locale: string): PromptItem[] {
  return PROMPTS[locale] ?? PROMPTS.en
}

export const mostLikelyToLogic = {
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
      text: 'Who is most likely to make everyone in this room smile?',
      intensity,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
