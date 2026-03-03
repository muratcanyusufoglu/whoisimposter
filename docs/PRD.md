# WHO'S THE IMPOSTER? — Product Requirements Document
**Version:** 3.0 | **Language:** English | **Status:** Ready for AI-assisted development

---

## 1. PRODUCT OVERVIEW

**Who's the Imposter?** is a premium offline-first social deduction and party game platform built with Expo React Native. Players pass a single device around — no internet, no accounts, no friction.

### Core Value Proposition
- 12+ party games in one app
- Culturally adapted content per language (not just translated)
- Best-in-class UI/UX — cinematic, premium, dark-first design
- Zero friction: open and play in under 10 seconds

### Target Users
- Age 16–35, friend groups of 3–15
- Occasions: house parties, road trips, family nights, team events
- Key insight: downloaded during a social gathering, must impress within 30 seconds

---

## 2. TECHNICAL STACK

```
Framework:        Expo SDK 52+ (React Native, managed workflow)
Navigation:       Expo Router v3 (file-based routing)
State:            Zustand v4 (global), React useState (local UI only)
Storage:          AsyncStorage (all persistent data, offline)
i18n:             i18next + react-i18next + expo-localization
Fonts:            @expo-google-fonts/syne, dm-sans, jetbrains-mono
Animations:       react-native-reanimated v3 (native thread ONLY)
Gestures:         react-native-gesture-handler
Audio:            expo-av (preloaded at startup)
Haptics:          expo-haptics
Icons:            lucide-react-native
Purchases:        react-native-purchases (RevenueCat SDK)
Build:            EAS Build (iOS + Android production)
Updates:          EAS Update (OTA)
TypeScript:       Strict mode, no `any`
```

### Strict Architectural Rules
1. **Zero hardcoded colors** — every color via `theme.*`
2. **Zero inline strings** — every user-facing text via `t('key')`
3. **Zero network calls in gameplay** — fully offline
4. **Reanimated only** — no `Animated` API from React Native core
5. **Game logic never in components** — all logic in `src/logic/`
6. **Zustand for cross-component state** — `useState` for local UI only

---

## 3. PROJECT STRUCTURE

