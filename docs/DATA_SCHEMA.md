# DATA SCHEMA
**Who's the Imposter?** — Data Structures & Content Specification

All data is bundled with the app (offline-first). No API calls for game content.

---

## 1. WORD LIST SCHEMA

### File location
```
src/data/words/{locale}/{categoryId}.json
```

### JSON structure
```json
{
  "categoryId": "food",
  "locale": "tr",
  "version": 1,
  "words": [
    "Lahmacun", "Döner", "Börek", "Baklava", "Simit",
    "Mantı", "Çorba", "Pilav", "Kebap", "Pide"
  ]
}
```

### Rules
- Minimum **50 words** per category per locale at launch
- Words must be: concrete nouns, instantly recognizable, culturally appropriate
- No abstract concepts ("freedom", "justice")
- No phrases — single words or very short compound nouns max
- Capitalized (proper noun style for display)
- Each locale's list is independently curated — not translated from EN

---

## 2. CATEGORY DEFINITIONS

```typescript
// src/data/categories.ts

export interface Category {
  id: string
  emoji: string
  nameKey: string        // i18n key: 'categories.food'
  descriptionKey: string // i18n key: 'categories.food_desc'
  isPremium: boolean
  minAge: 4 | 13 | 18
  wordCount: Record<string, number>  // { en: 80, tr: 75, de: 60, ... }
  availableLocales: string[]
}

export const CATEGORIES: Category[] = [
  // FREE
  { id: 'food',       emoji: '🍕', isPremium: false, minAge: 4,  nameKey: 'categories.food' },
  { id: 'animals',    emoji: '🐻', isPremium: false, minAge: 4,  nameKey: 'categories.animals' },
  { id: 'sports',     emoji: '⚽', isPremium: false, minAge: 4,  nameKey: 'categories.sports' },
  { id: 'jobs',       emoji: '👔', isPremium: false, minAge: 4,  nameKey: 'categories.jobs' },
  { id: 'countries',  emoji: '🌍', isPremium: false, minAge: 4,  nameKey: 'categories.countries' },
  { id: 'movies-tv',  emoji: '🎬', isPremium: false, minAge: 4,  nameKey: 'categories.movies' },
  { id: 'music',      emoji: '🎵', isPremium: false, minAge: 4,  nameKey: 'categories.music' },
  { id: 'objects',    emoji: '🪑', isPremium: false, minAge: 4,  nameKey: 'categories.objects' },
  { id: 'nature',     emoji: '🌿', isPremium: false, minAge: 4,  nameKey: 'categories.nature' },
  { id: 'hobbies',    emoji: '🎮', isPremium: false, minAge: 4,  nameKey: 'categories.hobbies' },
  // PREMIUM
  { id: 'famous',     emoji: '👤', isPremium: true,  minAge: 4,  nameKey: 'categories.famous' },
  { id: 'brands',     emoji: '🏷️', isPremium: true,  minAge: 4,  nameKey: 'categories.brands' },
  { id: 'education',  emoji: '📚', isPremium: true,  minAge: 4,  nameKey: 'categories.education' },
  { id: 'technology', emoji: '💻', isPremium: true,  minAge: 4,  nameKey: 'categories.technology' },
  { id: 'mythology',  emoji: '⚡', isPremium: true,  minAge: 4,  nameKey: 'categories.mythology' },
  { id: 'spicy',      emoji: '🌶️', isPremium: true,  minAge: 18, nameKey: 'categories.spicy' },
  { id: 'tv-series',  emoji: '📺', isPremium: true,  minAge: 13, nameKey: 'categories.tv_series' },
  { id: 'social',     emoji: '📱', isPremium: true,  minAge: 13, nameKey: 'categories.social' },
  { id: 'custom',     emoji: '✏️', isPremium: true,  minAge: 4,  nameKey: 'categories.custom' },
]
```

---

## 3. GAME MODE DEFINITIONS

