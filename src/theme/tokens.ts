// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — theme-agnostic spacing, radii, font sizes, font families.
// These values never change between themes.
// ─────────────────────────────────────────────────────────────────────────────

export const fontFamily = {
  display:     'Syne_800ExtraBold',     // Game reveals, hero headlines
  displayBold: 'Syne_700Bold',          // Screen titles
  body:        'DMSans_400Regular',     // All body text
  bodyMedium:  'DMSans_500Medium',      // Emphasized body
  bodyBold:    'DMSans_700Bold',        // Strong body, buttons
  mono:        'JetBrainsMono_700Bold', // Timers, counters, codes
} as const

export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 52,
  '6xl': 68, // Secret word reveal size
} as const

export const lineHeight = {
  tight:  1.1,
  normal: 1.4,
  loose:  1.7,
} as const

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
} as const

export const radius = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   30,
  '2xl': 40,
  full: 9999,
} as const
