import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// PARANOIA — LOGIC
// Reader whispers a "Who would most likely..." question to the next player.
// That player whispers a name (points). Everyone sees the name but NOT
// the question. To reveal the question, the named person can pay a token.
// ─────────────────────────────────────────────────────────────────────────────

// Module-level cache
let _en: PromptItem[] | null = null
let _tr: PromptItem[] | null = null

function loadPrompts(locale: string): PromptItem[] {
  if (locale === 'tr') {
    if (!_tr) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      _tr = require('@/data/prompts/paranoia/tr.json').prompts as PromptItem[]
    }
    return _tr
  }
  if (!_en) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _en = require('@/data/prompts/paranoia/en.json').prompts as PromptItem[]
  }
  return _en
}

export const REVEAL_TOKEN_COST = 1

export const paranoiaLogic = {
  /**
   * Pick a random unused question matching intensity.
   * Auto-resets pool when exhausted.
   */
  getNextPrompt(
    locale: string,
    intensity: 'mild' | 'medium' | 'spicy',
    usedIds: string[],
  ): PromptItem {
    const all = loadPrompts(locale)
    const matches = all.filter((p) => p.intensity === intensity)
    const unused = matches.filter((p) => !usedIds.includes(p.id))
    const pool = unused.length > 0 ? unused : matches

    const fallback: PromptItem = {
      id: 'fallback_paranoia',
      text: 'Who in this group would survive a zombie apocalypse longest?',
      intensity,
    }

    return shuffle(pool)[0] ?? fallback
  },

  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
