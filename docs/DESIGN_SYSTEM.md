# DESIGN SYSTEM
**Who's the Imposter?** — Visual Language & Component Specs
Read this before writing any UI code.

---

## 1. DESIGN PHILOSOPHY

**Concept: "Cinematic Underground"**
Think luxury card game meets noir film. The app should feel like it belongs in a premium Apple Arcade collection, not a free kids' game. Every competitor uses bright, flat, toylike interfaces — we do the opposite.

**The one thing users remember:** The word reveal moment. It must feel theatrical. Like a card being flipped at a poker table. The rest of the app serves this moment.

**Three themes — three personalities:**
- **Dark** → Elegant, mysterious. The default. Like a high-end poker room.
- **Light** → Clean, social, airy. Like a modern board game café.
- **Neon** → Electric, arcade, rebellious. Like a late-night retro gaming den.

---

## 2. THE THEME SYSTEM

Every single color in the app must be read from the active theme. No exceptions.

```typescript
// src/theme/types.ts — The complete type contract

export type ThemeId = 'dark' | 'light' | 'neon'

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
  }

  status: {
    success: string
    warning: string
    error: string
    info: string
  }
}
```

### Dark Theme Values
```typescript
export const darkTheme: AppTheme = {
  id: 'dark',
  bg: {
    primary:  '#0D0D0F',
    surface:  '#16161A',
    elevated: '#1E1E25',
    overlay:  'rgba(0,0,0,0.75)',
    glass:    'rgba(255,255,255,0.05)',
  },
  accent: {
    primary:   '#E8FF47',
    secondary: '#FF4757',
    tertiary:  '#7B61FF',
    warm:      '#FF9F43',
    premium:   '#FFD700',
  },
  text: {
    primary:   '#F8F8FF',
    secondary: '#8888AA',
    muted:     '#44445A',
    inverse:   '#0D0D0F',
    onPrimary: '#0D0D0F',
  },
  border: {
    subtle:  'rgba(255,255,255,0.05)',
    default: 'rgba(255,255,255,0.10)',
    strong:  'rgba(255,255,255,0.20)',
    focus:   '#E8FF47',
  },
  glow: {
    primary: 'rgba(232,255,71,0.20)',
    danger:  'rgba(255,71,87,0.25)',
    success: 'rgba(46,213,115,0.20)',
  },
  game: {
    imposterBg: '#150505',
    crewBg:     '#05050F',
    voteBg:     '#0A0A0D',
  },
  status: {
    success: '#2ED573',
    warning: '#FF9F43',
    error:   '#FF4757',
    info:    '#7B61FF',
  },
}
```

### Light Theme Values
```typescript
export const lightTheme: AppTheme = {
  id: 'light',
  bg: {
    primary:  '#F0F0F5',
    surface:  '#FFFFFF',
    elevated: '#FFFFFF',
    overlay:  'rgba(0,0,0,0.45)',
    glass:    'rgba(255,255,255,0.80)',
  },
  accent: {
    primary:   '#1A1A2E',
    secondary: '#E63946',
    tertiary:  '#6C63FF',
    warm:      '#F4813A',
    premium:   '#C9A227',
  },
  text: {
    primary:   '#1A1A2E',
    secondary: '#5A5A7A',
    muted:     '#A0A0C0',
    inverse:   '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
  border: {
    subtle:  'rgba(0,0,0,0.05)',
    default: 'rgba(0,0,0,0.10)',
    strong:  'rgba(0,0,0,0.20)',
    focus:   '#1A1A2E',
  },
  glow: {
    primary: 'rgba(26,26,46,0.12)',
    danger:  'rgba(230,57,70,0.15)',
    success: 'rgba(42,157,143,0.15)',
  },
  game: {
    imposterBg: '#FFF0F0',
    crewBg:     '#F0F0FF',
    voteBg:     '#F5F5FA',
  },
  status: {
    success: '#2A9D8F',
    warning: '#F4813A',
    error:   '#E63946',
    info:    '#6C63FF',
  },
}
```

