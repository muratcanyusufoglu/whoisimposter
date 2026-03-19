import { shuffle } from '@/utils/shuffle'

// ─────────────────────────────────────────────────────────────────────────────
// TRIVIA BET — LOGIC
// ─────────────────────────────────────────────────────────────────────────────

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
}

export interface TriviaBetRoundResult {
  winnerId: string
  loserId: string
  question: TriviaQuestion
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
}

function loadQuestions(locale: string): TriviaQuestion[] {
  return QUESTIONS[locale] ?? QUESTIONS.en
}

export const triviaBetLogic = {
  createInitialState(playerIds: string[]): TriviaBetState {
    return {
      playerOrder: shuffle(playerIds),
      currentPlayerIndex: 0,
      usedQuestionIds: [],
      currentQuestion: null,
    }
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

  resolveRound(
    question: TriviaQuestion,
    winnerId: string,
    loserId: string,
  ): TriviaBetRoundResult {
    return { winnerId, loserId, question }
  },
}
