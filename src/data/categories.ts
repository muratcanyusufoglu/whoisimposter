import { Category } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY DEFINITIONS
// All word counts reflect the bundled data at launch.
// Locales with no word list for a category are omitted from availableLocales.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  // ── FREE ──────────────────────────────────────────────────────────────────
  {
    id: 'food',
    emoji: '🍕',
    nameKey: 'categories.food',
    descriptionKey: 'categories.food_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'animals',
    emoji: '🐻',
    nameKey: 'categories.animals',
    descriptionKey: 'categories.animals_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'sports',
    emoji: '⚽',
    nameKey: 'categories.sports',
    descriptionKey: 'categories.sports_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'jobs',
    emoji: '👔',
    nameKey: 'categories.jobs',
    descriptionKey: 'categories.jobs_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'countries',
    emoji: '🌍',
    nameKey: 'categories.countries',
    descriptionKey: 'categories.countries_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'movies-tv',
    emoji: '🎬',
    nameKey: 'categories.movies',
    descriptionKey: 'categories.movies_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'music',
    emoji: '🎵',
    nameKey: 'categories.music',
    descriptionKey: 'categories.music_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'objects',
    emoji: '🪑',
    nameKey: 'categories.objects',
    descriptionKey: 'categories.objects_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'nature',
    emoji: '🌿',
    nameKey: 'categories.nature',
    descriptionKey: 'categories.nature_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },
  {
    id: 'hobbies',
    emoji: '🎮',
    nameKey: 'categories.hobbies',
    descriptionKey: 'categories.hobbies_desc',
    isPremium: false,
    minAge: 4,
    wordCount: { en: 55, tr: 55 },
    availableLocales: ['en', 'tr'],
  },

  // ── PREMIUM ───────────────────────────────────────────────────────────────
  {
    id: 'famous',
    emoji: '👤',
    nameKey: 'categories.famous',
    descriptionKey: 'categories.famous_desc',
    isPremium: true,
    minAge: 4,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'brands',
    emoji: '🏷️',
    nameKey: 'categories.brands',
    descriptionKey: 'categories.brands_desc',
    isPremium: true,
    minAge: 4,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'education',
    emoji: '📚',
    nameKey: 'categories.education',
    descriptionKey: 'categories.education_desc',
    isPremium: true,
    minAge: 4,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'technology',
    emoji: '💻',
    nameKey: 'categories.technology',
    descriptionKey: 'categories.technology_desc',
    isPremium: true,
    minAge: 4,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'mythology',
    emoji: '⚡',
    nameKey: 'categories.mythology',
    descriptionKey: 'categories.mythology_desc',
    isPremium: true,
    minAge: 4,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'spicy',
    emoji: '🌶️',
    nameKey: 'categories.spicy',
    descriptionKey: 'categories.spicy_desc',
    isPremium: true,
    minAge: 18,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'tv-series',
    emoji: '📺',
    nameKey: 'categories.tv_series',
    descriptionKey: 'categories.tv_series_desc',
    isPremium: true,
    minAge: 13,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'social',
    emoji: '📱',
    nameKey: 'categories.social',
    descriptionKey: 'categories.social_desc',
    isPremium: true,
    minAge: 13,
    wordCount: {},
    availableLocales: [],
  },
  {
    id: 'custom',
    emoji: '✏️',
    nameKey: 'categories.custom',
    descriptionKey: 'categories.custom_desc',
    isPremium: true,
    minAge: 4,
    wordCount: {},
    availableLocales: [],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export const FREE_CATEGORIES = CATEGORIES.filter((c) => !c.isPremium)
export const PREMIUM_CATEGORIES = CATEGORIES.filter((c) => c.isPremium)
