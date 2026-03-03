// ─────────────────────────────────────────────────────────────────────────────
// PLAYER
// ─────────────────────────────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  color: string
  initials: string
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME MODES
// ─────────────────────────────────────────────────────────────────────────────

export type GameModeId =
  | 'imposter'
  | 'truth-dare'
  | 'never-have-i-ever'
  | 'most-likely-to'
  | 'hot-takes'
  | 'would-you-rather'
  | 'two-truths'
  | 'heads-up'
  | 'word-chain'
  | 'trivia-bet'
  | 'charades'
  | 'paranoia'

export type ImposterVariant = 'classic' | 'undercover' | 'ghost'

export interface GameModeDefinition {
  id: GameModeId
  nameKey: string
  descriptionKey: string
  emoji: string
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  minAge: 4 | 13 | 18
  estimatedMinutes: string
  hasCategories: boolean
  hasTimer: boolean
  supportsLocales: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  emoji: string
  nameKey: string
  descriptionKey: string
  isPremium: boolean
  minAge: 4 | 13 | 18
  wordCount: Record<string, number>
  availableLocales: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export interface GameConfig {
  mode: GameModeId
  variant?: ImposterVariant
  players: Player[]
  selectedCategories: string[]
  impostersCount: 1 | 2
  timerSeconds: 0 | 10 | 15 | 30
  soundEnabled: boolean
  hapticsEnabled: boolean
  locale: string
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────────────────────────────────────

export type RoundPhase = 'idle' | 'setup' | 'reveal' | 'play' | 'vote' | 'result'

export interface GameState {
  mode: GameModeId
  players: Player[]
  secretWord: string
  imposterIds: string[]
  revealOrder: string[]
  currentRevealIndex: number
  revealedPlayerIds: string[]
  playerCluesGiven: string[]
  votes: Record<string, string>
  roundPhase: RoundPhase
  roundNumber: number
  timerSeconds: 0 | 10 | 15 | 30
  impostersCount: 1 | 2
  selectedCategories: string[]
  locale: string
  imposterGuessedCorrectly: boolean | null
  usedWords: string[]
  startedAt: number
  soundEnabled: boolean
  hapticsEnabled: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL
// ─────────────────────────────────────────────────────────────────────────────

export interface RevealContent {
  isImposter: boolean
  word: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// VOTE RESULT
// ─────────────────────────────────────────────────────────────────────────────

export interface VoteResult {
  outcome: 'crew_wins' | 'imposter_wins' | 'tie'
  eliminatedId: string | null
  impostersCaught: boolean
  tally: Record<string, number>
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeId = 'dark' | 'light' | 'neon'
export type RatingState = 'unseen' | 'later' | 'done'

// ─────────────────────────────────────────────────────────────────────────────
// WORD / PROMPT DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface WordList {
  categoryId: string
  locale: string
  version: number
  words: string[]
}

export interface PromptItem {
  id: string
  text: string
  intensity: 'mild' | 'medium' | 'spicy'
  minAge?: 4 | 13 | 18
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

export type RevealRouteParams = {
  index: string
}
