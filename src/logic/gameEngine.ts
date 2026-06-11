import { GameConfig, GameState, VoteResult } from '@/types'
import { imposterLogic } from '@/logic/games/imposter'
import { wordSelector } from '@/logic/wordSelector'
import { playerManager } from '@/logic/playerManager'
import { getGameModeById } from '@/data/games'

// ─────────────────────────────────────────────────────────────────────────────
// GAME ENGINE — Orchestrator
// Coordinates logic modules: wordSelector, playerManager, imposterLogic.
// Returns plain state objects; all state mutations live in gameStore.
// ─────────────────────────────────────────────────────────────────────────────

export const gameEngine = {

  /**
   * Initialize a new game from a setup config.
   * Returns a fully-populated GameState ready for the first reveal.
   * Throws if the player list is invalid.
   */
  initGame(config: GameConfig): GameState {
    const {
      mode,
      players,
      selectedCategories,
      impostersCount,
      timerSeconds,
      roundCount,
      locale,
      soundEnabled,
      hapticsEnabled,
      customWords,
    } = config

    // Validate player list against the chosen mode's own minimum.
    // Some modes (truth-dare, would-you-rather, word-chain) allow 2 players,
    // so we must not assume a hard floor of 3 here.
    const minPlayers = getGameModeById(mode)?.minPlayers ?? 3
    const validation = playerManager.validate(players, minPlayers)
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Invalid player configuration')
    }

    // Pick secret word (imposter mode only)
    const secretWord =
      mode === 'imposter'
        ? wordSelector.pick(selectedCategories, locale, [], customWords)
        : ''

    // Assign imposters (imposter mode only)
    const imposterIds =
      mode === 'imposter'
        ? imposterLogic.assignImposters(players, impostersCount)
        : []

    // Randomise reveal order
    const revealOrder = playerManager.shuffleOrder(players.map((p) => p.id))

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
      roundCount,
      timerSeconds,
      impostersCount,
      selectedCategories,
      customWords: customWords ?? [],
      locale,
      imposterGuessedCorrectly: null,
      usedWords: secretWord ? [secretWord] : [],
      startedAt: Date.now(),
      soundEnabled,
      hapticsEnabled,
    }
  },

  /**
   * Advance to the next player in the reveal sequence.
   * Returns a partial GameState to be merged into the store.
   */
  advanceReveal(state: GameState): Partial<GameState> {
    const next = state.currentRevealIndex + 1
    const allRevealed = next >= state.players.length

    return {
      currentRevealIndex: allRevealed ? state.currentRevealIndex : next,
      revealedPlayerIds: [
        ...state.revealedPlayerIds,
        state.revealOrder[state.currentRevealIndex],
      ],
      roundPhase: allRevealed ? 'play' : 'reveal',
    }
  },

  /**
   * Resolve votes for the current round.
   * Delegates to imposterLogic — pure tally + outcome determination.
   */
  resolveVotes(state: GameState): VoteResult {
    return imposterLogic.resolveVotes(state.votes, state.players, state.imposterIds)
  },

  /**
   * Prepare a new round with the same players and config.
   * Picks a fresh secret word (excluding already-used words),
   * re-assigns imposters, and resets all round-level state.
   */
  nextRound(state: GameState): GameState {
    const usedWords = state.usedWords ?? []
    const secretWord = wordSelector.pick(
      state.selectedCategories,
      state.locale,
      usedWords,
      state.customWords,
    )
    const imposterIds = imposterLogic.assignImposters(
      state.players,
      state.impostersCount,
      state.imposterIds,
    )
    const revealOrder = playerManager.shuffleOrder(state.players.map((p) => p.id))

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
