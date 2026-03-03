# GAME LOGIC
**Who's the Imposter?** — Modular Logic Layer Specification

All game logic lives in `src/logic/`. These are pure functions and classes — zero React, zero UI, zero AsyncStorage. They can be unit-tested independently.

---

## 1. ARCHITECTURE PRINCIPLE

```
UI Layer (components, screens)
      ↓ calls
Store Layer (Zustand — gameStore, settingsStore)
      ↓ calls
Logic Layer (src/logic/ — pure functions)
      ↓ reads
Data Layer (src/data/ — word lists, game definitions)
```

**Rule:** Components never call logic functions directly. They dispatch actions through the store. The store calls logic functions and updates state.

---

## 2. CORE MODULES

### 2.1 `gameEngine.ts` — Orchestrator

```typescript
// src/logic/gameEngine.ts

import { GameConfig, GameState, GameMode } from '../types'
import { imposterLogic } from './games/imposter'
import { wordSelector } from './wordSelector'
import { playerManager } from './playerManager'

export const gameEngine = {
  
  /**
   * Initialize a new game from config.
   * Returns initial GameState ready for first reveal.
   */
  initGame(config: GameConfig): GameState {
    const { mode, players, categories, impostersCount, timerSeconds, locale } = config

    // Validate
    const validation = playerManager.validate(players)
    if (!validation.valid) throw new Error(validation.error)

    // Pick secret word (for imposter mode)
    const secretWord = mode === 'imposter'
      ? wordSelector.pick(categories, locale, [])
      : ''

    // Assign imposters
    const imposterIds = mode === 'imposter'
      ? imposterLogic.assignImposters(players, impostersCount)
      : []

    // Shuffle player reveal order
    const revealOrder = playerManager.shuffleOrder(players.map(p => p.id))

    return {
      mode,
      players,
      secretWord,
      imposterIds,
      revealOrder,
      currentRevealIndex: 0,
      revealedPlayerIds: [],
      playerCluesGiven: [],
      votes: {},
      roundPhase: 'reveal',
      roundNumber: 1,
      timerSeconds,
      impostersCount,
      selectedCategories: categories,
      locale,
      imposterGuessedCorrectly: null,
      startedAt: Date.now(),
    }
  },

  /**
   * Advance to next player reveal. Returns updated index.
   */
  advanceReveal(state: GameState): Partial<GameState> {
    const next = state.currentRevealIndex + 1
    const allRevealed = next >= state.players.length
    return {
      currentRevealIndex: allRevealed ? state.currentRevealIndex : next,
      revealedPlayerIds: [...state.revealedPlayerIds, state.revealOrder[state.currentRevealIndex]],
      roundPhase: allRevealed ? 'play' : 'reveal',
    }
  },

  /**
   * Resolve votes and determine outcome.
   */
  resolveVotes(state: GameState): VoteResult {
    return imposterLogic.resolveVotes(state.votes, state.players, state.imposterIds)
  },

  /**
   * Prepare next round (same config, new word).
   */
  nextRound(state: GameState): GameState {
    const usedWords = state.usedWords ?? [state.secretWord]
    const secretWord = wordSelector.pick(state.selectedCategories, state.locale, usedWords)
    const imposterIds = imposterLogic.assignImposters(state.players, state.impostersCount)
    const revealOrder = playerManager.shuffleOrder(state.players.map(p => p.id))

    return {
      ...state,
      secretWord,
      imposterIds,
      revealOrder,
      currentRevealIndex: 0,
      revealedPlayerIds: [],
      playerCluesGiven: [],
      votes: {},
      roundPhase: 'reveal',
      roundNumber: state.roundNumber + 1,
      imposterGuessedCorrectly: null,
      usedWords: [...usedWords, secretWord],
    }
  },
}
```

---

### 2.2 `imposterLogic.ts`

