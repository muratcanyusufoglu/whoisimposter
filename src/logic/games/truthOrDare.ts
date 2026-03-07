import { shuffle } from '@/utils/shuffle'
import type { PromptItem } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TRUTH OR DARE LOGIC
// Selects random prompts from the bundled data, respecting intensity,
// minAge, type (truth/dare), and avoiding repeats.
// ─────────────────────────────────────────────────────────────────────────────

// Lazy-loaded so JSON doesn't bloat the initial JS bundle
let _en: PromptItem[] | null = null
let _tr: PromptItem[] | null = null

function loadPrompts(locale: string): PromptItem[] {
  if (locale === 'tr') {
    if (!_tr) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      _tr = (require('@/data/prompts/truth-dare/tr.json').prompts as PromptItem[])
    }
    return _tr
  }
  if (!_en) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _en = (require('@/data/prompts/truth-dare/en.json').prompts as PromptItem[])
  }
  return _en
}

export const truthOrDareLogic = {
  /**
   * Pick a random unused prompt matching intensity + type.
   * If all matching prompts are used, resets that pool automatically.
   */
  getNextPrompt(
    locale: string,
    intensity: 'mild' | 'medium' | 'spicy',
    usedIds: string[],
    type: 'truth' | 'dare',
  ): PromptItem {
    const all = loadPrompts(locale)
    const matches = all.filter((p) => p.intensity === intensity && p.type === type)
    const unused  = matches.filter((p) => !usedIds.includes(p.id))
    const pool    = unused.length > 0 ? unused : matches   // auto-reset when exhausted

    const fallback: PromptItem = {
      id: 'fallback',
      text: type === 'truth'
        ? 'What is something about yourself you rarely share?'
        : 'Do your best dance move for 10 seconds.',
      intensity,
      type,
    }

    return shuffle(pool)[0] ?? fallback
  },

  /** All prompts for a locale (used for pre-loading / counting) */
  getAll(locale: string): PromptItem[] {
    return loadPrompts(locale)
  },
}