```
whosimposter/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root: ThemeProvider, i18n, fonts
│   ├── index.tsx                 # Entry: redirect to onboarding or home
│   ├── onboarding/
│   │   ├── _layout.tsx           # Stack layout, no header
│   │   ├── language.tsx          # Step 1: Language selection
│   │   ├── welcome.tsx           # Step 2: App intro + benefits
│   │   ├── how-to-play.tsx       # Step 3: Core game rules
│   │   └── games-showcase.tsx    # Step 4: Game modes preview
│   ├── (main)/
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── home.tsx              # Game mode selection hub
│   │   └── settings.tsx          # Settings screen
│   └── game/
│       ├── setup.tsx             # Players + category + mode config
│       ├── reveal/
│       │   └── [index].tsx       # Word reveal (pass-the-phone)
│       ├── play.tsx              # Active game phase
│       ├── vote.tsx              # Voting phase
│       └── result.tsx            # Round result
│
├── src/
│   ├── theme/                    # See DESIGN_SYSTEM.md
│   │   ├── index.ts              # ThemeProvider + useTheme
│   │   ├── types.ts              # AppTheme interface
│   │   ├── tokens.ts             # Spacing, radius, fontSize (theme-agnostic)
│   │   └── themes/
│   │       ├── dark.ts
│   │       ├── light.ts
│   │       └── neon.ts
│   │
│   ├── components/
│   │   ├── ui/                   # Primitive components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── Divider.tsx
│   │   ├── game/                 # Game-specific components
│   │   │   ├── WordRevealCard.tsx
│   │   │   ├── PlayerChip.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── GameModeCard.tsx
│   │   │   ├── VoteCard.tsx
│   │   │   ├── TimerRing.tsx
│   │   │   └── ResultBanner.tsx
│   │   ├── modals/
│   │   │   ├── PaywallModal.tsx
│   │   │   ├── RatingModal.tsx
│   │   │   └── ThemePickerModal.tsx
│   │   └── layout/
│   │       ├── ScreenContainer.tsx
│   │       └── ScreenHeader.tsx
│   │
│   ├── logic/                    # See GAME_LOGIC.md — pure functions, no UI
│   │   ├── gameEngine.ts         # Core game orchestration
│   │   ├── imposterLogic.ts      # Imposter assignment, reveal, vote resolution
│   │   ├── wordSelector.ts       # Word picking by category + locale
│   │   ├── playerManager.ts      # Player CRUD + validation
│   │   ├── scoreKeeper.ts        # Points, streaks (future)
│   │   └── games/                # Per-game logic modules
│   │       ├── imposter.ts
│   │       ├── truthOrDare.ts
│   │       ├── neverHaveIEver.ts
│   │       ├── mostLikelyTo.ts
│   │       ├── hotTakes.ts
│   │       ├── wouldYouRather.ts
│   │       ├── twoTruthsOneLie.ts
│   │       ├── headsUp.ts
│   │       ├── wordChain.ts
│   │       ├── triviaBet.ts
│   │       ├── charades.ts
│   │       └── paranoia.ts
│   │
│   ├── store/                    # Zustand stores
│   │   ├── gameStore.ts
│   │   ├── settingsStore.ts
│   │   └── subscriptionStore.ts
│   │
│   ├── data/                     # See DATA_SCHEMA.md
│   │   ├── games/                # Game mode definitions
│   │   └── words/                # Locale-specific word lists
│   │       ├── en/
│   │       ├── tr/
│   │       ├── de/
│   │       ├── fr/
│   │       ├── es/
│   │       ├── pt/
│   │       ├── ru/
│   │       ├── ar/
│   │       ├── it/
│   │       └── nl/
│   │
│   ├── hooks/
│   │   ├── useGame.ts            # Game state selectors + actions
│   │   ├── useHaptics.ts         # Haptic feedback helpers
│   │   ├── useSound.ts           # Audio playback helpers
│   │   ├── useOnboarding.ts      # Onboarding state + navigation
│   │   └── useSubscription.ts    # Pro status + purchase actions
│   │
│   ├── utils/
│   │   ├── shuffle.ts            # Fisher-Yates shuffle
│   │   ├── storage.ts            # AsyncStorage typed wrappers
│   │   └── platform.ts           # Platform-specific helpers
│   │
│   └── i18n/
│       ├── index.ts              # i18next init + changeLanguage
│       └── locales/              # 10 language JSON files
│           ├── en.json
│           ├── tr.json
│           └── ...
│
├── assets/
│   ├── sounds/                   # .mp3 files (preloaded)
│   └── images/
│
├── docs/                         # This document lives here
│   ├── PRD.md
│   ├── DESIGN_SYSTEM.md
│   ├── TASK_LIST.md
│   ├── GAME_LOGIC.md
│   └── DATA_SCHEMA.md
│
├── app.json
├── eas.json
└── package.json
```

---

## 4. LOCALIZATION

### Supported Languages (Launch)

| Code | Language | RTL | App Name |
|------|----------|-----|----------|
| en | English | No | Who's the Imposter? |
| tr | Turkish | No | Kim Sahtekâr? |
| de | German | No | Wer ist der Hochstapler? |
| fr | French | No | Qui est l'Imposteur? |
| es | Spanish | No | ¿Quién es el Impostor? |
| pt | Portuguese | No | Quem é o Impostor? |
| ru | Russian | No | Кто самозванец? |
| ar | Arabic | Yes | من هو المحتال؟ |
| it | Italian | No | Chi è l'Impostore? |
| nl | Dutch | No | Wie is de Bedrieger? |

