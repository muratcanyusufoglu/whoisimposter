// ─────────────────────────────────────────────────────────────────────────────
// buildCustomTheme — Generates a runtime AppTheme by overlaying a custom accent
// color onto one of the three supported base themes (dark / light / candy).
//
// IMPORTANT: Import individual theme files directly here — NOT from
// src/theme/index.tsx — to avoid circular dependency.
// ─────────────────────────────────────────────────────────────────────────────

import { AppTheme, ThemeId } from '../types'
import { darkTheme } from './dark'
import { lightTheme } from './light'
import { candyTheme } from './candy'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a 6-digit hex color + alpha to an rgba() string. */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16)
  const g = parseInt(cleaned.substring(2, 4), 16)
  const b = parseInt(cleaned.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(108,99,255,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Base lookup ───────────────────────────────────────────────────────────────

/** Only dark / light / candy are offered as custom-theme bases in the UX. */
const BASE_THEMES: Partial<Record<Exclude<ThemeId, 'custom'>, AppTheme>> = {
  dark:  darkTheme,
  light: lightTheme,
  candy: candyTheme,
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildCustomTheme(
  baseId: Exclude<ThemeId, 'custom'>,
  accent: string,
): AppTheme {
  const base = BASE_THEMES[baseId] ?? darkTheme
  return {
    ...base,
    id: 'custom',
    accent: {
      ...base.accent,
      primary: accent,
    },
    border: {
      ...base.border,
      focus: accent,
    },
    glow: {
      ...base.glow,
      primary: hexToRgba(accent, 0.30),
    },
  }
}
