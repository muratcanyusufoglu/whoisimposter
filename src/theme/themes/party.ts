import { AppTheme } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// PARTY THEME — Colors extracted directly from the app icon.
// Teal (#3ECFB8) × Coral (#F07060) × Lavender (#9B82D4) × Peach (#F4916A)
// Dark teal-tinted background so every vivid accent pops.
// ─────────────────────────────────────────────────────────────────────────────

export const partyTheme: AppTheme = {
  id: 'party',

  bg: {
    primary:  '#0E1A18',               // Deep teal-tinted black
    surface:  '#152522',               // Raised surface
    elevated: '#1C3028',               // Modal / sheet layer
    overlay:  'rgba(0,0,0,0.78)',
    glass:    'rgba(62,207,184,0.07)', // Teal glass
  },

  accent: {
    primary:   '#3ECFB8',  // Icon teal  — main CTA
    secondary: '#F07060',  // Icon coral — danger / imposter
    tertiary:  '#9B82D4',  // Icon lavender — crew / info
    warm:      '#F4916A',  // Icon peach  — timer / warm
    premium:   '#FFD700',  // Gold badge
  },

  text: {
    primary:   '#EEF8F6',  // Warm white
    secondary: '#78B8AE',  // Muted teal
    muted:     '#3D6056',  // Disabled / placeholder
    inverse:   '#0E1A18',  // Text on teal button
    onPrimary: '#0E1A18',
  },

  border: {
    subtle:  'rgba(62,207,184,0.08)',
    default: 'rgba(62,207,184,0.15)',
    strong:  'rgba(62,207,184,0.30)',
    focus:   '#3ECFB8',
  },

  glow: {
    primary: 'rgba(62,207,184,0.22)',  // Teal glow
    danger:  'rgba(240,112,96,0.28)',  // Coral glow
    success: 'rgba(62,207,184,0.22)',
  },

  game: {
    imposterBg:    '#2C0E0B',                   // Dark coral tint
    crewBg:        '#091E1B',                   // Dark teal tint
    voteBg:        '#0E1A18',
    cardText:      '#FFFFFF',
    cardTextMuted: 'rgba(255,255,255,0.55)',
  },

  status: {
    success: '#3ECFB8',  // Teal
    warning: '#F4916A',  // Peach
    error:   '#F07060',  // Coral
    info:    '#9B82D4',  // Lavender
  },
}
