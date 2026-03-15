import { AppTheme } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// GOLDEN THEME — #FDAB4E as the ambient background, warm cream surfaces.
//
// Concept: golden-hour sunlight fills the room; cards are warm parchment
// floating in that light. Every element stays in the warm analog family
// (amber → rust → coral) — no jarring temperature jumps.
//
//  #FDAB4E  bg.primary          — golden amber ambient screen
//  #FEE4BA  bg.surface          — warm cream/parchment card
//  #FFF6E8  bg.elevated         — near-white warm modal
//  #AB3C1F  accent.primary      — deep rust CTA  (analog to amber ✓)
//  #DD563D  accent.secondary    — coral-red danger / imposter
//  #0D474A  accent.tertiary     — deep teal crew / info (cool counterpoint)
//  #E6866D  accent.warm         — warm coral timer / categories
//  #2B1217  text.primary        — dark wine — max contrast on amber & cream
//  #6E454A  text.secondary      — dark mauve supporting text
//  #A0705A  text.muted          — warm brown muted / placeholder
//  #FDAB4E  text.inverse        — amber glow on dark surfaces
//  #2B1217  game.imposterBg     — dark wine imposter card
//  #0D474A  game.crewBg         — deep teal crew card
// ─────────────────────────────────────────────────────────────────────────────

export const goldenTheme: AppTheme = {
  id: 'golden',

  bg: {
    primary:  '#FDAB4E',  // Golden amber — ambient light everywhere
    surface:  '#FEE4BA',  // Warm parchment — cards float above
    elevated: '#FFF6E8',  // Near-white warm — modals, sheets
    overlay:  'rgba(43,18,23,0.68)',
    glass:    'rgba(171,60,31,0.07)',  // Rust-tinted glass
  },

  accent: {
    primary:   '#AB3C1F',  // Deep rust — CTA (warm, harmonious)
    secondary: '#DD563D',  // Coral-red — danger / imposter
    tertiary:  '#0D474A',  // Deep teal — crew / info (cool accent)
    warm:      '#E6866D',  // Warm coral — timer / categories
    premium:   '#2B1217',  // Dark wine — premium badge
  },

  text: {
    primary:   '#2B1217',  // Dark wine — readable on both amber & cream
    secondary: '#6E454A',  // Dark mauve — supporting text
    muted:     '#A0705A',  // Warm brown — disabled / placeholder
    inverse:   '#FEE4BA',  // Cream — text on dark rust / wine buttons
    onPrimary: '#FFFFFF',  // White on rust CTA
  },

  border: {
    subtle:  'rgba(43,18,23,0.08)',
    default: 'rgba(43,18,23,0.16)',
    strong:  'rgba(43,18,23,0.32)',
    focus:   '#AB3C1F',
  },

  glow: {
    primary: 'rgba(171,60,31,0.22)',   // Rust glow
    danger:  'rgba(221,86,61,0.26)',   // Coral glow
    success: 'rgba(13,71,74,0.20)',    // Teal glow
  },

  game: {
    imposterBg:    '#2B1217',  // Dark wine — imposter reveal
    crewBg:        '#0D474A',  // Deep teal — crew reveal
    voteBg:        '#FEE4BA',
    cardText:      '#FFFFFF',
    cardTextMuted: 'rgba(255,255,255,0.55)',
  },

  status: {
    success: '#0D474A',  // Deep teal — calm / good
    warning: '#E6866D',  // Warm coral
    error:   '#DD563D',  // Coral-red
    info:    '#BF94A8',  // Dusty rose
  },
}
