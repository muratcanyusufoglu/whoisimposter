import { shuffle } from '@/utils/shuffle'

// ─────────────────────────────────────────────────────────────────────────────
// TRIVIA BET — LOGIC
// Each player is given tokens. For each question, each player:
//   1. Bets 1–all of their tokens
//   2. Chooses an answer (A/B/C/D)
//   3. If correct → wins bet amount. If wrong → loses bet amount.
// Last player with tokens wins.
// ─────────────────────────────────────────────────────────────────────────────

export interface TriviaQuestion {
  id: string
  question: string
  options: [string, string, string, string]  // A, B, C, D
  correctIndex: 0 | 1 | 2 | 3
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface TriviaBetState {
  tokens: Record<string, number>        // playerId → token count
  bets: Record<string, number>          // playerId → current bet
  answers: Record<string, number>       // playerId → chosen option index
  currentQuestion: TriviaQuestion | null
  usedQuestionIds: string[]
  roundNumber: number
}

export interface TriviaBetRoundResult {
  correctIndex: 0 | 1 | 2 | 3
  winners: string[]   // player IDs who answered correctly
  losers: string[]    // player IDs who answered incorrectly
  tokenDeltas: Record<string, number>
}

// Module-level cache
let _enQuestions: TriviaQuestion[] | null = null
let _trQuestions: TriviaQuestion[] | null = null

function loadQuestions(locale: string): TriviaQuestion[] {
  if (locale === 'tr') {
    if (!_trQuestions) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      _trQuestions = require('@/data/prompts/trivia-bet/tr.json').questions as TriviaQuestion[]
    }
    return _trQuestions
  }
  if (!_enQuestions) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _enQuestions = require('@/data/prompts/trivia-bet/en.json').questions as TriviaQuestion[]
  }
  return _enQuestions
}

export const STARTING_TOKENS = 10
export const MIN_BET = 1

export const triviaBetLogic = {
  /** Create initial state for all players */
  createInitialState(playerIds: string[]): TriviaBetState {
    const tokens: Record<string, number> = {}
    playerIds.forEach((id) => (tokens[id] = STARTING_TOKENS))
    return {
      tokens,
      bets: {},
      answers: {},
      currentQuestion: null,
      usedQuestionIds: [],
      roundNumber: 0,
    }
  },

  /**
   * Pick the next question, avoiding repeats.
   * Auto-resets pool when exhausted.
   */
  getNextQuestion(locale: string, usedIds: string[]): TriviaQuestion {
    const all = loadQuestions(locale)
    const unused = all.filter((q) => !usedIds.includes(q.id))
    const pool = unused.length > 0 ? unused : all
    return shuffle(pool)[0]!
  },

  /**
   * Validate bet: must be between MIN_BET and player's current token count.
   */
  validateBet(playerId: string, bet: number, tokens: Record<string, number>): boolean {
    const playerTokens = tokens[playerId] ?? 0
    return bet >= MIN_BET && bet <= playerTokens
  },

  /**
   * Resolve a round after all players have answered.
   * Correct answer → +bet. Wrong → −bet. Zero tokens means eliminated.
   */
  resolveRound(
    question: TriviaQuestion,
    bets: Record<string, number>,
    answers: Record<string, number>,
    currentTokens: Record<string, number>,
  ): TriviaBetRoundResult {
    const { correctIndex } = question
    const winners: string[] = []
    const losers: string[] = []
    const tokenDeltas: Record<string, number> = {}

    Object.keys(bets).forEach((playerId) => {
      const bet = bets[playerId] ?? 0
      const answer = answers[playerId]

      if (answer === correctIndex) {
        winners.push(playerId)
        tokenDeltas[playerId] = +bet
      } else {
        losers.push(playerId)
        tokenDeltas[playerId] = -bet
      }
    })

    return { correctIndex, winners, losers, tokenDeltas }
  },

  /**
   * Apply token deltas to create updated token map.
   * Tokens cannot go below 0.
   */
  applyTokenDeltas(
    current: Record<string, number>,
    deltas: Record<string, number>,
  ): Record<string, number> {
    const updated = { ...current }
    Object.entries(deltas).forEach(([playerId, delta]) => {
      updated[playerId] = Math.max(0, (updated[playerId] ?? 0) + delta)
    })
    return updated
  },

  /**
   * Get players who are still in (tokens > 0).
   */
  getActivePlayers(tokens: Record<string, number>): string[] {
    return Object.entries(tokens)
      .filter(([, t]) => t > 0)
      .map(([id]) => id)
  },

  /**
   * Get the winner (most tokens). In case of tie, all leaders win.
   */
  getLeaders(tokens: Record<string, number>): string[] {
    const max = Math.max(...Object.values(tokens))
    return Object.entries(tokens)
      .filter(([, t]) => t === max)
      .map(([id]) => id)
  },
}
