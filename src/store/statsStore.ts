import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeAsyncStorage } from '@/utils/storage'
import type {
  PlayerLifetimeStats,
  UnlockedAchievement,
  AchievementId,
  RecordRoundParams,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface StatsState {
  /**
   * Map of normalized player name → lifetime stats.
   * Normalized = name.trim().toLowerCase()
   * This means "Alice" and "alice" share the same entry across sessions.
   */
  playerStats: Record<string, PlayerLifetimeStats>
  unlockedAchievements: UnlockedAchievement[]

  // Hydration flag — false until persist rehydrates from AsyncStorage
  _hasHydrated: boolean
}

interface StatsActions {
  /**
   * Record a completed round's results for all players.
   * For non-imposter modes: only gamesPlayed is incremented.
   * For imposter mode: full stat tracking (wins, caught, etc.)
   */
  recordRoundResult: (params: RecordRoundParams) => void

  /**
   * Unlock an achievement if not already owned.
   * Returns true if newly unlocked, false if already owned.
   * Use the return value to decide whether to show a toast notification.
   */
  unlockAchievement: (id: AchievementId) => boolean

  setHasHydrated: () => void
}

export type StatsStore = StatsState & StatsActions

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_PLAYER_STATS: PlayerLifetimeStats = {
  gamesPlayed: 0,
  wins: 0,
  timesImposter: 0,
  timesCaught: 0,
  timesVotedCorrectly: 0,
  imposterWins: 0,
}

const DEFAULTS: StatsState = {
  playerStats: {},
  unlockedAchievements: [],
  _hasHydrated: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE — persisted to AsyncStorage via Zustand persist middleware
// ─────────────────────────────────────────────────────────────────────────────

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      recordRoundResult: (params) =>
        set((s) => {
          const {
            mode,
            playerNames,
            imposterNames,
            outcome,
            caughtNames,
            correctGuess,
            votedForImposterNames,
            playerAvatars,
          } = params

          const normalize = (name: string) => name.trim().toLowerCase()
          const imposterSet = new Set(imposterNames.map(normalize))
          const caughtSet = new Set(caughtNames.map(normalize))
          const correctVoterSet = new Set(votedForImposterNames.map(normalize))

          const next = { ...s.playerStats }

          for (const name of playerNames) {
            const key = normalize(name)
            const existing: PlayerLifetimeStats = next[key] ?? { ...EMPTY_PLAYER_STATS }
            const isImposter = imposterSet.has(key)
            const wasCaught = caughtSet.has(key)
            const votedCorrectly = correctVoterSet.has(key)
            const avatar = playerAvatars?.[name]

            const updated: PlayerLifetimeStats = {
              ...existing,
              gamesPlayed: existing.gamesPlayed + 1,
              // Always refresh avatar so latest selection is shown in stats
              ...(avatar?.emoji !== undefined && { emoji: avatar.emoji }),
              ...(avatar?.color !== undefined && { color: avatar.color }),
            }

            if (mode === 'imposter') {
              if (isImposter) {
                updated.timesImposter = existing.timesImposter + 1
                if (wasCaught) {
                  updated.timesCaught = existing.timesCaught + 1
                }
                if (outcome === 'imposter_wins') {
                  updated.imposterWins = existing.imposterWins + 1
                  updated.wins = existing.wins + 1
                } else if (wasCaught && correctGuess) {
                  // Caught but guessed the word: counts as a partial win
                  updated.wins = existing.wins + 1
                }
              } else {
                // Crew member
                if (outcome === 'crew_wins') {
                  updated.wins = existing.wins + 1
                }
                if (votedCorrectly) {
                  updated.timesVotedCorrectly = existing.timesVotedCorrectly + 1
                }
              }
            }

            next[key] = updated
          }

          return { playerStats: next }
        }),

      unlockAchievement: (id) => {
        const state = get()
        const alreadyOwned = state.unlockedAchievements.some((a) => a.id === id)
        if (alreadyOwned) return false

        set((s) => ({
          unlockedAchievements: [
            ...s.unlockedAchievements,
            { id, unlockedAt: Date.now() },
          ],
        }))
        return true
      },

      setHasHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: '@whosimposter_stats',
      storage: createJSONStorage(() => safeAsyncStorage),
      // Don't persist the hydration flag itself
      partialize: (s) => {
        const { _hasHydrated, ...rest } = s
        return rest
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
      },
    },
  ),
)