### Key i18n Rules
- Language selection on first launch sets both UI language AND word list locale
- Word lists are culturally adapted, not translated (see DATA_SCHEMA.md)
- `changeLanguage()` updates i18next AND `wordSelector.setLocale()` atomically
- RTL: Arabic triggers `I18nManager.forceRTL(true)` with app restart prompt
- All i18n keys use dot notation: `game.setup.addPlayer`, `onboarding.welcome.headline`

---

## 5. SCREENS & USER FLOWS

### 5.1 First Launch Flow
```
App opens
  → index.tsx checks AsyncStorage @onboarding_completed
  → If false: navigate to /onboarding/language
  → Onboarding completes (4 screens)
  → Set @onboarding_completed = true
  → Wait 1500ms
  → Show RatingModal
  → Rating modal closes (any action)
  → Wait 500ms
  → Show PaywallModal
  → Paywall closes
  → Navigate to /(main)/home
```

### 5.2 Returning User Flow
```
App opens
  → index.tsx checks @onboarding_completed = true
  → Navigate directly to /(main)/home
  → Last session settings auto-populated from AsyncStorage
```

### 5.3 Game Flow (Imposter Mode)
```
home.tsx → tap "Who's the Imposter?"
  → game/setup.tsx (add players, pick category, configure)
  → tap START GAME
  → game/reveal/0.tsx (Player 1: hold to reveal)
  → game/reveal/1.tsx (Player 2...)
  → ... (for each player)
  → game/play.tsx (discussion + timer)
  → tap START VOTING
  → game/vote.tsx (each player casts vote)
  → tap REVEAL VOTES
  → game/result.tsx (winner revealed, imposter guesses?)
  → PLAY AGAIN → game/setup.tsx (same settings)
  → NEW GAME → /(main)/home
```

---

## 6. SCREEN SPECIFICATIONS

### 6.1 Onboarding — Language Screen (`/onboarding/language`)
- Logo centered top with subtle entrance animation
- Grid (2 columns) of language options: flag emoji + native language name
- Each row tap: highlight with `theme.accent.primary` border + haptic selection
- [Continue →] CTA disabled until selection made
- No skip allowed on this screen

### 6.2 Onboarding — Welcome Screen (`/onboarding/welcome`)
- Large animated logo/icon (entrance: scale 0→1, spring)
- Headline: localized tagline (`t('onboarding.welcome.headline')`)
- 3 benefit rows: icon + bold label + short description
  1. 🎭 12+ party games
  2. 📱 No internet needed
  3. 👥 3–15 players
- Progress dots (4 total) bottom center
- [Continue →] full-width CTA

### 6.3 Onboarding — How to Play (`/onboarding/how-to-play`)
- Animated 3-step breakdown with staggered entrance (100ms delay each)
- Step 1: Pass the phone 📱 — mini card flip animation
- Step 2: Everyone sees their word 🤫 — word reveal mini demo
- Step 3: Find the imposter! 🕵️ — vote animation
- Swipe gesture to advance also works
- [Continue →] + progress dots

