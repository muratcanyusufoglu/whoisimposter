import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeAsyncStorage } from '@/utils/storage'
import { ThemeId, RatingState } from '@/types'
import { changeLanguage } from '@/i18n'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsState {
  theme: ThemeId
  language: string
  soundEnabled: boolean
  hapticsEnabled: boolean

  // Lifecycle flags
  onboardingCompleted: boolean
  ratingState: RatingState
  ratingLastPromptAt: number | null
  paywallSeenCount: number
  gamesCompleted: number

  // Last-used setup (F10.6)
  lastPlayerNames: string[]
  lastCategories: string[]

  // Hydration flag — false until persist rehydrates from AsyncStorage
  _hasHydrated: boolean
}

interface SettingsActions {
  setTheme: (theme: ThemeId) => void
  setLanguage: (lang: string) => void
  setSoundEnabled: (enabled: boolean) => void
  setHapticsEnabled: (enabled: boolean) => void
  completeOnboarding: () => void
  updateRatingState: (state: RatingState) => void
  incrementPaywallSeen: () => void
  incrementGamesCompleted: () => void
  saveLastSetup: (playerNames: string[], categories: string[]) => void
  setHasHydrated: () => void
}

export type SettingsStore = SettingsState & SettingsActions

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS: SettingsState = {
  theme: 'dark',
  language: 'en',
  soundEnabled: true,
  hapticsEnabled: true,
  onboardingCompleted: false,
  ratingState: 'unseen',
  ratingLastPromptAt: null,
  paywallSeenCount: 0,
  gamesCompleted: 0,
  lastPlayerNames: [],
  lastCategories: [],
  _hasHydrated: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setTheme: (theme) => set({ theme }),

      setLanguage: (lang) => {
        set({ language: lang })
        // Keep i18next in sync
        changeLanguage(lang as Parameters<typeof changeLanguage>[0]).catch(() => {})
      },

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      updateRatingState: (ratingState) =>
        set({
          ratingState,
          ratingLastPromptAt: ratingState === 'later' ? Date.now() : undefined,
        }),

      incrementPaywallSeen: () =>
        set((s) => ({ paywallSeenCount: s.paywallSeenCount + 1 })),

      incrementGamesCompleted: () =>
        set((s) => ({ gamesCompleted: s.gamesCompleted + 1 })),

      saveLastSetup: (playerNames, categories) =>
        set({ lastPlayerNames: playerNames, lastCategories: categories }),

      setHasHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: '@whosimposter_settings',
      storage: createJSONStorage(() => safeAsyncStorage),
      // Don't persist the hydration flag itself
      partialize: (s) => {
        const { _hasHydrated, ...rest } = s
        return rest
      },
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated once AsyncStorage has been read
        state?.setHasHydrated()
        // Sync i18next with the persisted language
        if (state?.language) {
          changeLanguage(state.language as Parameters<typeof changeLanguage>[0]).catch(() => {})
        }
      },
    },
  ),
)