```typescript
// src/data/games/index.ts

export interface GameModeDefinition {
  id: GameMode
  nameKey: string
  descriptionKey: string
  emoji: string
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  minAge: 4 | 13 | 18
  estimatedMinutes: string  // "5-15"
  hasCategories: boolean    // does this game use category/word selection?
  hasTimer: boolean
  supportsLocales: string[] // which locales have prompt content
}

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: 'imposter',
    emoji: '🕵️',
    minPlayers: 3, maxPlayers: 15,
    isPremium: false, minAge: 4,
    estimatedMinutes: '5-15',
    hasCategories: true, hasTimer: true,
    nameKey: 'games.imposter.name',
    descriptionKey: 'games.imposter.description',
    supportsLocales: ['en','tr','de','fr','es','pt','ru','ar','it','nl'],
  },
  {
    id: 'truth-dare',
    emoji: '🎲',
    minPlayers: 2, maxPlayers: 15,
    isPremium: false, minAge: 13,
    estimatedMinutes: '10-30',
    hasCategories: false, hasTimer: false,
    nameKey: 'games.truth_dare.name',
    descriptionKey: 'games.truth_dare.description',
    supportsLocales: ['en','tr','de','fr','es'],
  },
  {
    id: 'never-have-i-ever',
    emoji: '🤚',
    minPlayers: 3, maxPlayers: 15,
    isPremium: false, minAge: 13,
    estimatedMinutes: '10-20',
    hasCategories: false, hasTimer: false,
    nameKey: 'games.nhie.name',
    descriptionKey: 'games.nhie.description',
    supportsLocales: ['en','tr','de','fr','es'],
  },
  {
    id: 'most-likely-to',
    emoji: '👆',
    minPlayers: 3, maxPlayers: 15,
    isPremium: false, minAge: 13,
    estimatedMinutes: '5-15',
    hasCategories: false, hasTimer: false,
    nameKey: 'games.mlt.name',
    descriptionKey: 'games.mlt.description',
    supportsLocales: ['en','tr','de','fr','es'],
  },
  {
    id: 'hot-takes',
    emoji: '🔥',
    minPlayers: 3, maxPlayers: 15,
    isPremium: false, minAge: 13,
    estimatedMinutes: '10-20',
    hasCategories: false, hasTimer: false,
    nameKey: 'games.hot_takes.name',
    descriptionKey: 'games.hot_takes.description',
    supportsLocales: ['en','tr'],
  },
  {
    id: 'would-you-rather',
    emoji: '🤔',
    minPlayers: 2, maxPlayers: 15,
    isPremium: false, minAge: 4,
    estimatedMinutes: '5-15',
    hasCategories: false, hasTimer: false,
    nameKey: 'games.wyr.name',
    descriptionKey: 'games.wyr.description',
    supportsLocales: ['en','tr','de','fr','es'],
  },
  {
    id: 'two-truths',
    emoji: '🃏',
    minPlayers: 3, maxPlayers: 10,
    isPremium: true, minAge: 13,
    estimatedMinutes: '10-20',
    hasCategories: false, hasTimer: true,
    nameKey: 'games.two_truths.name',
    descriptionKey: 'games.two_truths.description',
    supportsLocales: ['en','tr'],
  },
  {
    id: 'heads-up',
    emoji: '📱',
    minPlayers: 3, maxPlayers: 15,
    isPremium: true, minAge: 4,
    estimatedMinutes: '5-15',
    hasCategories: true, hasTimer: true,
    nameKey: 'games.heads_up.name',
    descriptionKey: 'games.heads_up.description',
    supportsLocales: ['en','tr','de','fr','es'],
  },
  {
    id: 'word-chain',
    emoji: '🔗',
    minPlayers: 2, maxPlayers: 15,
    isPremium: true, minAge: 4,
    estimatedMinutes: '5-10',
    hasCategories: false, hasTimer: true,
    nameKey: 'games.word_chain.name',
    descriptionKey: 'games.word_chain.description',
    supportsLocales: ['en','tr','de'],
  },
  {
    id: 'trivia-bet',
    emoji: '🎯',
    minPlayers: 3, maxPlayers: 15,
    isPremium: true, minAge: 4,
    estimatedMinutes: '10-20',
    hasCategories: false, hasTimer: true,
    nameKey: 'games.trivia.name',
    descriptionKey: 'games.trivia.description',
    supportsLocales: ['en','tr'],
  },
  {
    id: 'charades',
    emoji: '🎭',
    minPlayers: 4, maxPlayers: 15,
    isPremium: true, minAge: 4,
    estimatedMinutes: '10-20',
    hasCategories: true, hasTimer: true,
    nameKey: 'games.charades.name',
    descriptionKey: 'games.charades.description',
    supportsLocales: ['en','tr','de','fr','es'],
  },
  {
    id: 'paranoia',
    emoji: '😨',
    minPlayers: 3, maxPlayers: 12,
    isPremium: true, minAge: 13,
    estimatedMinutes: '10-20',
    hasCategories: false, hasTimer: false,
    nameKey: 'games.paranoia.name',
    descriptionKey: 'games.paranoia.description',
    supportsLocales: ['en','tr'],
  },
]
```

