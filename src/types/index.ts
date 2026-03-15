// ─────────────────────────────────────────────────────────────────────────────
// PLAYER
// ─────────────────────────────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  color: string
  initials: string
  emoji?: string   // optional emoji avatar, e.g. "🐱"
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

export type ThemeId = 'dark' | 'light' | 'neon' | 'candy' | 'party' | 'sunset' | 'golden' | 'ember' | 'aurora' | 'custom'
export type RatingState = 'unseen' | 'later' | 'done'

// ─────────────────────────────────────────────────────────────────────────────
// GAME PRESET
// ─────────────────────────────────────────────────────────────────────────────

export interface GamePreset {
  id: string
  name: string              // max 24 chars, user-chosen
  modeId: GameModeId
  playerNames: string[]
  categories: string[]
  impostersCount: 1 | 2
  timerSeconds: 0 | 10 | 15 | 30
  createdAt: number
  emoji?: string            // decorative preset icon
}

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
  /** 'truth' | 'dare' for truth-or-dare; undefined for other games */
  type?: 'truth' | 'dare'
  tags?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

export type RevealRouteParams = {
  index: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION SCORING
// ─────────────────────────────────────────────────────────────────────────────

export interface PointBreakdown {
  base: number       // base points: 0 | 1 | 2 | 3
  bonusGuess: number // +1 if imposter guessed word correctly after being caught
}

export interface PlayerRoundPoints {
  playerId: string
  points: number
  breakdown: PointBreakdown
}

/** Cumulative session points per playerId */
export type SessionScores = Record<string, number>

export interface StreakState {
  currentHolder: 'crew' | 'imposter' | null
  count: number
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFETIME STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifetime stats for a single named player.
 * Stored in statsStore keyed by normalized name (lowercased, trimmed).
 * This means "Alice" and "alice" share the same stats across sessions.
 */
export interface PlayerLifetimeStats {
  gamesPlayed: number
  wins: number                  // crew wins (as crew) OR imposter wins (as imposter)
  timesImposter: number
  timesCaught: number           // times caught as imposter
  timesVotedCorrectly: number   // voted for the imposter in a crew_win round
  imposterWins: number          // escaped as imposter
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export type AchievementId =
  | 'first_blood'       // First crew win
  | 'ghost'             // Win as imposter 3x in a row (session streak)
  | 'mind_reader'       // Guessed secret word after being caught
  | 'unanimous'         // All crew members voted for the imposter
  | 'social_butterfly'  // Played 10 games total (lifetime)
  | 'sharp_eye'         // Voted for imposter correctly 5 times (lifetime)
  | 'survivor'          // Won as crew 10 times (lifetime)
  | 'master_disguise'   // Won as imposter 5 times (lifetime)

export interface AchievementDefinition {
  id: AchievementId
  titleKey: string  // i18n key → 'achievements.first_blood.title'
  descKey: string   // i18n key → 'achievements.first_blood.desc'
  emoji: string
}

export interface UnlockedAchievement {
  id: AchievementId
  unlockedAt: number // Date.now() timestamp
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND RECORD PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export interface RecordRoundParams {
  mode: GameModeId
  playerNames: string[]
  imposterNames: string[]
  outcome: 'crew_wins' | 'imposter_wins' | 'tie'
  caughtNames: string[]           // imposters who were voted out
  correctGuess: boolean           // imposter guessed the word after being caught
  votedForImposterNames: string[] // crew members who voted correctly
}
