import { shuffle } from '@/utils/shuffle'

// ─────────────────────────────────────────────────────────────────────────────
// TRIVIA BET — LOGIC
// ─────────────────────────────────────────────────────────────────────────────

export const STARTING_TOKENS = 10
export const MIN_BET = 1

export interface TriviaQuestion {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  question: string
  options: string[]
  correctIndex: number
}

export interface TriviaBetState {
  playerOrder: string[]
  currentPlayerIndex: number
  usedQuestionIds: string[]
  currentQuestion: TriviaQuestion | null
  tokens: Record<string, number>  // player id → current token count
  roundNumber: number
}

export interface TriviaBetRoundResult {
  question: TriviaQuestion
  tokenDeltas: Record<string, number>  // player id → +gain or -loss
}

const QUESTIONS: Record<string, TriviaQuestion[]> = {
  en: require('@/data/prompts/trivia-bet/en.json').questions as TriviaQuestion[],
  tr: require('@/data/prompts/trivia-bet/tr.json').questions as TriviaQuestion[],
  de: require('@/data/prompts/trivia-bet/de.json').questions as TriviaQuestion[],
  fr: require('@/data/prompts/trivia-bet/fr.json').questions as TriviaQuestion[],
  es: require('@/data/prompts/trivia-bet/es.json').questions as TriviaQuestion[],
  pt: require('@/data/prompts/trivia-bet/pt.json').questions as TriviaQuestion[],
  ru: require('@/data/prompts/trivia-bet/ru.json').questions as TriviaQuestion[],
  ar: require('@/data/prompts/trivia-bet/ar.json').questions as TriviaQuestion[],
  it: require('@/data/prompts/trivia-bet/it.json').questions as TriviaQuestion[],
  nl: require('@/data/prompts/trivia-bet/nl.json').questions as TriviaQuestion[],
  ja: require('@/data/prompts/trivia-bet/ja.json').questions as TriviaQuestion[],
  ko: require('@/data/prompts/trivia-bet/ko.json').questions as TriviaQuestion[],
  'zh-Hant': require('@/data/prompts/trivia-bet/zh-Hant.json').questions as TriviaQuestion[],
  sv: require('@/data/prompts/trivia-bet/sv.json').questions as TriviaQuestion[],
  pl: require('@/data/prompts/trivia-bet/pl.json').questions as TriviaQuestion[],
}

function loadQuestions(locale: string): TriviaQuestion[] {
  return QUESTIONS[locale] ?? QUESTIONS.en
}

export const triviaBetLogic = {
  createInitialState(playerIds: string[]): TriviaBetState {
    const tokens: Record<string, number> = {}
    for (const id of playerIds) {
      tokens[id] = STARTING_TOKENS
    }
    return {
      playerOrder: shuffle(playerIds),
      currentPlayerIndex: 0,
      usedQuestionIds: [],
      currentQuestion: null,
      tokens,
      roundNumber: 0,
    }
  },

  /** Returns player IDs who still have tokens > 0 */
  getActivePlayers(tokens: Record<string, number>): string[] {
    return Object.entries(tokens)
      .filter(([, count]) => count > 0)
      .map(([id]) => id)
  },

  /** Returns player IDs tied for the most tokens */
  getLeaders(tokens: Record<string, number>): string[] {
    const max = Math.max(...Object.values(tokens))
    return Object.entries(tokens)
      .filter(([, count]) => count === max)
      .map(([id]) => id)
  },

  getNextQuestion(locale: string, usedIds: string[]): TriviaQuestion {
    const all = loadQuestions(locale)
    const unused = all.filter((q) => !usedIds.includes(q.id))
    const pool = unused.length > 0 ? unused : all

    const fallback: TriviaQuestion = {
      id: 'fallback_trivia',
      difficulty: 'easy',
      category: 'General',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctIndex: 1,
    }

    return shuffle(pool)[0] ?? fallback
  },

  /**
   * Resolves a round:
   * - Correct answer → player gains their bet amount
   * - Wrong answer   → player loses their bet amount (clamped to 0)
   */
  resolveRound(
    question: TriviaQuestion,
    bets: Record<string, number>,
    answers: Record<string, number>,
    tokens: Record<string, number>,
  ): TriviaBetRoundResult {
    const tokenDeltas: Record<string, number> = {}

    for (const playerId of Object.keys(tokens)) {
      const bet = bets[playerId] ?? MIN_BET
      const answer = answers[playerId]
      const isCorrect = answer === question.correctIndex
      // Clamp loss so tokens don't go below 0
      const currentTokens = tokens[playerId] ?? 0
      tokenDeltas[playerId] = isCorrect ? bet : -Math.min(bet, currentTokens)
    }

    return { question, tokenDeltas }
  },

  /** Applies token deltas and clamps each value to a minimum of 0 */
  applyTokenDeltas(
    tokens: Record<string, number>,
    deltas: Record<string, number>,
  ): Record<string, number> {
    const next: Record<string, number> = { ...tokens }
    for (const [id, delta] of Object.entries(deltas)) {
      next[id] = Math.max(0, (next[id] ?? 0) + delta)
    }
    return next
  },
}
