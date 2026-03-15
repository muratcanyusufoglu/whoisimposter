import { AppTheme } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// AURORA THEME — Inspired by the cosmic depth in the game artwork:
// deep arctic-black backgrounds, bioluminescent teal accents, aurora violet.
// Evokes northern lights over a frozen ocean — serene, mysterious, alive.
// Drawn from the icy blues and electric purples woven through the game art.
// ─────────────────────────────────────────────────────────────────────────────

export const auroraTheme: AppTheme = {
  id: 'aurora',

  bg: {
    primary:  '#030D14', // Arctic void — deep polar dark
    surface:  '#071A28', // Dark polar ocean — surface cards
    elevated: '#0B2638', // Deep teal elevation — modals
    overlay:  'rgba(0,0,0,0.84)',
    glass:    'rgba(0,212,170,0.05)',
  },

  accent: {
    primary:   '#00D4AA', // Aurora teal-green — main CTA, selections
    secondary: '#BF5AF2', // Aurora violet — danger, imposter
    tertiary:  '#00BCD4', // Glacial blue — crew reveal, info
    warm:      '#FF9F43', // Arctic amber — timer, warmth
    premium:   '#E8D5A3', // Polar gold — PRO badge
  },

  text: {
    primary:   '#E8F8FF', // Ice white — crisp and readable
    secondary: '#4D8FA0', // Arctic blue-gray — supporting text
    muted:     '#1E4858', // Deep teal muted — placeholder, disabled
    inverse:   '#030D14', // Bg color — text on accent surfaces
    onPrimary: '#030D14', // Bg color — text on accent.primary buttons
  },

  border: {
    subtle:  'rgba(0,212,170,0.08)',
    default: 'rgba(0,212,170,0.16)',
    strong:  'rgba(0,212,170,0.32)',
    focus:   '#00D4AA',
  },

  glow: {
    primary: 'rgba(0,212,170,0.28)',
    danger:  'rgba(191,90,242,0.28)',
    success: 'rgba(0,188,212,0.22)',
  },

  game: {
    imposterBg:    '#140628', // Deep aurora violet — imposter card
    crewBg:        '#031830', // Midnight polar ocean — crew card
    voteBg:        '#040F1A', // Arctic void — vote screen
    cardText:      '#E8F8FF',
    cardTextMuted: 'rgba(232,248,255,0.55)',
  },

  status: {
    success: '#00D4AA', // Aurora teal — positive outcomes
    warning: '#FF9F43', // Amber — caution
    error:   '#BF5AF2', // Aurora violet — errors
    info:    '#00BCD4', // Glacial blue — info
  },
}