### 6.4 Onboarding — Games Showcase (`/onboarding/games-showcase`)
- Horizontal FlatList of 5 game mode cards (peek next card = 20px)
- Each card: large emoji, game name, 1-line description
- Last card: "And 7 more games..." with unlock hint
- [Let's Play! →] full-width CTA — this triggers onboarding complete

### 6.5 Home Screen (`/(main)/home`)
- Animated background (theme-matched: dark mesh / light gradient / neon grid)
- Top bar: localized app name (left) + settings icon (right) + language flag
- Section "Party Games" — vertical scrollable list of game mode cards
- Each card: emoji (large), game name, short description, player count badge
- Premium games: lock icon overlay + "PRO" badge, tapping opens PaywallModal
- Quick resume chip: "Continue last game →" if previous session exists

### 6.6 Game Setup Screen (`/game/setup`)
Layout: single scrollable screen with 4 collapsible sections

**Section 1 — Players**
- Text input + [+] Add button
- Player chips below: avatar circle (auto-colored), name, × remove
- Drag-to-reorder via gesture handler
- Validation: min 3, max 15, no duplicate names

**Section 2 — Game Mode** (hidden for non-imposter games)
- Horizontal carousel: Classic / Undercover / Ghost
- Each: icon, name, 1-sentence description
- Premium modes locked with overlay

**Section 3 — Categories** (imposter mode only)
- 2-column grid of CategoryCard components
- Select multiple, "All" quick-select chip
- Premium categories: opacity 0.5 + lock icon

**Section 4 — Advanced Settings** (collapsible, closed by default)
- Imposters: [1] [2] chip selector
- Timer: [Off] [10s] [15s] [30s]
- Sound: toggle
- Haptics: toggle

**Bottom CTA:** [START GAME] — disabled if < 3 players or no category selected

### 6.7 Word Reveal Screen (`/game/reveal/[index]`)
**Critical screen — emotional peak of the game.**

**Pre-reveal state:**
- Player name large centered: "ALEX"
- Instruction text (pass phone, don't show)
- Large card face-down (blurred frosted glass)
- Hold-to-reveal button — LongPressGestureHandler, 500ms threshold
- Minimum display time: 2s before NEXT tappable

**Post-reveal — CREW:**
- 3D card flip (rotateY: 0° → 180°, 400ms, ease-in-out)
- Background shifts: `theme.game.crew` + `theme.glow.tertiary` ambient
- Secret word: display-xl font, centered, stark
- Subtitle: "Give ONE clue. Don't give it away."
- Auto-blur after 5 seconds OR on tap-outside
- [NEXT PLAYER →] button — same position as imposter

**Post-reveal — IMPOSTER:**
- 3D card flip + red pulse explosion (scale 1→1.3→1, 300ms, `theme.glow.danger`)
- Background: `theme.game.imposter` + danger glow
- Large text: "YOU ARE THE IMPOSTER!" (`theme.accent.secondary`)
- Subtitle: "Blend in. You don't know the word."
- [NEXT PLAYER →] — IDENTICAL position and size to crew version

**Non-negotiable UX rule:** The NEXT PLAYER button must be visually identical in both states. Any observer must be unable to tell which role was shown.

### 6.8 Active Game Screen (`/game/play`)
- Header: category emoji + "Round X"
- Player list: who has given a clue (checkmark), who hasn't
- Optional timer: `TimerRing` component, color shifts amber → red at 25%
- Floating [START VOTING →] button (appears after all players checked, or manual override by host)
- Subtle background pulse on timer end warning

### 6.9 Voting Screen (`/game/vote`)
- Headline: "WHO IS THE IMPOSTER?" — display font
- Player grid (2 columns): each a tappable VoteCard
- Each player can cast exactly 1 vote; own name not selectable
- Voted player: highlighted with `theme.accent.primary` ring
- [REVEAL VOTES] CTA — disabled until all votes are in
- On reveal: vote counts animate in simultaneously (staggered 50ms per card)

### 6.10 Result Screen (`/game/result`)

**State A — Imposter Caught:**
- Particle burst (confetti, `theme.accent.primary` colors)
- "CAUGHT!" large display text
- Imposter name revealed
- Follow-up prompt: "Can [name] guess the secret word?"
  - [YES — They guessed it] → Imposter wins variant
  - [NO — They failed] → Crew wins variant
- Animated score/result card

**State B — Imposter Escaped:**
- Dark dramatic reveal animation
- "THEY GOT AWAY" display text, `theme.accent.secondary` color
- "The secret word was: [WORD]"
- Imposter name with red glow

**Both states bottom actions:**
- [PLAY AGAIN] — same setup, new word
- [NEW GAME] → home
- [SHARE RESULT] → generates shareable image card

---

## 7. MODALS

### 7.1 Rating Modal
**Trigger conditions:**
- 1500ms after onboarding completes (first time only)
- After 3rd completed game (if user said "Later" before)
- Never shown again if user tapped the main CTA

**Content:**
- Stars emoji header
- Headline: "Enjoying the game?"
- Subtext: "A 5-star review helps us a lot!"
- Interactive star row (1–5, tap to select)
- [Rate Now ⭐] → `expo-store-review` native dialog
- [Maybe Later] → store timestamp, show again after 48h
- [No thanks] → set permanent flag, never show again

### 7.2 Paywall Modal
**Trigger conditions:**
- 500ms after rating modal closes during onboarding
- Tapping any locked (premium) content
- Settings → "Upgrade to PRO"

**Delayed close button:** X appears after **4 seconds** with opacity 0→1 + scale 0.8→1 spring animation. During the 4 seconds, a subtle arc/countdown indicator shows at top-right where X will appear.

**Layout (top to bottom):**
1. Crown icon + "WHO'S THE IMPOSTER PRO" header
2. Benefits list (5 items, checkmark icons):
   - All 20 categories
   - 2 imposters mode
   - All 12 party games
   - Custom word lists
   - Ad-free experience
3. Plan selector: [Monthly $2.99] [Yearly $14.99 — Best Value]
   - Yearly default selected, shows "Save 58%"
4. [Start 7-Day Free Trial →] — primary CTA
5. Social proof: ⭐⭐⭐⭐⭐ 4.8 · 18K ratings
6. "Cancel anytime" + "Restore Purchases" links
7. Privacy Policy · Terms of Use

**Plan pricing by locale:**
- TR: ₺79.99/mo, ₺399.99/yr
- US/EN: $2.99/mo, $14.99/yr
- EU: €2.99/mo, €14.99/yr
- RU: ₽249/mo, ₽1290/yr

---

## 8. GAME MODES

### Free Games (6)
| # | Name (EN) | Name (TR) | Players | Core Mechanic |
|---|-----------|-----------|---------|---------------|
| 1 | Who's the Imposter? | Kim Sahtekâr? | 3–15 | Secret word, one doesn't know |
| 2 | Truth or Dare | Gerçek mi Cesaret mi? | 2+ | Answer or perform |
| 3 | Never Have I Ever | Parmak İndir | 3+ | Fingers down mechanic |
| 4 | Most Likely To | Kim Daha Çok? | 3+ | Group pointing vote |
| 5 | Hot Takes | Ateşli Görüşler | 3+ | Agree/disagree poll |
| 6 | Would You Rather | Ya Da? | 2+ | Binary choice + discuss |

### Premium Games (6)
| # | Name (EN) | Name (TR) | Players | Core Mechanic |
|---|-----------|-----------|---------|---------------|
| 7 | Two Truths One Lie | 2 Doğru 1 Yalan | 3+ | Guess which is the lie |
| 8 | Heads Up! | Bul Bakalım! | 3+ | Phone on forehead, get clues |
| 9 | Word Chain | Kelime Zinciri | 2+ | Last-letter chain, timed |
| 10 | Trivia Bet | Trivia Bahis | 3+ | Bet on your answer |
| 11 | Paranoia | Paranoya | 3+ | Whisper-reveal game |
| 12 | Charades | Sessiz Sinema | 3+ | Act it out, no words |

---

## 9. ZUSTAND STORES

### gameStore.ts
```typescript
interface GameStore {
  // Config
  mode: GameMode
  players: Player[]
  selectedCategories: string[]
  impostersCount: 1 | 2
  timerSeconds: 0 | 10 | 15 | 30
  soundEnabled: boolean
  hapticsEnabled: boolean

  // Active game state
  secretWord: string
  imposterIds: string[]
  currentRevealIndex: number
  revealedPlayerIds: string[]
  playerCluesGiven: string[]
  votes: Record<string, string> // voterId → targetId
  roundPhase: 'idle' | 'setup' | 'reveal' | 'play' | 'vote' | 'result'
  roundNumber: number
  imposterGuessedCorrectly: boolean | null

  // Actions
  initGame: (config: GameConfig) => void
  advanceReveal: () => void
  markCluedGiven: (playerId: string) => void
  castVote: (voterId: string, targetId: string) => void
  resolveVotes: () => VoteResult
  setImposterGuess: (correct: boolean) => void
  nextRound: () => void
  resetGame: () => void
}
```

### settingsStore.ts
```typescript
interface SettingsStore {
  theme: 'dark' | 'light' | 'neon'
  language: string
  soundEnabled: boolean
  hapticsEnabled: boolean
  
  // Lifecycle flags
  onboardingCompleted: boolean
  ratingState: 'unseen' | 'later' | 'done'
  ratingLastPromptAt: number | null
  paywallSeenCount: number
  gamesCompleted: number
  
  // Actions
  setTheme: (t: Theme) => void
  setLanguage: (lang: string) => void
  completeOnboarding: () => void
  updateRatingState: (state: RatingState) => void
  incrementGamesCompleted: () => void
}
```

### subscriptionStore.ts
```typescript
interface SubscriptionStore {
  isPro: boolean
  expiryDate: string | null
  isLoading: boolean
  error: string | null

  // Actions
  checkStatus: () => Promise<void>
  purchaseMonthly: () => Promise<void>
  purchaseYearly: () => Promise<void>
  restore: () => Promise<void>
}
```

---

## 10. MONETIZATION

### Products (RevenueCat)
```
monthly_pro:  com.whosimposter.party.monthly   $2.99/mo  7-day trial
yearly_pro:   com.whosimposter.party.yearly    $14.99/yr 7-day trial
```

### Free vs Pro Feature Matrix
| Feature | Free | Pro |
|---------|------|-----|
| Core imposter game | ✅ | ✅ |
| 10 base categories | ✅ | ✅ |
| 6 free party games | ✅ | ✅ |
| Dark + Light themes | ✅ | ✅ |
| 10 premium categories | ❌ | ✅ |
| 6 premium party games | ❌ | ✅ |
| 2 imposters mode | ❌ | ✅ |
| Custom word lists | ❌ | ✅ |
| Neon theme | ❌ | ✅ |

---

## 11. PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| Cold start to home | < 2s |
| Theme switch | < 100ms |
| Animation frame rate | 60fps steady |
| Offline capability | 100% gameplay |
| App download size | < 35MB |
| RAM during gameplay | < 150MB |

---

## 12. PLATFORM COMPATIBILITY

### iOS
- Minimum: iOS 16
- Safe area: `react-native-safe-area-context`
- Back navigation: swipe gesture (Expo Router default)
- StatusBar: light (dark theme), dark (light theme)

### Android
- Minimum: Android 8 (API 26)
- Back navigation: hardware back button → confirm dialog if in active game
- StatusBar: translucent with matching background color
- Edge-to-edge: `android:windowSoftInputMode="adjustResize"`

### Both
- RTL: `I18nManager.forceRTL` for Arabic
- Font scaling: respect system accessibility font size
- Reduced motion: `AccessibilityInfo.isReduceMotionEnabled()`

---

## 13. DEFINITION OF DONE

### Component is done when:
- [ ] Zero hardcoded colors — all from `useTheme()`
- [ ] Tested in all 3 themes (dark, light, neon)
- [ ] Localized — no raw strings, all via `t()`
- [ ] Haptic feedback implemented per spec
- [ ] Reanimated animations run at 60fps
- [ ] `accessibilityLabel` on all interactive elements
- [ ] Tested on iOS + Android

### Feature is done when:
- [ ] Full user flow works end-to-end
- [ ] Edge cases handled (empty states, min/max players)
- [ ] Store state persists across app restart (AsyncStorage)
- [ ] Works without internet

### App is launch-ready when:
- [ ] All 12 game modes playable
- [ ] All 10 languages have word lists (50+ words per category)
- [ ] Onboarding → Rating → Paywall flow tested
- [ ] RevenueCat products live in both stores
- [ ] EAS Production build passes review
- [ ] App Store screenshots for all device sizes created