---

## 4. PROMPT SCHEMA (Non-Imposter Games)

```typescript
// src/data/prompts/schema.ts

export interface Prompt {
  id: string              // unique, stable across updates
  gameId: GameMode
  locale: string
  text: string            // The prompt text (may contain {player} placeholder)
  intensity: 'mild' | 'medium' | 'spicy'
  minAge: 4 | 13 | 18
  tags?: string[]         // for filtering: 'relationships', 'work', 'family', etc.
}
```

### File location
```
src/data/prompts/{gameId}/{locale}.json
```

### Example: `truth-dare/en.json`
```json
{
  "gameId": "truth-dare",
  "locale": "en",
  "version": 1,
  "prompts": [
    {
      "id": "td_en_001",
      "type": "truth",
      "intensity": "mild",
      "minAge": 4,
      "text": "What's the most embarrassing thing that happened to you this year?"
    },
    {
      "id": "td_en_002",
      "type": "dare",
      "intensity": "mild",
      "minAge": 4,
      "text": "Do your best impression of another player."
    },
    {
      "id": "td_en_101",
      "type": "truth",
      "intensity": "medium",
      "minAge": 13,
      "text": "What's the biggest lie you've ever told someone in this room?"
    }
  ]
}
```

### Prompt counts required at launch
| Game | Locale | Min prompts |
|------|--------|-------------|
| truth-dare | EN | 200 (100 truth, 100 dare) |
| truth-dare | TR | 200 |
| never-have-i-ever | EN | 150 |
| never-have-i-ever | TR | 150 |
| most-likely-to | EN | 100 |
| most-likely-to | TR | 100 |
| hot-takes | EN | 100 |
| hot-takes | TR | 100 |
| would-you-rather | EN | 150 |
| would-you-rather | TR | 150 |
| trivia-bet | EN | 300 |
| trivia-bet | TR | 200 |
| paranoia | EN | 100 |
| paranoia | TR | 100 |

---

## 5. ASYNCSTORAGE KEY REGISTRY

All storage keys in one place. Never hardcode keys in components.

