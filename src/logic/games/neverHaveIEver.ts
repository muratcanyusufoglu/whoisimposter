import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

const PROMPTS: Record<string, PromptItem[]> = {
  en: require('@/data/prompts/never-have-i-ever/en.json').prompts as PromptItem[],
  tr: require('@/data/prompts/never-have-i-ever/tr.json').prompts as PromptItem[],
  de: require('@/data/prompts/never-have-i-ever/de.json').prompts as PromptItem[],
  fr: require('@/data/prompts/never-have-i-ever/fr.json').prompts as PromptItem[],
  es: require('@/data/prompts/never-have-i-ever/es.json').prompts as PromptItem[],
  pt: require('@/data/prompts/never-have-i-ever/pt.json').prompts as PromptItem[],
  ru: require('@/data/prompts/never-have-i-ever/ru.json').prompts as PromptItem[],
  ar: require('@/data/prompts/never-have-i-ever/ar.json').prompts as PromptItem[],
  it: require('@/data/prompts/never-have-i-ever/it.json').prompts as PromptItem[],
  nl: require('@/data/prompts/never-have-i-ever/nl.json').prompts as PromptItem[],
}

function loadPrompts(locale: string): PromptItem[] {
  return PROMPTS[locale] ?? PROMPTS.en
}

export const neverHaveIEverLogic = {
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
      text: 'Never have I ever laughed so hard I cried in public.',
      intensity,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