### Neon Theme Values
```typescript
export const neonTheme: AppTheme = {
  id: 'neon',
  bg: {
    primary:  '#070715',
    surface:  '#0D0D2B',
    elevated: '#121238',
    overlay:  'rgba(0,0,0,0.80)',
    glass:    'rgba(0,255,255,0.04)',
  },
  accent: {
    primary:   '#00FFFF',
    secondary: '#FF00FF',
    tertiary:  '#00FF88',
    warm:      '#FFCC00',
    premium:   '#AA44FF',
  },
  text: {
    primary:   '#E0F7FF',
    secondary: '#6090A0',
    muted:     '#304050',
    inverse:   '#070715',
    onPrimary: '#070715',
  },
  border: {
    subtle:  'rgba(0,255,255,0.07)',
    default: 'rgba(0,255,255,0.15)',
    strong:  'rgba(0,255,255,0.30)',
    focus:   '#00FFFF',
  },
  glow: {
    primary: 'rgba(0,255,255,0.25)',
    danger:  'rgba(255,0,255,0.25)',
    success: 'rgba(0,255,136,0.20)',
  },
  game: {
    imposterBg: '#150515',
    crewBg:     '#051525',
    voteBg:     '#080818',
  },
  status: {
    success: '#00FF88',
    warning: '#FFCC00',
    error:   '#FF00FF',
    info:    '#00FFFF',
  },
}
```

### ThemeProvider Implementation
```typescript
// src/theme/index.ts
import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkTheme, lightTheme, neonTheme } from './themes'

const THEME_KEY = '@selected_theme'
const themes = { dark: darkTheme, light: lightTheme, neon: neonTheme }

const ThemeContext = createContext<{
  theme: AppTheme
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}>({ theme: darkTheme, themeId: 'dark', setTheme: () => {} })

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>('dark')

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved && themes[saved]) setThemeId(saved as ThemeId)
    })
  }, [])

  const setTheme = (id: ThemeId) => {
    setThemeId(id)
    AsyncStorage.setItem(THEME_KEY, id)
  }

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

---

## 3. TYPOGRAPHY

```typescript
// src/theme/tokens.ts

export const fontFamily = {
  display:    'Syne_800ExtraBold',   // Game reveals, hero headlines
  displayBold:'Syne_700Bold',        // Screen titles
  body:       'DMSans_400Regular',   // All body text
  bodyMedium: 'DMSans_500Medium',    // Emphasized body
  bodyBold:   'DMSans_700Bold',      // Strong body, buttons
  mono:       'JetBrainsMono_700Bold', // Timers, counters, codes
}

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
  '6xl': 68,  // Secret word reveal size
}

export const lineHeight = {
  tight:  1.1,
  normal: 1.4,
  loose:  1.7,
}
```

**Typography rules:**
- Secret word reveal: `fontSize['6xl']` + `fontFamily.display` — must feel monumental
- Screen titles: `fontSize['3xl']` + `fontFamily.displayBold`
- Body everywhere: `fontFamily.body` — never compromise readability
- Timers/counters: `fontFamily.mono` always — proportional numbers look bad on timers

---

## 4. SPACING & RADIUS

```typescript
export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
}

