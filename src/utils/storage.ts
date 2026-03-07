import AsyncStorage from '@react-native-async-storage/async-storage'

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS REGISTRY
// Central place for all AsyncStorage keys. Prevents typos and key collisions.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  // Onboarding
  ONBOARDING_COMPLETED: '@onboarding_completed',

  // Settings / Theme
  SELECTED_THEME: '@selected_theme',
  SELECTED_LANGUAGE: '@selected_language',
  SOUND_ENABLED: '@sound_enabled',
  HAPTICS_ENABLED: '@haptics_enabled',

  // Lifecycle
  RATING_STATE: '@rating_state',
  RATING_LAST_PROMPT_AT: '@rating_last_prompt_at',
  PAYWALL_SEEN_COUNT: '@paywall_seen_count',
  GAMES_COMPLETED: '@games_completed',

  // Last game config (for quick resume)
  LAST_GAME_CONFIG: '@last_game_config',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

// ─────────────────────────────────────────────────────────────────────────────
// TYPED WRAPPERS
// Wrapped in try/catch so Expo Go / CI environments without the native module
// degrade gracefully instead of crashing the app.
// ─────────────────────────────────────────────────────────────────────────────

export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  } catch {
    return null
  }
}

export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    const raw = typeof value === 'string' ? value : JSON.stringify(value)
    await AsyncStorage.setItem(key, raw)
  } catch {
    // Storage unavailable (Expo Go without native module) — no-op
  }
}

export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch {
    // no-op
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS)
    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)))
  } catch {
    // no-op
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE ASYNC STORAGE
// A drop-in AsyncStorage replacement for Zustand persist that never throws.
// Falls back to a no-op in-memory stub when the native module is unavailable
// (e.g. Expo Go with an incompatible AsyncStorage version).
// ─────────────────────────────────────────────────────────────────────────────

export const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch {
      // no-op
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key)
    } catch {
      // no-op
    }
  },
}
