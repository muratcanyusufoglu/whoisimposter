import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

let _en: PromptItem[] | null = null
let _tr: PromptItem[] | null = null

function loadPrompts(locale: string): PromptItem[] {
  if (locale === 'tr') {
    if (!_tr) _tr = (require('@/data/prompts/would-you-rather/tr.json').prompts as PromptItem[])
    return _tr
  }
  if (!_en) _en = (require('@/data/prompts/would-you-rather/en.json').prompts as PromptItem[])
  return _en
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
      text: 'Would you rather always know the truth or always believe in something hopeful?',
      intensity,
    }
    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