export const radius = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   30,
  '2xl': 40,
  full: 9999,
}
```

---

## 5. ANIMATION PRINCIPLES

### Animation Library
**Always use react-native-reanimated v3.** Never `Animated` from React Native core. Animations run on the native UI thread.

### Core Patterns

**Card Flip (Word Reveal)**
```typescript
// 3D card flip — the signature animation of this app
// Front face: 0° to 90° (card disappears)
// Back face: 90° to 180° (word appears)
// Duration: 400ms total, ease-in-out
// Shadow pulse on completion: scale 1→1.05→1 over 600ms
const flipProgress = useSharedValue(0)
const frontStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 90])}deg` }],
  opacity: flipProgress.value < 0.5 ? 1 : 0,
}))
const backStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${interpolate(flipProgress.value, [0, 1], [270, 360])}deg` }],
  opacity: flipProgress.value >= 0.5 ? 1 : 0,
}))
```

**Imposter Reveal Pulse**
```typescript
// On imposter reveal: glow pulse expands from center
// Scale: 1 → 1.4 → 1, opacity: 0 → 0.6 → 0
// Duration: 800ms, repeat once
// Color: theme.glow.danger
```

**Screen Entrance (Stagger)**
```typescript
// Children enter with staggered delay
// Each child: opacity 0→1 + translateY 20→0
// Duration: 350ms per element
// Delay: 80ms between each
// Easing: spring (damping 20, stiffness 200)
```

**Button Press**
```typescript
// scale: 1 → 0.96 on press-in
// scale: 0.96 → 1 on press-out (spring)
// Duration: 120ms press-in, spring release
const scale = useSharedValue(1)
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}))
```

**Long Press Reveal (Hold-to-Reveal)**
```typescript
// Progress arc fills around the hold button
// 500ms threshold
// If released early: arc resets with spring
// On complete: immediate card flip trigger + haptic Heavy
```

### Motion Rules
- **Reduced motion:** Always check `AccessibilityInfo.isReduceMotionEnabled()` and skip animations if true
- **Duration budget:** No single animation longer than 600ms (except deliberate dramatic reveals up to 800ms)
- **Easing:** Prefer spring (`withSpring`) over timing for interactive elements; timing for passive reveals

---

## 6. COMPONENT VISUAL SPECS

### Button
```
Variants:
  primary   → bg: theme.accent.primary, text: theme.text.onPrimary
              shadow: theme.glow.primary (elevation effect)
  secondary → bg: theme.bg.surface, border: theme.border.default, text: theme.text.primary
  danger    → bg: theme.accent.secondary, text: white
  ghost     → bg: transparent, text: theme.text.secondary
  outline   → bg: transparent, border: theme.border.default, text: theme.text.primary

Sizes:
  sm → height 36, fontSize md, paddingH md, radius sm
  md → height 46, fontSize lg, paddingH lg, radius md
  lg → height 56, fontSize xl, paddingH xl, radius lg — default for game CTAs

States:
  default   → as specified
  pressed   → scale 0.96 (Reanimated spring)
  disabled  → opacity 0.40, no press animation
  loading   → spinner replaces label, opacity 0.80

Design note: The primary button in dark theme (lime on dark) is the most important
element in the app. It must pop. Add a 1px border matching accent.primary at 30%
opacity around it to give it a "lit" quality.
```

### Card
```
Base: bg theme.bg.surface, border theme.border.subtle (1px), radius lg
Elevated: bg theme.bg.elevated, shadow 0 4px 24px rgba(0,0,0,0.3)
Interactive: add borderColor theme.border.focus + glow.primary shadow on selected
Glass variant: bg theme.bg.glass, backdrop-blur (on supported platforms), border theme.border.default
```

### WordRevealCard
```
Dimensions: full-width minus 32px margin, height 240px, radius xl
Face-down: 
  - Background: theme.bg.elevated
  - Pattern: subtle repeating diagonal lines or dots in theme.border.subtle
  - Center: lock icon in theme.text.muted
  - "Hold to reveal" label in theme.text.muted, sm font

Crew face (revealed):
  - Background: theme.game.crewBg
  - Border: 1px theme.accent.tertiary at 40% opacity
  - Outer glow: theme.glow.primary at 0.15 opacity, blur 40px
  - Word: fontSize['6xl'], fontFamily.display, theme.text.primary, centered
  - Word auto-blurs after 5s: blur-filter 8px transition over 1s

Imposter face (revealed):
  - Background: theme.game.imposterBg  
  - Border: 1px theme.accent.secondary at 60% opacity
  - Outer glow: theme.glow.danger, blur 60px, expands on reveal
  - "YOU ARE THE" — sm, theme.text.secondary, tracking wide
  - "IMPOSTER!" — fontSize['4xl'], fontFamily.display, theme.accent.secondary
```

### CategoryCard
```
Dimensions: (containerWidth / 2) - 12px wide, height 100px, radius lg
Background: theme.bg.surface
Border: 1px theme.border.subtle
Content: emoji (32px) top-left, name (body bold) bottom-left, word count chip bottom-right

