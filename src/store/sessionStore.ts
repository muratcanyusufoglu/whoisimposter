import { create } from 'zustand'
import type { SessionScores, StreakState } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SessionState {
  /** Cumulative session points per playerId */
  scores: SessionScores
  /** Current win-streak info */
  streak: StreakState
  /** How many rounds have been recorded in this session */
  roundsRecorded: number
}

interface SessionActions {
  /**
   * Merge a round's point deltas into the cumulative scores.
   * pointsMap: Record<playerId, delta> — computed by scoring.ts
   */
  addRoundPoints: (pointsMap: Record<string, number>) => void

  /**
   * Update the streak after a round resolves.
   * Only call when outcome is 'crew_wins' or 'imposter_wins' — NOT on tie.
   */
  recordStreakOutcome: (winner: 'crew' | 'imposter') => void

  /**
   * Full reset — call alongside gameStore.resetGame() when starting a new game.
   * Do NOT call on nextRound() — the session persists across rounds by design.
   */
  resetSession: () => void
}

export type SessionStore = SessionState & SessionActions

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_STATE: SessionState = {
  scores: {},
  streak: { currentHolder: null, count: 0 },
  roundsRecorded: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE — intentionally NOT persisted (in-memory, session-scoped)
// ─────────────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionStore>()((set) => ({
  ...INITIAL_STATE,

  addRoundPoints: (pointsMap) =>
    set((s) => {
      const next = { ...s.scores }
      for (const [playerId, delta] of Object.entries(pointsMap)) {
        next[playerId] = (next[playerId] ?? 0) + delta
      }
      return { scores: next, roundsRecorded: s.roundsRecorded + 1 }
    }),

  recordStreakOutcome: (winner) =>
    set((s) => {
      if (s.streak.currentHolder === winner) {
        // Extend existing streak
        return { streak: { currentHolder: winner, count: s.streak.count + 1 } }
      }
      // New streak starts at 1 for this side
      return { streak: { currentHolder: winner, count: 1 } }
    }),

  resetSession: () => set(INITIAL_STATE),
}))
