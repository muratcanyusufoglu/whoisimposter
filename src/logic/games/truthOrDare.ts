import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

const PROMPTS: Record<string, PromptItem[]> = {
  en: require('@/data/prompts/truth-dare/en.json').prompts as PromptItem[],
  tr: require('@/data/prompts/truth-dare/tr.json').prompts as PromptItem[],
  de: require('@/data/prompts/truth-dare/de.json').prompts as PromptItem[],
  fr: require('@/data/prompts/truth-dare/fr.json').prompts as PromptItem[],
  es: require('@/data/prompts/truth-dare/es.json').prompts as PromptItem[],
  pt: require('@/data/prompts/truth-dare/pt.json').prompts as PromptItem[],
  ru: require('@/data/prompts/truth-dare/ru.json').prompts as PromptItem[],
  ar: require('@/data/prompts/truth-dare/ar.json').prompts as PromptItem[],
  it: require('@/data/prompts/truth-dare/it.json').prompts as PromptItem[],
  nl: require('@/data/prompts/truth-dare/nl.json').prompts as PromptItem[],
  ja: require('@/data/prompts/truth-dare/ja.json').prompts as PromptItem[],
  ko: require('@/data/prompts/truth-dare/ko.json').prompts as PromptItem[],
  'zh-Hant': require('@/data/prompts/truth-dare/zh-Hant.json').prompts as PromptItem[],
  sv: require('@/data/prompts/truth-dare/sv.json').prompts as PromptItem[],
  pl: require('@/data/prompts/truth-dare/pl.json').prompts as PromptItem[],
}

function loadPrompts(locale: string): PromptItem[] {
  return PROMPTS[locale] ?? PROMPTS.en
}

export const truthOrDareLogic = {
  getNextPrompt(
    locale: string,
    intensity: 'mild' | 'medium' | 'spicy',
    usedIds: string[],
    type: 'truth' | 'dare',
  ): PromptItem {
    const all     = loadPrompts(locale)
    const matches = all.filter((p) => p.intensity === intensity && p.type === type)
    const unused  = matches.filter((p) => !usedIds.includes(p.id))
    const pool    = unused.length > 0 ? unused : matches

    const fallback: PromptItem = {
      id: 'fallback_truth_or_dare',
      text: type === 'truth'
        ? 'What is your most embarrassing childhood memory?'
        : 'Do your best impression of someone in the room.',
      intensity,
      type,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