```typescript
// src/utils/storage.ts

export const STORAGE_KEYS = {
  // Onboarding & lifecycle
  ONBOARDING_COMPLETED:    '@onboarding_completed',
  SELECTED_LANGUAGE:       '@selected_language',
  SELECTED_THEME:          '@selected_theme',

  // Rating
  RATING_STATE:            '@rating_state',        // 'unseen' | 'later' | 'done'
  RATING_LAST_PROMPT:      '@rating_last_prompt',  // timestamp

  // Paywall
  PAYWALL_SEEN_COUNT:      '@paywall_seen_count',

  // Game settings (last used)
  LAST_PLAYERS:            '@last_players',         // Player[]
  LAST_CATEGORIES:         '@last_categories',      // string[]
  LAST_GAME_MODE:          '@last_game_mode',       // GameMode
  LAST_IMPOSTERS_COUNT:    '@last_imposters_count',
  LAST_TIMER:              '@last_timer',

  // Stats
  GAMES_COMPLETED:         '@games_completed',      // number
  USED_WORDS:              '@used_words',           // string[] (session)

  // Custom words (premium)
  CUSTOM_WORDS:            '@custom_words',         // Record<categoryId, string[]>

  // Settings
  SOUND_ENABLED:           '@sound_enabled',
  HAPTICS_ENABLED:         '@haptics_enabled',
} as const

// Typed helper wrappers
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch { /* fail silently */ }
  },

  async remove(key: string): Promise<void> {
    try { await AsyncStorage.removeItem(key) } catch { /* silent */ }
  },
}
```

---

## 6. I18N KEY STRUCTURE

```json
// src/i18n/locales/en.json (abbreviated)
{
  "app": {
    "name": "Who's the Imposter?"
  },
  "onboarding": {
    "language": {
      "title": "Choose your language",
      "continue": "Continue"
    },
    "welcome": {
      "headline": "Who's lying in your group?",
      "benefit1": "12+ party games",
      "benefit2": "No internet needed",
      "benefit3": "3–15 players",
      "continue": "Let's go →"
    },
    "howToPlay": {
      "title": "How to Play",
      "step1_title": "Pass the phone",
      "step1_desc": "Each player taps their name privately",
      "step2_title": "Learn your word",
      "step2_desc": "Everyone sees the same word — except the Imposter",
      "step3_title": "Find the liar",
      "step3_desc": "Give clues, vote, and catch the Imposter!"
    },
    "showcase": {
      "title": "12+ Party Games",
      "cta": "Let's Play!"
    }
  },
  "home": {
    "title": "Party Games",
    "quickResume": "Continue last game →"
  },
  "setup": {
    "players": "Players",
    "addPlayer": "Add player name",
    "addPlayerCta": "Add",
    "minPlayersWarning": "Need at least {{count}} players",
    "maxPlayersWarning": "Maximum {{count}} players",
    "categories": "Categories",
    "selectAll": "All",
    "mode": "Game Mode",
    "advanced": "Advanced Settings",
    "imposters": "Imposters",
    "timer": "Timer per player",
    "timerOff": "Off",
    "startGame": "Start Game"
  },
  "reveal": {
    "instruction": "Hold close — don't show anyone",
    "holdToReveal": "Hold to reveal",
    "crew_subtitle": "Give ONE clue. Don't give it away.",
    "imposter_line1": "YOU ARE THE",
    "imposter_line2": "IMPOSTER!",
    "imposter_subtitle": "Blend in. You don't know the word.",
    "next": "Next Player →",
    "autoBlur": "Tap to hide"
  },
  "play": {
    "round": "Round {{number}}",
    "startVoting": "Start Voting"
  },
  "vote": {
    "title": "Who is the Imposter?",
    "reveal": "Reveal Votes",
    "waiting": "Waiting for all votes..."
  },
  "result": {
    "caught": "CAUGHT!",
    "escaped": "THEY GOT AWAY",
    "secretWord": "The secret word was:",
    "guessPrompt": "Can {{name}} guess the secret word?",
    "guessYes": "Yes — They guessed it!",
    "guessNo": "No — They failed",
    "crewWins": "Crew Wins! 🎉",
    "imposterWins": "Imposter Wins! 🕵️",
    "playAgain": "Play Again",
    "newGame": "New Game",
    "share": "Share Result"
  },
  "paywall": {
    "title": "WHO'S THE IMPOSTER PRO",
    "benefit1": "All 20 categories",
    "benefit2": "2 imposters mode",
    "benefit3": "All 12 party games",
    "benefit4": "Custom word lists",
    "benefit5": "Ad-free experience",
    "monthly": "Monthly",
    "yearly": "Yearly",
    "bestValue": "Best Value",
    "savings": "Save {{percent}}%",
    "cta": "Start {{days}}-Day Free Trial",
    "cancelAnytime": "Cancel anytime",
    "restore": "Restore Purchases"
  },
  "rating": {
    "title": "Enjoying the game?",
    "subtitle": "A 5-star rating helps us a lot!",
    "cta": "Rate Now ⭐",
    "later": "Maybe Later",
    "no": "No thanks"
  },
  "settings": {
    "title": "Settings",
    "theme": "Theme",
    "language": "Language",
    "sound": "Sound Effects",
    "haptics": "Haptic Feedback",
    "upgrade": "Upgrade to PRO",
    "restore": "Restore Purchases",
    "rate": "Rate the App",
    "privacy": "Privacy Policy",
    "terms": "Terms of Use",
    "version": "Version {{version}}"
  },
  "categories": {
    "food": "Food & Drinks",
    "animals": "Animals",
    "sports": "Sports",
    "jobs": "Jobs",
    "countries": "Countries",
    "movies": "Movies & TV",
    "music": "Music",
    "objects": "Objects",
    "nature": "Nature",
    "hobbies": "Hobbies",
    "famous": "Famous People",
    "brands": "Brands",
    "education": "Education",
    "technology": "Technology",
    "mythology": "Mythology",
    "spicy": "Spicy 🌶️",
    "tv_series": "TV Series",
    "social": "Social Media",
    "custom": "My Custom List"
  },
  "games": {
    "imposter": {
      "name": "Who's the Imposter?",
      "description": "One secret word. One liar. Find them."
    },
    "truth_dare": {
      "name": "Truth or Dare",
      "description": "Answer honestly or face a dare."
    }
  },
  "common": {
    "pro": "PRO",
    "locked": "Locked",
    "free": "Free",
    "back": "Back",
    "close": "Close",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "loading": "Loading..."
  }
}
```

