// ─────────────────────────────────────────────────────────────────────────────
// WORD CHAIN — LOGIC
// Players take turns saying a word that starts with the last letter
// of the previous word. Must be a real word (basic validation: non-empty,
// alphabetic, no repeats). Eliminated if they can't respond in time.
// ─────────────────────────────────────────────────────────────────────────────

export interface WordChainState {
  lastWord: string
  lastLetter: string
  usedWords: string[]
  eliminatedPlayerIds: string[]
  currentPlayerIndex: number
}

export interface WordChainValidation {
  valid: boolean
  reason?: 'wrong_letter' | 'already_used' | 'invalid_characters' | 'too_short'
}

export const wordChainLogic = {
  /** Create initial state */
  createInitialState(): WordChainState {
    return {
      lastWord: '',
      lastLetter: '',
      usedWords: [],
      eliminatedPlayerIds: [],
      currentPlayerIndex: 0,
    }
  },

  /**
   * Validate a submitted word against the chain rules.
   */
  validateWord(word: string, state: WordChainState): WordChainValidation {
    const cleaned = word.trim().toLowerCase()

    if (cleaned.length < 2) {
      return { valid: false, reason: 'too_short' }
    }

    // Only letters allowed
    if (!/^[a-z]+$/.test(cleaned)) {
      return { valid: false, reason: 'invalid_characters' }
    }

    // Must start with the last letter of the previous word
    if (state.lastLetter && cleaned[0] !== state.lastLetter) {
      return { valid: false, reason: 'wrong_letter' }
    }

    // Must not have been used already
    if (state.usedWords.includes(cleaned)) {
      return { valid: false, reason: 'already_used' }
    }

    return { valid: true }
  },

  /**
   * Apply a valid word submission to the state, advancing to the next player.
   */
  applyWord(word: string, state: WordChainState, totalActivePlayers: number): WordChainState {
    const cleaned = word.trim().toLowerCase()
    const newLastLetter = cleaned[cleaned.length - 1]

    let nextIndex = (state.currentPlayerIndex + 1) % totalActivePlayers

    return {
      ...state,
      lastWord: cleaned,
      lastLetter: newLastLetter,
      usedWords: [...state.usedWords, cleaned],
      currentPlayerIndex: nextIndex,
    }
  },

  /**
   * Eliminate the current player (timed out or invalid word).
   * Returns updated state with player removed from rotation.
   */
  eliminateCurrentPlayer(
    playerId: string,
    state: WordChainState,
    totalActivePlayers: number,
  ): WordChainState {
    const eliminatedPlayerIds = [...state.eliminatedPlayerIds, playerId]
    const remaining = totalActivePlayers - eliminatedPlayerIds.length
    const nextIndex = remaining > 0 ? state.currentPlayerIndex % remaining : 0

    return {
      ...state,
      eliminatedPlayerIds,
      currentPlayerIndex: nextIndex,
    }
  },

  /**
   * Check if the game is over (only one player remains).
   */
  isGameOver(eliminatedCount: number, totalPlayers: number): boolean {
    return totalPlayers - eliminatedCount <= 1
  },

  /**
   * Get the winner: the last non-eliminated player.
   */
  getWinner(
    playerIds: string[],
    eliminatedPlayerIds: string[],
  ): string | null {
    const remaining = playerIds.filter((id) => !eliminatedPlayerIds.includes(id))
    return remaining[0] ?? null
  },

  /** Default timer per player turn */
  defaultTimerSeconds: 15,
}
