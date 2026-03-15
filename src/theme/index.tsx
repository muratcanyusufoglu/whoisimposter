import React, { createContext, useContext, useMemo } from 'react'
import { AppTheme, ThemeId } from './types'
import { darkTheme, lightTheme, neonTheme, candyTheme, partyTheme, sunsetTheme, goldenTheme, emberTheme, auroraTheme } from './themes'
import { buildCustomTheme } from './themes/buildCustomTheme'
import { useSettingsStore } from '@/store/settingsStore'

export type { AppTheme, ThemeId }
export { darkTheme, lightTheme, neonTheme, candyTheme, partyTheme, sunsetTheme, goldenTheme, emberTheme, auroraTheme }
export * from './tokens'

// ─────────────────────────────────────────────────────────────────────────────
// THEME MAP — 'custom' is excluded because it is built dynamically at runtime
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES: Record<Exclude<ThemeId, 'custom'>, AppTheme> = {
  dark:   darkTheme,
  light:  lightTheme,
  neon:   neonTheme,
  candy:  candyTheme,
  party:  partyTheme,
  sunset: sunsetTheme,
  golden: goldenTheme,
  ember:  emberTheme,
  aurora: auroraTheme,
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: AppTheme
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:    darkTheme,
  themeId:  'dark',
  setTheme: () => {},
})

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER — thin bridge from settingsStore (Zustand) → React context.
// All existing useTheme() call-sites work unchanged.
// Persistence is handled entirely by settingsStore's Zustand persist middleware.
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeId = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const customAccentColor = useSettingsStore((s) => s.customAccentColor)
  const customThemeBase = useSettingsStore((s) => s.customThemeBase)

  const theme = useMemo<AppTheme>(() => {
    if (themeId === 'custom') {
      return buildCustomTheme(customThemeBase, customAccentColor)
    }
    return THEMES[themeId] ?? darkTheme
  }, [themeId, customAccentColor, customThemeBase])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
