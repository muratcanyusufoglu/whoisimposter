// ─────────────────────────────────────────────────────────────────────────────
// EMOJI PICKER DATA — 5 categories × 8 emojis each
// labelKey references i18n keys in the "emojiPicker" namespace
// ─────────────────────────────────────────────────────────────────────────────

export interface EmojiCategory {
  id: string
  labelKey: string
  emojis: string[]
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'people',
    labelKey: 'emojiPicker.people',
    emojis: ['😀', '😎', '🤩', '🥸', '🤠', '🥳', '😈', '🤖'],
  },
  {
    id: 'animals',
    labelKey: 'emojiPicker.animals',
    emojis: ['🐱', '🐶', '🦊', '🐸', '🐼', '🦁', '🐺', '🦋'],
  },
  {
    id: 'food',
    labelKey: 'emojiPicker.food',
    emojis: ['🍕', '🌮', '🍜', '🍣', '🍔', '🧁', '🍩', '🥑'],
  },
  {
    id: 'objects',
    labelKey: 'emojiPicker.objects',
    emojis: ['⚽', '🎸', '🎮', '🎯', '🚀', '🏆', '💎', '🔥'],
  },
  {
    id: 'symbols',
    labelKey: 'emojiPicker.symbols',
    emojis: ['⭐', '❤️', '⚡', '🌈', '💫', '🌙', '👑', '💀'],
  },
]
