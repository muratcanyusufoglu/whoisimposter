import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeAsyncStorage } from '@/utils/storage'
import { ThemeId, RatingState, GameModeId, GamePreset } from '@/types'
import { changeLanguage, SUPPORTED_LOCALES } from '@/i18n'
import * as Localization from 'expo-localization'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Detect device language on first launch; falls back to 'en'. */
function getDeviceLanguage(): string {
  try {
    const locale = Localization.getLocales()[0]
    const code = locale?.languageTag?.startsWith('zh-Hant') ? 'zh-Hant' : locale?.languageCode ?? 'en'
    return SUPPORTED_LOCALES.includes(code as (typeof SUPPORTED_LOCALES)[number]) ? code : 'en'
  } catch {
    return 'en'
  }
}

/** Returns today's date as 'YYYY-MM-DD' in the device's LOCAL timezone. */
function localDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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

  // Daily free-user game limit (resets each calendar day)
  dailyGamesCount: number   // how many games started today
  dailyGamesDate: string    // 'YYYY-MM-DD' — resets count when date changes

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

  // Feature: Custom Words
  customWords: string[]

  // Feature: Notifications
  notificationsEnabled: boolean
  discountNotificationId: string | null  // null = not yet scheduled

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
  /** Call when a game is about to start. Resets count automatically on a new calendar day. */
  incrementDailyGames: () => void
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

  // Feature: Custom Words
  setCustomWords: (words: string[]) => void

  // Feature: Notifications
  setNotificationsEnabled: (enabled: boolean) => void
  setDiscountNotificationId: (id: string | null) => void
}

export type SettingsStore = SettingsState & SettingsActions

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS: SettingsState = {
  theme: 'dark',
  language: getDeviceLanguage(),
  soundEnabled: true,
  hapticsEnabled: true,
  onboardingCompleted: false,
  ratingState: 'unseen',
  ratingLastPromptAt: null,
  paywallSeenCount: 0,
  gamesCompleted: 0,
  dailyGamesCount: 0,
  dailyGamesDate: '',
  lastPlayerNames: [],
  lastCategories: [],
  lastPlayerEmojis: {},
  favoriteModeIds: [],
  gamePresets: [],
  customAccentColor: '#6C63FF',
  customThemeBase: 'dark',
  customWords: [],
  notificationsEnabled: false,
  discountNotificationId: null,
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

      incrementDailyGames: () =>
        set((s) => {
          const today = localDateString()
          if (s.dailyGamesDate !== today) {
            // New calendar day — reset counter and mark today
            return { dailyGamesDate: today, dailyGamesCount: 1 }
          }
          return { dailyGamesCount: s.dailyGamesCount + 1 }
        }),

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

      // Feature: Notifications
      setCustomWords: (customWords) => set({ customWords }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setDiscountNotificationId: (discountNotificationId) => set({ discountNotificationId }),
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
        // Sync i18next with the persisted language (or device-detected default)
        if (state?.language) {
          changeLanguage(state.language as Parameters<typeof changeLanguage>[0]).catch(() => {})
        }
      },
    },
  ),
)