```typescript
// src/logic/games/imposter.ts

import { shuffle } from '../utils/shuffle'

export const imposterLogic = {

  /**
   * Randomly assign N players as imposters.
   * Ensures imposters are never adjacent in the original list
   * (reduces chance of being caught by proximity).
   */
  assignImposters(players: Player[], count: 1 | 2): string[] {
    if (players.length < 3) throw new Error('Need at least 3 players')
    if (count === 2 && players.length < 5) return [shuffle(players)[0].id] // fallback to 1

    const shuffled = shuffle([...players])
    return shuffled.slice(0, count).map(p => p.id)
  },

  /**
   * Determine what a specific player sees on reveal.
   */
  getRevealContent(playerId: string, secretWord: string, imposterIds: string[]): RevealContent {
    const isImposter = imposterIds.includes(playerId)
    return {
      isImposter,
      word: isImposter ? null : secretWord,
      // For Undercover mode: different word for some crew members
    }
  },

  /**
   * Tally votes and determine if imposters were caught.
   */
  resolveVotes(
    votes: Record<string, string>, // voterId → targetId
    players: Player[],
    imposterIds: string[]
  ): VoteResult {
    // Count votes per target
    const tally: Record<string, number> = {}
    Object.values(votes).forEach(targetId => {
      tally[targetId] = (tally[targetId] ?? 0) + 1
    })

    // Find player(s) with most votes
    const maxVotes = Math.max(...Object.values(tally))
    const topVoted = Object.entries(tally)
      .filter(([, count]) => count === maxVotes)
      .map(([id]) => id)

    // Tie: no one is eliminated this round
    if (topVoted.length > 1) {
      return { outcome: 'tie', eliminatedId: null, impostersCaught: false, tally }
    }

    const eliminatedId = topVoted[0]
    const impostersCaught = imposterIds.includes(eliminatedId)

    return {
      outcome: impostersCaught ? 'crew_wins' : 'imposter_wins',
      eliminatedId,
      impostersCaught,
      tally,
    }
  },

  /**
   * Check if imposter's word guess is correct.
   * Case-insensitive, trim whitespace.
   */
  checkImposterGuess(guess: string, secretWord: string): boolean {
    return guess.trim().toLowerCase() === secretWord.trim().toLowerCase()
  },
}
```

---

### 2.3 `wordSelector.ts`

```typescript
// src/logic/wordSelector.ts

// Word lists are imported statically (offline-first)
// Each import: { categoryId, locale, words: string[] }

export const wordSelector = {
  locale: 'en',

  setLocale(locale: string) {
    this.locale = locale
  },

  /**
   * Pick one random word from selected categories in current locale.
   * Excludes already-used words in this session.
   */
  pick(categoryIds: string[], locale: string, usedWords: string[]): string {
    const pool = this.buildPool(categoryIds, locale)
    const available = pool.filter(w => !usedWords.includes(w))

    if (available.length === 0) {
      // Reset if all words exhausted
      return pool[Math.floor(Math.random() * pool.length)]
    }

    return available[Math.floor(Math.random() * available.length)]
  },

  /**
   * Build the full word pool for given categories + locale.
   * Falls back to 'en' if locale-specific list doesn't exist.
   */
  buildPool(categoryIds: string[], locale: string): string[] {
    const pool: string[] = []
    categoryIds.forEach(catId => {
      try {
        // Dynamic require — all bundles are pre-packaged
        const data = require(`../data/words/${locale}/${catId}.json`)
        pool.push(...data.words)
      } catch {
        try {
          const fallback = require(`../data/words/en/${catId}.json`)
          pool.push(...fallback.words)
        } catch {
          // Category not found — skip silently
        }
      }
    })
    return pool
  },
}
```

---

### 2.4 `playerManager.ts`

```typescript
// src/logic/playerManager.ts

import { shuffle } from '../utils/shuffle'

// Auto-assign colors to players (cycling through palette)
const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#82E0AA', '#F0B27A',
  '#AED6F1', '#A9DFBF', '#F9E79F', '#D7BDE2',
]

export const playerManager = {

  createPlayer(name: string, existingCount: number): Player {
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      color: PLAYER_COLORS[existingCount % PLAYER_COLORS.length],
    }
  },

  validate(players: Player[]): { valid: boolean; error?: string } {
    if (players.length < 3) return { valid: false, error: 'Need at least 3 players' }
    if (players.length > 15) return { valid: false, error: 'Maximum 15 players' }
    const names = players.map(p => p.name.toLowerCase())
    if (new Set(names).size !== names.length) {
      return { valid: false, error: 'Duplicate player names' }
    }
    return { valid: true }
  },

  shuffleOrder(playerIds: string[]): string[] {
    return shuffle([...playerIds])
  },

  getInitials(name: string): string {
    return name.trim().slice(0, 2).toUpperCase()
  },
}
```

