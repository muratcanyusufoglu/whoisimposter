import { shuffle } from '@/utils/shuffle'
import type { Player } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TWO TRUTHS ONE LIE — LOGIC
// Each player submits 3 statements (2 truths, 1 lie).
// Others vote on which statement is the lie.
// After all votes, reveal the lie index and tally correct votes.
// ─────────────────────────────────────────────────────────────────────────────

export interface TwoTruthsSubmission {
  playerId: string
  statements: [string, string, string]  // [0, 1, 2]
  lieIndex: 0 | 1 | 2                   // which one is the lie (host knows)
}

export interface TwoTruthsVote {
  voterId: string
  guessIndex: 0 | 1 | 2
}

export interface TwoTruthsRoundResult {
  lieIndex: 0 | 1 | 2
  correctVoters: string[]   // player IDs who guessed right
  incorrectVoters: string[] // player IDs who guessed wrong
  scoreDeltas: Record<string, number> // +1 for each correct guess
}

export const twoTruthsOneLieLogic = {
  /**
   * Shuffle the 3 statements so the lie is not always in the same position.
   * Returns a display order (shuffled indices) and the new lie position.
   */
  shuffleStatements(
    statements: [string, string, string],
    lieIndex: 0 | 1 | 2,
  ): { displayed: [string, string, string]; displayedLieIndex: 0 | 1 | 2 } {
    const indexed: Array<{ text: string; originalIdx: number }> = [
      { text: statements[0], originalIdx: 0 },
      { text: statements[1], originalIdx: 1 },
      { text: statements[2], originalIdx: 2 },
    ]
    const shuffled = shuffle(indexed)
    const displayed = shuffled.map((s) => s.text) as [string, string, string]
    const displayedLieIndex = shuffled.findIndex(
      (s) => s.originalIdx === lieIndex,
    ) as 0 | 1 | 2
    return { displayed, displayedLieIndex }
  },

  /**
   * Resolve votes for one round.
   * Returns score deltas: non-teller players who guessed correctly get +1.
   * The teller gets +1 for each wrong guess (they fooled someone).
   */
  resolveRound(
    submission: TwoTruthsSubmission,
    votes: TwoTruthsVote[],
    players: Player[],
  ): TwoTruthsRoundResult {
    const { lieIndex, playerId: tellerId } = submission

    const scoreDeltas: Record<string, number> = {}
    const correctVoters: string[] = []
    const incorrectVoters: string[] = []

    // Initialize all players to 0 delta
    players.forEach((p) => (scoreDeltas[p.id] = 0))

    votes.forEach(({ voterId, guessIndex }) => {
      if (voterId === tellerId) return // teller can't vote for their own round
      if (guessIndex === lieIndex) {
        correctVoters.push(voterId)
        scoreDeltas[voterId] = (scoreDeltas[voterId] ?? 0) + 1
      } else {
        incorrectVoters.push(voterId)
        // Teller gets +1 for fooling this voter
        scoreDeltas[tellerId] = (scoreDeltas[tellerId] ?? 0) + 1
      }
    })

    return { lieIndex, correctVoters, incorrectVoters, scoreDeltas }
  },

  /**
   * Get the next teller index (cycling through all players).
   */
  getNextTellerIndex(currentIndex: number, totalPlayers: number): number {
    return (currentIndex + 1) % totalPlayers
  },

  /**
   * Check if all players have been the teller.
   */
  isGameComplete(tellersTurn: number, totalPlayers: number): boolean {
    return tellersTurn >= totalPlayers
  },
}
