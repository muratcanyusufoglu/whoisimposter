import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

const PROMPTS: Record<string, PromptItem[]> = {
  en: require('@/data/prompts/would-you-rather/en.json').prompts as PromptItem[],
  tr: require('@/data/prompts/would-you-rather/tr.json').prompts as PromptItem[],
  de: require('@/data/prompts/would-you-rather/de.json').prompts as PromptItem[],
  fr: require('@/data/prompts/would-you-rather/fr.json').prompts as PromptItem[],
  es: require('@/data/prompts/would-you-rather/es.json').prompts as PromptItem[],
  pt: require('@/data/prompts/would-you-rather/pt.json').prompts as PromptItem[],
  ru: require('@/data/prompts/would-you-rather/ru.json').prompts as PromptItem[],
  ar: require('@/data/prompts/would-you-rather/ar.json').prompts as PromptItem[],
  it: require('@/data/prompts/would-you-rather/it.json').prompts as PromptItem[],
  nl: require('@/data/prompts/would-you-rather/nl.json').prompts as PromptItem[],
  ja: require('@/data/prompts/would-you-rather/ja.json').prompts as PromptItem[],
  ko: require('@/data/prompts/would-you-rather/ko.json').prompts as PromptItem[],
  'zh-Hant': require('@/data/prompts/would-you-rather/zh-Hant.json').prompts as PromptItem[],
  sv: require('@/data/prompts/would-you-rather/sv.json').prompts as PromptItem[],
  pl: require('@/data/prompts/would-you-rather/pl.json').prompts as PromptItem[],
  da: require('@/data/prompts/would-you-rather/da.json').prompts as PromptItem[],
  nb: require('@/data/prompts/would-you-rather/nb.json').prompts as PromptItem[],
  fi: require('@/data/prompts/would-you-rather/fi.json').prompts as PromptItem[],
  hi: require('@/data/prompts/would-you-rather/hi.json').prompts as PromptItem[],
  id: require('@/data/prompts/would-you-rather/id.json').prompts as PromptItem[],
}

function loadPrompts(locale: string): PromptItem[] {
  return PROMPTS[locale] ?? PROMPTS.en
}

export const wouldYouRatherLogic = {
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
      text: 'Would you rather always be 10 minutes late or always be 20 minutes early?',
      intensity,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
