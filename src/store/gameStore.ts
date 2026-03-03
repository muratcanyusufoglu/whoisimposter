import { create } from 'zustand'
import { GameConfig, GameState, VoteResult } from '@/types'
import { gameEngine } from '@/logic/gameEngine'
import { imposterLogic } from '@/logic/games/imposter'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// GameStoreState extends the canonical GameState (from @/types) with
// store-only fields that don't belong in the serialisable game state.
// ─────────────────────────────────────────────────────────────────────────────

interface GameStoreState extends GameState {
  lastVoteResult: VoteResult | null
}

interface GameActions {
  initGame: (config: GameConfig) => void
  advanceReveal: () => void
  markClueGiven: (playerId: string) => void
  castVote: (voterId: string, targetId: string) => void
  resolveVotes: () => VoteResult
  setImposterGuess: (correct: boolean) => void
  nextRound: () => void
  resetGame: () => void
}

export type GameStore = GameStoreState & GameActions

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_STATE: GameStoreState = {
  mode: 'imposter',
  players: [],
  selectedCategories: [],
  impostersCount: 1,
  timerSeconds: 0,
  soundEnabled: true,
  hapticsEnabled: true,
  locale: 'en',

  secretWord: '',
  imposterIds: [],
  revealOrder: [],
  currentRevealIndex: 0,
  revealedPlayerIds: [],
  playerCluesGiven: [],
  votes: {},
  roundPhase: 'idle',
  roundNumber: 1,
  imposterGuessedCorrectly: null,
  usedWords: [],
  startedAt: 0,

  lastVoteResult: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE — intentionally NOT persisted (game state is session-only)
// ─────────────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()((set, get) => ({
  ...INITIAL_STATE,

  /**
   * Initialize a new game from setup config.
   * Delegates to gameEngine.initGame() for word selection, imposter
   * assignment, and reveal order shuffle.
   */
  initGame: (config: GameConfig) => {
    const initialState = gameEngine.initGame(config)
    set({ ...INITIAL_STATE, ...initialState, lastVoteResult: null })
  },

  /**
   * Advance to the next player in the reveal phase.
   * Delegates to gameEngine.advanceReveal() for phase transition logic.
   */
  advanceReveal: () => {
    const state = get()
    const update = gameEngine.advanceReveal(state)
    set(update)
  },

  /**
   * Mark that a player has given their clue in the play phase.
   */
  markClueGiven: (playerId: string) => {
    set((s) => ({
      playerCluesGiven: s.playerCluesGiven.includes(playerId)
        ? s.playerCluesGiven
        : [...s.playerCluesGiven, playerId],
    }))
  },

  /**
   * Record a vote: voterId → targetId.
   * Players can change their vote before results are revealed.
   */
  castVote: (voterId: string, targetId: string) => {
    set((s) => ({
      votes: { ...s.votes, [voterId]: targetId },
    }))
  },

  /**
   * Tally votes, determine the outcome, and transition to 'result' phase.
   * Delegates to imposterLogic.resolveVotes() for pure vote counting.
   */
  resolveVotes: (): VoteResult => {
    const { votes, players, imposterIds } = get()
    const result = imposterLogic.resolveVotes(votes, players, imposterIds)
    set({ roundPhase: 'result', lastVoteResult: result })
    return result
  },

  /**
   * Record whether the imposter guessed the secret word correctly.
   */
  setImposterGuess: (correct: boolean) => {
    set({ imposterGuessedCorrectly: correct })
  },

  /**
   * Start a new round with the same players and config.
   * Delegates to gameEngine.nextRound() for fresh word + imposter assignment.
   */
  nextRound: () => {
    const state = get()
    const nextState = gameEngine.nextRound(state)
    set({ ...nextState, lastVoteResult: null })
  },

  /**
   * Full reset — returns to idle state, clears everything.
   */
  resetGame: () => {
    set(INITIAL_STATE)
  },
}))