---

### 2.5 `shuffle.ts`

```typescript
// src/utils/shuffle.ts
// Fisher-Yates shuffle — cryptographically fair

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

---

## 3. PER-GAME LOGIC MODULES

Each game mode has its own logic file in `src/logic/games/`. Each exports a `GameLogic` interface:

```typescript
interface GameLogic {
  init(config: GameConfig): GameState
  getNextPrompt(state: GameState): Prompt
  processAction(state: GameState, action: GameAction): GameState
  isRoundComplete(state: GameState): boolean
  getResult(state: GameState): RoundResult
}
```

### `truthOrDare.ts`
```typescript
// State: current player index, used prompt IDs, intensity level
// getNextPrompt: picks random unused prompt from pool matching intensity
// processAction: 'answer' | 'dare_complete' | 'skip' (costs a skip token)
// isRoundComplete: when all players have gone, or host ends manually
```

### `neverHaveIEver.ts`
```typescript
// State: player finger counts (all start at 5), used prompt IDs
// getNextPrompt: picks random prompt
// processAction: 'finger_down' (per affected player), 'all_good'
// isRoundComplete: when any player hits 0 fingers
```

### `mostLikelyTo.ts`
```typescript
// State: current prompt, votes (playerId → targetId), reveal state
// getNextPrompt: random from pool
// processAction: 'cast_vote' (simultaneous — stored then revealed at once)
// isRoundComplete: after votes revealed, on host advance
```

### `hotTakes.ts`
```typescript
// State: current statement, agree/disagree votes, reveal state
// getNextPrompt: random statement
// processAction: 'agree' | 'disagree' per player
// isRoundComplete: after discussion phase ends (host advances)
```

### `wouldYouRather.ts`
```typescript
// State: current A/B prompt, votes per option, reveal state
// getNextPrompt: random A/B scenario
// processAction: 'choose_a' | 'choose_b' per player
// isRoundComplete: after reveal + discussion
```

### `twoTruthsOneLie.ts`
```typescript
// State: current teller index, submitted statements, votes
// processAction: 'submit_statements' (3 strings), 'cast_vote' (which is the lie)
// isRoundComplete: when all players have been the teller
```

### `headsUp.ts`
```typescript
// State: current word, timer, score per player, used words
// getNextPrompt: word from selected category
// processAction: 'correct' | 'skip' | 'timer_end'
// Timer runs in store layer (setInterval), logic only tracks score
```

### `wordChain.ts`
```typescript
// State: last word, current player index, eliminated players, timer
// processAction: 'submit_word' (validated: starts with last letter of prev word)
// validate: word starts correctly, not already used this game, non-empty
// isRoundComplete: only one player remains
```

### `triviaBet.ts`
```typescript
// State: current question, bets per player, token counts, reveal state
// getNextPrompt: question + multiple choice options + correct answer
// processAction: 'place_bet' (amount), 'choose_answer' (option index)
// resolveRound: check correct answer, distribute/collect tokens
```

### `charades.ts`
```typescript
// State: current word, timer, team scores, current actor
// Identical structure to headsUp but team-based
// processAction: 'correct_guess' | 'skip' | 'timer_end'
```

### `paranoia.ts`
```typescript
// State: current question, selected target (whispered), reveal state, token costs
// getNextPrompt: question referencing a player ("Who would...")
// processAction: 'whisper_answer' (target ID), 'reveal' (costs token), 'pass'
```

---

## 4. TYPE DEFINITIONS

```typescript
// src/types/index.ts