Selected state:
  - Border: 2px theme.border.focus
  - Background: slightly tinted (theme.accent.primary at 5% opacity over surface)
  - Small checkmark badge top-right: theme.accent.primary background

Premium/locked state:
  - Opacity: 0.50
  - Lock icon overlay: centered, theme.text.muted
  - "PRO" badge: theme.accent.premium background, tiny label font, top-right corner
```

### GameModeCard (home screen)
```
Dimensions: full-width, height 80px, radius lg
Layout: horizontal — emoji (48px, left) + text block (center, flex) + chevron (right)
Text block: game name (bodyBold, text.primary) + description (sm, text.secondary)
Background: theme.bg.surface
Border: 1px theme.border.subtle
Pressed: scale 0.98 + background tints to theme.bg.elevated

Premium card additionally:
  - "PRO" badge right of title
  - Lock icon replaces chevron
```

### VoteCard
```
Dimensions: (containerWidth / 2) - 8px wide, height 90px, radius lg
Center: Avatar circle (48px) + player name below
Default: bg theme.bg.surface, border theme.border.subtle
Voted (this player received votes): 
  - Border: 2px theme.accent.primary
  - Small vote count badge: top-right, theme.accent.primary bg, white text
Self (cannot vote for): opacity 0.40, no press response
```

### TimerRing
```
Circle SVG progress indicator, size 80px
Full: theme.accent.warm (amber)
Warning (< 25%): interpolated to theme.accent.secondary (red)
Danger (< 10%): pulse animation + theme.accent.secondary solid
Center: countdown number, fontFamily.mono, fontSize['3xl']
```

---

## 7. BACKGROUND TREATMENTS PER THEME

The home screen and reveal screen backgrounds must feel alive, not static.

**Dark theme:**
Animated radial gradient mesh. Two soft blobs (theme.accent.primary at 8% opacity, theme.accent.tertiary at 6% opacity) that slowly drift across the screen. Cycle: 12 seconds, seamless loop. Implemented with Reanimated + canvas or SVG path interpolation.

**Light theme:**
Subtle geometric grid pattern (thin lines, theme.border.subtle) with a warm gradient overlay (white to theme.bg.primary). No animation — cleanliness is the aesthetic.

**Neon theme:**
Dark grid/scanline texture with very faint horizontal lines (theme.border.subtle). Occasional dim flicker effect on one horizontal scan line per ~8 seconds. Gives a CRT/arcade monitor feel.

---

## 8. ICONOGRAPHY

**Library:** `lucide-react-native`  
**Default size:** 20px (inline), 24px (standalone)  
**Color:** Always from theme — pass `color={theme.text.secondary}` or relevant token  
**Stroke width:** 1.5 (never default 2 — too heavy for this aesthetic)

---

## 9. HAPTIC FEEDBACK MAP

| Event | Haptic Type |
|-------|------------|
| Button tap | `impactAsync(ImpactFeedbackStyle.Light)` |
| Card selection | `selectionAsync()` |
| Card reveal (crew) | `impactAsync(ImpactFeedbackStyle.Medium)` |
| Imposter reveal | `impactAsync(ImpactFeedbackStyle.Heavy)` then `notificationAsync(NotificationFeedbackType.Warning)` |
| Successful action | `notificationAsync(NotificationFeedbackType.Success)` |
| Error / invalid | `notificationAsync(NotificationFeedbackType.Error)` |
| Vote cast | `selectionAsync()` |
| Game win | `notificationAsync(NotificationFeedbackType.Success)` |

Always check `settingsStore.hapticsEnabled` before firing. Wrap in try/catch (some Android devices don't support all types).

---

## 10. SCREEN-LEVEL BACKGROUND HIERARCHY

Every screen uses `<ScreenContainer>` which handles:
- SafeArea insets (top + bottom)
- Background color from `theme.bg.primary`
- StatusBar style (auto-derived from theme)
- Keyboard avoidance where needed

Never set background colors directly on screens — always via `ScreenContainer`.
