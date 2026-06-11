import { Player, RevealContent, VoteResult } from '@/types'
import { shuffle } from '@/utils/shuffle'

// ─────────────────────────────────────────────────────────────────────────────
// IMPOSTER LOGIC
// Pure functions — no React, no stores, fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

export const imposterLogic = {

  /**
   * Randomly assign N players as imposters.
   * If 2 imposters are requested but fewer than 5 players are present,
   * falls back to 1 imposter to keep the game balanced.
   *
   * @param excludeIds Players from the previous round's imposters. They are
   *   removed from the candidate pool so the same person isn't picked two
   *   rounds in a row — unless excluding them would leave too few candidates,
   *   in which case the full roster is used.
   */
  assignImposters(
    players: Player[],
    count: 1 | 2,
    excludeIds: string[] = [],
  ): string[] {
    if (players.length < 3) {
      throw new Error('Need at least 3 players')
    }

    // Fallback: 2 imposters only makes sense with ≥5 players
    const actualCount = count === 2 && players.length < 5 ? 1 : count

    // Anti-repeat: drop last round's imposters from the pool when possible.
    const exclude = new Set(excludeIds)
    const eligible = players.filter((p) => !exclude.has(p.id))
    const pool = eligible.length >= actualCount ? eligible : players

    const shuffled = shuffle([...pool])
    return shuffled.slice(0, actualCount).map((p) => p.id)
  },

  /**
   * Determine what a specific player sees on their reveal screen.
   * Imposters see no word; crew members see the secret word.
   */
  getRevealContent(
    playerId: string,
    secretWord: string,
    imposterIds: string[],
  ): RevealContent {
    const isImposter = imposterIds.includes(playerId)
    return {
      isImposter,
      word: isImposter ? null : secretWord,
    }
  },

  /**
   * Tally all votes and determine the round outcome.
   *
   * - Tie (multiple players share the top vote count): no elimination.
   * - Single top-voted player is an imposter → crew_wins.
   * - Single top-voted player is NOT an imposter → imposter_wins.
   *
   * @param votes       Map of voterId → targetId.
   * @param players     Full player list (used for validation).
   * @param imposterIds IDs of the imposter player(s).
   */
  resolveVotes(
    votes: Record<string, string>,
    players: Player[],
    imposterIds: string[],
  ): VoteResult {
    // Build tally
    const tally: Record<string, number> = {}
    for (const targetId of Object.values(votes)) {
      tally[targetId] = (tally[targetId] ?? 0) + 1
    }

    if (Object.keys(tally).length === 0) {
      // No votes cast — treat as tie
      return { outcome: 'tie', eliminatedId: null, impostersCaught: false, tally }
    }

    const maxVotes = Math.max(...Object.values(tally))
    const topVoted = Object.entries(tally)
      .filter(([, count]) => count === maxVotes)
      .map(([id]) => id)

    // Tie — no elimination this round
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
   * Check whether the imposter's guess matches the secret word.
   * Case-insensitive, trims surrounding whitespace.
   */
  checkImposterGuess(guess: string, secretWord: string): boolean {
    return guess.trim().toLowerCase() === secretWord.trim().toLowerCase()
  },
}
