// ─────────────────────────────────────────────────────────────────────────────
// THEME TYPES — The complete type contract for all UI colors.
// Every color in the app MUST come from AppTheme. No exceptions.
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeId = 'dark' | 'light' | 'neon' | 'candy' | 'party' | 'sunset' | 'golden' | 'ember' | 'aurora' | 'custom'

export interface AppTheme {
  id: ThemeId

  bg: {
    primary: string    // Main screen background
    surface: string    // Cards, bottom sheets
    elevated: string   // Modals, overlays on cards
    overlay: string    // Dimming backdrop
    glass: string      // Glassmorphism fill
  }

  accent: {
    primary: string    // Main CTA color (buttons, selections)
    secondary: string  // Danger / Imposter / Destructive
    tertiary: string   // Crew reveal / Info
    warm: string       // Timer, categories, warmth
    premium: string    // Gold/premium badge color
  }

  text: {
    primary: string    // Main readable text
    secondary: string  // Supporting text
    muted: string      // Disabled, placeholder
    inverse: string    // Text on accent backgrounds
    onPrimary: string  // Text on accent.primary bg
  }

  border: {
    subtle: string     // Very light separators
    default: string    // Standard borders
    strong: string     // Emphasized borders
    focus: string      // Selected / focused state
  }

  glow: {
    primary: string    // Shadow for CTA elements
    danger: string     // Shadow for imposter/error elements
    success: string    // Shadow for success elements
  }

  game: {
    imposterBg: string    // Imposter reveal card background
    crewBg: string        // Crew reveal card background
    voteBg: string        // Vote screen tint
    cardText: string      // Primary text on reveal card back face
    cardTextMuted: string // Muted text on reveal card back face
  }

  status: {
    success: string
    warning: string
    error: string
    info: string
  }
}