---

## 7. WORD LIST SAMPLES

### `src/data/words/tr/food.json` (Turkish — culturally adapted)
```json
{
  "categoryId": "food",
  "locale": "tr",
  "version": 1,
  "words": [
    "Lahmacun", "Döner", "Börek", "Baklava", "Simit",
    "Mantı", "Pide", "Kebap", "Çorba", "Pilav",
    "Köfte", "Gözleme", "Katmer", "Künefe", "Revani",
    "Mercimek", "Bulgur", "Cacık", "Ayran", "Rakı",
    "Çay", "Kahve", "Menemen", "Sucuk", "Pastırma",
    "Midye", "Hamsi", "Balık", "Patlıcan", "Biber"
  ]
}
```

### `src/data/words/en/food.json` (English — culturally adapted)
```json
{
  "categoryId": "food",
  "locale": "en",
  "version": 1,
  "words": [
    "Pizza", "Sushi", "Burger", "Taco", "Croissant",
    "Ramen", "Pasta", "Pancakes", "Steak", "Sushi",
    "Burrito", "Donut", "Bagel", "Sandwich", "Waffle",
    "Lobster", "Oyster", "Truffle", "Avocado", "Kimchi",
    "Pretzel", "Churros", "Pho", "Dim Sum", "Falafel",
    "Cheesecake", "Tiramisu", "Gelato", "Macarons", "Crepe"
  ]
}
```

### `src/data/words/tr/famous.json` (Famous People — locale-specific)
```json
{
  "categoryId": "famous",
  "locale": "tr",
  "version": 1,
  "words": [
    "Atatürk", "Tarkan", "Sezen Aksu", "Fatih Terim",
    "Ajda Pekkan", "Cengiz Han", "Mevlana", "Sinan",
    "Kurtlar Vadisi", "Kemal Sunal", "Müslüm Gürses",
    "Arda Turan", "Hakan Şükür", "Mehmet Yılmaz"
  ]
}
```