export type GameMode =
  | 'imposter' | 'truth-dare' | 'never-have-i-ever'
  | 'most-likely-to' | 'hot-takes' | 'would-you-rather'
  | 'two-truths' | 'heads-up' | 'word-chain'
  | 'trivia-bet' | 'charades' | 'paranoia'

export interface Player {
  id: string
  name: string
  color: string
}

export interface GameConfig {
  mode: GameMode
  players: Player[]
  categories: string[]       // category IDs
  impostersCount: 1 | 2
  timerSeconds: 0 | 10 | 15 | 30
  locale: string
}

export interface GameState {
  mode: GameMode
  players: Player[]
  secretWord: string
  imposterIds: string[]
  revealOrder: string[]        // player IDs in reveal sequence
  currentRevealIndex: number
  revealedPlayerIds: string[]
  playerCluesGiven: string[]
  votes: Record<string, string>
  roundPhase: 'idle' | 'setup' | 'reveal' | 'play' | 'vote' | 'result'
  roundNumber: number
  timerSeconds: number
  impostersCount: 1 | 2
  selectedCategories: string[]
  locale: string
  imposterGuessedCorrectly: boolean | null
  usedWords?: string[]
  startedAt: number
}

export interface RevealContent {
  isImposter: boolean
  word: string | null
}

export interface VoteResult {
  outcome: 'crew_wins' | 'imposter_wins' | 'tie'
  eliminatedId: string | null
  impostersCaught: boolean
  tally: Record<string, number>
}

export interface Prompt {
  id: string
  text: string
  category?: string
  intensity?: 'mild' | 'medium' | 'spicy'
  minAge?: number
}

export interface RoundResult {
  winner: 'crew' | 'imposter' | 'tie' | null
  summary: string   // localization key
  highlights: string[]
}
```

---

## 5. STORE → LOGIC INTEGRATION PATTERN

```typescript
// Example: gameStore.ts action using logic layer
// Store handles state; logic handles computation

import { gameEngine } from '../logic/gameEngine'
import { imposterLogic } from '../logic/games/imposter'

// In Zustand store:
initGame: (config: GameConfig) => {
  try {
    const initialState = gameEngine.initGame(config)
    set({ ...initialState, roundPhase: 'reveal' })
  } catch (e) {
    set({ error: (e as Error).message })
  }
},

castVote: (voterId: string, targetId: string) => {
  set(state => ({
    votes: { ...state.votes, [voterId]: targetId }
  }))
},

resolveVotes: () => {
  const state = get()
  const result = imposterLogic.resolveVotes(state.votes, state.players, state.imposterIds)
  set({ voteResult: result, roundPhase: 'result' })
  return result
},
```

---

## 6. TESTING STRATEGY

Each logic module must have a corresponding `__tests__` file.

```typescript
// src/logic/__tests__/imposterLogic.test.ts

describe('imposterLogic', () => {
  test('assigns correct number of imposters', () => {
    const players = createMockPlayers(6)
    const ids = imposterLogic.assignImposters(players, 2)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2) // no duplicates
  })

  test('falls back to 1 imposter when < 5 players', () => {
    const players = createMockPlayers(4)
    const ids = imposterLogic.assignImposters(players, 2)
    expect(ids).toHaveLength(1)
  })

  test('vote resolution — crew wins correctly', () => {
    const players = createMockPlayers(4)
    const imposterIds = [players[0].id]
    const votes = {
      [players[1].id]: players[0].id,
      [players[2].id]: players[0].id,
      [players[3].id]: players[0].id,
    }
    const result = imposterLogic.resolveVotes(votes, players, imposterIds)
    expect(result.outcome).toBe('crew_wins')
    expect(result.impostersCaught).toBe(true)
  })

  test('tie returns tie outcome', () => {
    const players = createMockPlayers(4)
    const votes = {
      [players[0].id]: players[1].id,
      [players[1].id]: players[0].id,
      [players[2].id]: players[1].id,
      [players[3].id]: players[0].id,
    }
    const result = imposterLogic.resolveVotes(votes, players, [players[0].id])
    expect(result.outcome).toBe('tie')
  })
})
```
