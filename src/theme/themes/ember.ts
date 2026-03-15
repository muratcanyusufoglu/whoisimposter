import { AppTheme } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// EMBER THEME — Inspired by the warm, dramatic artwork in the game images:
// charred-black backgrounds, molten-orange accents, deep crimson danger tones.
// Evokes a candlelit secret gathering — intimate, suspicious, cinematic.
// Drawn from the amber warmth in Hot Takes, Paranoia and Truth or Dare art.
// ─────────────────────────────────────────────────────────────────────────────

export const emberTheme: AppTheme = {
  id: 'ember',

  bg: {
    primary:  '#0C0804', // Charred black — smoldering coal
    surface:  '#150E08', // Deep ember dark — warm near-black
    elevated: '#1E1508', // Rich cocoa brown — lifted surfaces
    overlay:  'rgba(0,0,0,0.84)',
    glass:    'rgba(255,107,53,0.05)',
  },

  accent: {
    primary:   '#FF6B35', // Molten orange — main CTA, selections
    secondary: '#E8344B', // Deep crimson — danger, imposter
    tertiary:  '#F4C430', // Saffron gold — crew reveal, info
    warm:      '#FF9F43', // Amber — timer, category badges
    premium:   '#FFD700', // Burnished gold — PRO badge
  },

  text: {
    primary:   '#FFF0E0', // Warm candlelight white
    secondary: '#A07855', // Warm sandstone — supporting text
    muted:     '#4A2E18', // Deep warm brown — placeholder, disabled
    inverse:   '#0C0804', // Bg color — text on accent surfaces
    onPrimary: '#0C0804', // Bg color — text on accent.primary buttons
  },

  border: {
    subtle:  'rgba(255,107,53,0.08)',
    default: 'rgba(255,107,53,0.16)',
    strong:  'rgba(255,107,53,0.32)',
    focus:   '#FF6B35',
  },

  glow: {
    primary: 'rgba(255,107,53,0.30)',
    danger:  'rgba(232,52,75,0.28)',
    success: 'rgba(244,196,48,0.22)',
  },

  game: {
    imposterBg:    '#280608', // Deep wine-crimson — imposter card
    crewBg:        '#0C1408', // Dark forest ember — crew card
    voteBg:        '#0E0904', // Near-black warm — vote screen
    cardText:      '#FFF0E0',
    cardTextMuted: 'rgba(255,240,224,0.55)',
  },

  status: {
    success: '#F4C430', // Saffron — positive outcomes
    warning: '#FF9F43', // Amber — caution
    error:   '#E8344B', // Crimson — errors
    info:    '#FF6B35', // Orange — info
  },
}
