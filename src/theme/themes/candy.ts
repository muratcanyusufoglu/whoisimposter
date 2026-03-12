import { AppTheme } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// CANDY THEME — Inspired by the vibrant AI-generated game artwork:
// deep indigo backgrounds, hot-pink primary, coral danger, sky-blue crew,
// amber warmth, and gold premium. Every hue is drawn directly from the
// palette that appears across the 12 game illustrations.
// ─────────────────────────────────────────────────────────────────────────────

export const candyTheme: AppTheme = {
  id: 'candy',

  bg: {
    primary:  '#0E0820', // Deep indigo-black — the dark canvas behind the illustrations
    surface:  '#170E34', // Rich purple surface — cards and bottom sheets
    elevated: '#211545', // Lifted purple — modals, overlays
    overlay:  'rgba(0,0,0,0.82)',
    glass:    'rgba(255,100,200,0.05)',
  },

  accent: {
    primary:   '#FF6BD6', // Hot magenta-pink — dominant pop color in the artwork
    secondary: '#FF4A6E', // Coral-red — danger / imposter tint
    tertiary:  '#4FC3F7', // Sky blue — crew reveal / info
    warm:      '#FFB347', // Mango-amber — timer, category badges
    premium:   '#F9CA24', // Sunflower gold — PRO badge
  },

  text: {
    primary:   '#F4EEFF', // Soft lavender-white — comfortable on dark purple bg
    secondary: '#9B7EC8', // Medium purple — supporting text
    muted:     '#4E3878', // Darkened purple — placeholders, disabled
    inverse:   '#0E0820', // Dark bg color — text on bright accent surfaces
    onPrimary: '#0E0820', // Dark bg color — text on accent.primary buttons
  },

  border: {
    subtle:  'rgba(255,107,214,0.08)',
    default: 'rgba(255,107,214,0.18)',
    strong:  'rgba(255,107,214,0.35)',
    focus:   '#FF6BD6',
  },

  glow: {
    primary: 'rgba(255,107,214,0.28)',
    danger:  'rgba(255,74,110,0.28)',
    success: 'rgba(79,195,247,0.22)',
  },

  game: {
    imposterBg:    '#2D071C', // Deep wine — imposter reveal card
    crewBg:        '#071630', // Midnight blue — crew reveal card
    voteBg:        '#100920', // Dark indigo — vote screen tint
    cardText:      '#F4EEFF',
    cardTextMuted: 'rgba(244,238,255,0.55)',
  },

  status: {
    success: '#4FC3F7', // Sky blue  — positive outcomes
    warning: '#FFB347', // Amber     — caution
    error:   '#FF4A6E', // Coral-red — errors / imposter
    info:    '#C77DFF', // Orchid purple — info banners
  },
}
