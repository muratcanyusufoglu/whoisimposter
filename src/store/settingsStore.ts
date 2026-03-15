import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeAsyncStorage } from '@/utils/storage'
import { ThemeId, RatingState, GameModeId, GamePreset } from '@/types'
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
  lastPlayerEmojis: Record<string, string>  // name → emoji, persisted so avatars survive re-opens

  // Feature: Favorite Modes
  favoriteModeIds: GameModeId[]

  // Feature: Saved Presets
  gamePresets: GamePreset[]

  // Feature: Custom Accent Theme
  customAccentColor: string
  customThemeBase: Exclude<ThemeId, 'custom'>

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
  saveLastSetup: (playerNames: string[], categories: string[], playerEmojis?: Record<string, string>) => void
  /** Immediately persist a single player's emoji (called on avatar select, before game start) */
  setPlayerEmoji: (playerName: string, emoji: string | undefined) => void
  setHasHydrated: () => void

  // Feature: Favorite Modes
  toggleFavoriteMode: (modeId: GameModeId) => void

  // Feature: Saved Presets
  savePreset: (preset: Omit<GamePreset, 'id' | 'createdAt'>) => void
  deletePreset: (presetId: string) => void

  // Feature: Custom Accent Theme
  setCustomAccentColor: (color: string) => void
  setCustomThemeBase: (base: Exclude<ThemeId, 'custom'>) => void
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
  lastPlayerEmojis: {},
  favoriteModeIds: [],
  gamePresets: [],
  customAccentColor: '#6C63FF',
  customThemeBase: 'dark',
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

      saveLastSetup: (playerNames, categories, playerEmojis = {}) =>
        set({ lastPlayerNames: playerNames, lastCategories: categories, lastPlayerEmojis: playerEmojis }),

      setPlayerEmoji: (playerName, emoji) =>
        set((s) => {
          const updated = { ...s.lastPlayerEmojis }
          if (emoji) {
            updated[playerName] = emoji
          } else {
            delete updated[playerName]
          }
          return { lastPlayerEmojis: updated }
        }),

      setHasHydrated: () => set({ _hasHydrated: true }),

      // Feature: Favorite Modes — toggle in array, max 6
      toggleFavoriteMode: (modeId) =>
        set((s) => {
          const ids = s.favoriteModeIds
          if (ids.includes(modeId)) {
            return { favoriteModeIds: ids.filter((id) => id !== modeId) }
          }
          if (ids.length >= 6) return {}
          return { favoriteModeIds: [...ids, modeId] }
        }),

      // Feature: Saved Presets — max 10
      savePreset: (preset) =>
        set((s) => {
          if (s.gamePresets.length >= 10) return {}
          const newPreset: GamePreset = {
            ...preset,
            id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            createdAt: Date.now(),
          }
          return { gamePresets: [newPreset, ...s.gamePresets] }
        }),

      deletePreset: (presetId) =>
        set((s) => ({ gamePresets: s.gamePresets.filter((p) => p.id !== presetId) })),

      // Feature: Custom Accent Theme
      setCustomAccentColor: (customAccentColor) => set({ customAccentColor }),
      setCustomThemeBase: (customThemeBase) => set({ customThemeBase }),
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
