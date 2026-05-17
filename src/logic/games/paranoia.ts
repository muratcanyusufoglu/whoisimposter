import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

const PROMPTS: Record<string, PromptItem[]> = {
  en: require('@/data/prompts/paranoia/en.json').prompts as PromptItem[],
  tr: require('@/data/prompts/paranoia/tr.json').prompts as PromptItem[],
  de: require('@/data/prompts/paranoia/de.json').prompts as PromptItem[],
  fr: require('@/data/prompts/paranoia/fr.json').prompts as PromptItem[],
  es: require('@/data/prompts/paranoia/es.json').prompts as PromptItem[],
  pt: require('@/data/prompts/paranoia/pt.json').prompts as PromptItem[],
  ru: require('@/data/prompts/paranoia/ru.json').prompts as PromptItem[],
  ar: require('@/data/prompts/paranoia/ar.json').prompts as PromptItem[],
  it: require('@/data/prompts/paranoia/it.json').prompts as PromptItem[],
  nl: require('@/data/prompts/paranoia/nl.json').prompts as PromptItem[],
  ja: require('@/data/prompts/paranoia/ja.json').prompts as PromptItem[],
  ko: require('@/data/prompts/paranoia/ko.json').prompts as PromptItem[],
  'zh-Hant': require('@/data/prompts/paranoia/zh-Hant.json').prompts as PromptItem[],
  sv: require('@/data/prompts/paranoia/sv.json').prompts as PromptItem[],
  pl: require('@/data/prompts/paranoia/pl.json').prompts as PromptItem[],
}

function loadPrompts(locale: string): PromptItem[] {
  return PROMPTS[locale] ?? PROMPTS.en
}

export const paranoiaLogic = {
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
      id: 'fallback_paranoia',
      text: 'Who would survive a zombie apocalypse the longest?',
      intensity,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
