import { AppTheme } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// SUNSET THEME — Full palette from the app icon, #FDAB4E as the star.
//
// Color roles:
//  #FDAB4E  accent.primary      — golden amber CTA (main)
//  #2B1217  bg.primary          — very dark wine-black (amber glows pop here)
//  #F5B586  text.primary        — warm peach white
//  #D0794C  text.secondary      — terracotta muted text
//  #6E454A  text.muted          — dark mauve disabled/placeholder
//  #DD563D  accent.secondary    — coral-red danger / imposter
//  #E6866D  accent.warm         — warm coral timer / categories
//  #83A7A0  accent.tertiary     — muted teal-grey crew / info
//  #BF94A8  status.info         — dusty rose
//  #AB3C1F  glow.danger source  — deep rust
//  #0D474A  game.crewBg         — crew card reveal teal
// ─────────────────────────────────────────────────────────────────────────────

export const sunsetTheme: AppTheme = {
  id: 'sunset',

  bg: {
    primary:  '#2B1217',  // Dark wine-black — the deepest layer
    surface:  '#3C1C22',  // Slightly lifted warm dark
    elevated: '#4E252C',  // Modal / sheet — warm burgundy
    overlay:  'rgba(0,0,0,0.82)',
    glass:    'rgba(253,171,78,0.08)',  // Amber glass tint
  },

  accent: {
    primary:   '#FDAB4E',  // Golden amber — THE main color
    secondary: '#DD563D',  // Coral-red — danger / imposter
    tertiary:  '#83A7A0',  // Muted teal-grey — crew / info
    warm:      '#E6866D',  // Warm coral — timer / categories
    premium:   '#FFD700',  // Gold badge
  },

  text: {
    primary:   '#F5B586',  // Warm light peach — main readable text
    secondary: '#D0794C',  // Terracotta — supporting text
    muted:     '#6E454A',  // Dark mauve — disabled / placeholder
    inverse:   '#2B1217',  // Text on amber button
    onPrimary: '#2B1217',
  },

  border: {
    subtle:  'rgba(253,171,78,0.10)',
    default: 'rgba(253,171,78,0.22)',
    strong:  'rgba(253,171,78,0.40)',
    focus:   '#FDAB4E',
  },

  glow: {
    primary: 'rgba(253,171,78,0.28)',   // Amber glow
    danger:  'rgba(171,60,31,0.34)',    // AB3C1F rust glow
    success: 'rgba(131,167,160,0.25)',  // 83A7A0 teal glow
  },

  game: {
    imposterBg:    '#2B1217',  // Exact dark wine — imposter reveal
    crewBg:        '#0D474A',  // Exact dark teal — crew reveal
    voteBg:        '#2B1217',
    cardText:      '#FFFFFF',
    cardTextMuted: 'rgba(255,255,255,0.55)',
  },

  status: {
    success: '#83A7A0',  // Muted teal-grey — calm / good
    warning: '#E6866D',  // Warm coral
    error:   '#DD563D',  // Coral-red
    info:    '#BF94A8',  // Dusty rose
  },
}
