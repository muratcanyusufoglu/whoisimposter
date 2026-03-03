# TASK LIST
**Who's the Imposter?** — Feature-Based Development Checklist
Organized for AI-assisted (vibe coding) development sessions.

## HOW TO USE THIS FILE
- Work one feature at a time. Don't start the next until current is ✅.
- At the start of each session, tell the AI: "Read TASK_LIST.md and continue from the next incomplete task."
- After completing a task, mark it ✅ and commit before moving on.
- Reference the relevant doc per task: `[PRD]`, `[DESIGN]`, `[LOGIC]`, `[DATA]`

---

## FEATURE 0 — PROJECT FOUNDATION
*Must be done before anything else. Sets up the entire architecture.*

- [x] **F0.1** Initialize Expo project with TypeScript strict mode
  ```
  npx create-expo-app whosimposter --template expo-template-blank-typescript
  ```
- [x] **F0.2** Install all dependencies (see PRD §2 tech stack)
  - expo-router, zustand, @react-native-async-storage/async-storage
  - react-native-reanimated, react-native-gesture-handler
  - i18next, react-i18next, expo-localization
  - @expo-google-fonts/syne, @expo-google-fonts/dm-sans, @expo-google-fonts/jetbrains-mono
  - expo-av, expo-haptics, lucide-react-native
  - react-native-purchases (RevenueCat)
- [x] **F0.3** Configure Expo Router file-based routing (app.json + _layout.tsx)
- [x] **F0.4** Create folder structure exactly as defined in PRD §3
- [x] **F0.5** Set up TypeScript path aliases (`@/` → `src/`)
- [x] **F0.6** Create all type definitions in `src/types/index.ts` [LOGIC §4]
- [x] **F0.7** Create `src/utils/shuffle.ts` [LOGIC §2.5]
- [x] **F0.8** Create `src/utils/storage.ts` with STORAGE_KEYS registry [DATA §5]
- [x] **F0.9** Configure EAS Build (`eas.json`) for iOS + Android

**✅ Checkpoint:** `npx expo start` runs without errors. TypeScript compiles clean.

---

## FEATURE 1 — THEME SYSTEM
*Foundation of all UI. Must work perfectly before any component is built.*

- [x] **F1.1** Create `src/theme/types.ts` — full `AppTheme` interface [DESIGN §2]
- [x] **F1.2** Create `src/theme/tokens.ts` — spacing, radius, fontSize, fontFamily [DESIGN §§3,4]
- [x] **F1.3** Create `src/theme/themes/dark.ts` with all values [DESIGN §2]
- [x] **F1.4** Create `src/theme/themes/light.ts` with all values [DESIGN §2]
- [x] **F1.5** Create `src/theme/themes/neon.ts` with all values [DESIGN §2]
- [x] **F1.6** Create `src/theme/index.ts` — ThemeProvider + useTheme hook [DESIGN §2]
- [x] **F1.7** Wrap root `_layout.tsx` with ThemeProvider
- [x] **F1.8** Load all 3 fonts in root layout using `useFonts` — app waits for fonts before render
- [x] **F1.9** Set up `expo-status-bar` to auto-update based on active theme

**✅ Checkpoint:** `useTheme()` returns correct values. Switch between themes in a test screen — all colors update instantly.

---

## FEATURE 2 — LOCALIZATION
*Must be done before any screen text is written.*

- [x] **F2.1** Create `src/i18n/index.ts` — i18next init, language detection, changeLanguage [PRD §4]
- [x] **F2.2** Create `src/i18n/locales/en.json` — all keys from DATA §6
- [x] **F2.3** Create `src/i18n/locales/tr.json` — Turkish translations
- [x] **F2.4** Create stubs for remaining 8 locales (de, fr, es, pt, ru, ar, it, nl) — can be empty with English fallback for now
- [x] **F2.5** Create `src/hooks/useOnboarding.ts` — reads/writes onboarding flags from AsyncStorage
- [x] **F2.6** Integrate i18next into root `_layout.tsx` — init before render
- [x] **F2.7** Set up RTL support for Arabic (I18nManager logic)

**✅ Checkpoint:** `t('app.name')` returns correct string in EN and TR. Switching language updates all text instantly.

---

## FEATURE 3 — BASE UI COMPONENTS
*Build these once, use everywhere. Each must work in all 3 themes.*

- [x] **F3.1** `src/components/layout/ScreenContainer.tsx`
  - SafeAreaView + bg from `theme.bg.primary`
  - StatusBar style auto from theme
  - Optional: keyboard avoiding behavior
- [x] **F3.2** `src/components/layout/ScreenHeader.tsx`
  - Back button (left), title (center), optional right action
  - All colors from theme
- [x] **F3.3** `src/components/ui/Button.tsx` [DESIGN §6]
  - Variants: primary, secondary, ghost, danger, outline
  - Sizes: sm, md, lg
  - States: default, pressed (Reanimated scale), disabled, loading
  - Haptic on press
- [x] **F3.4** `src/components/ui/Card.tsx`
  - Variants: default, elevated, glass
  - Pressable variant with scale animation
- [x] **F3.5** `src/components/ui/Badge.tsx` — small label chips (PRO badge, etc.)
- [x] **F3.6** `src/components/ui/Avatar.tsx` — circle with initials, player color bg
- [x] **F3.7** `src/components/ui/Chip.tsx` — selectable pill (for category/timer selection)
- [x] **F3.8** `src/components/ui/Input.tsx` — themed text input with label
- [x] **F3.9** `src/components/ui/Toggle.tsx` — themed switch (sound/haptics settings)
- [x] **F3.10** `src/components/ui/ProgressBar.tsx` — horizontal progress indicator
- [x] **F3.11** `src/components/ui/Modal.tsx` — themed modal wrapper with backdrop
- [x] **F3.12** `src/components/ui/Divider.tsx` — themed horizontal line

**✅ Checkpoint:** Render all components in a test screen. Switch themes — every color updates. No hardcoded colors anywhere.

---

## FEATURE 4 — ZUSTAND STORES
*State management before screens.*

- [x] **F4.1** Create `src/store/settingsStore.ts` [PRD §9]
  - All fields and actions
  - Persist to AsyncStorage via Zustand persist middleware
- [x] **F4.2** Create `src/store/gameStore.ts` [PRD §9]
  - All fields and actions
  - Does NOT persist (game state is session-only)
- [x] **F4.3** Create `src/store/subscriptionStore.ts` [PRD §9]
  - isPro, loading, error
  - RevenueCat integration (stub OK for now, real later in F11)
- [x] **F4.4** Create custom hooks:
  - `src/hooks/useGame.ts` — convenience selectors for gameStore
  - `src/hooks/useHaptics.ts` — haptic helpers respecting settings
  - `src/hooks/useSound.ts` — audio helpers respecting settings
  - `src/hooks/useSubscription.ts` — isPro check + paywall trigger

**✅ Checkpoint:** settingsStore persists theme and language across app restarts. gameStore resets cleanly.

---

## FEATURE 5 — DATA LAYER
*Word lists and game definitions.*

- [x] **F5.1** Create all category definitions in `src/data/categories.ts` [DATA §2]
- [x] **F5.2** Create all game mode definitions in `src/data/games/index.ts` [DATA §3]
- [x] **F5.3** Create EN word lists (50+ words each, 10 free categories):
  - `src/data/words/en/food.json`
  - `src/data/words/en/animals.json`
  - `src/data/words/en/sports.json`
  - `src/data/words/en/jobs.json`
  - `src/data/words/en/countries.json`
  - `src/data/words/en/movies-tv.json`
  - `src/data/words/en/music.json`
  - `src/data/words/en/objects.json`
  - `src/data/words/en/nature.json`
  - `src/data/words/en/hobbies.json`
- [x] **F5.4** Create TR word lists (50+ words each, culturally adapted, same 10 categories)
- [x] **F5.5** Create `src/logic/wordSelector.ts` [LOGIC §2.3]
- [x] **F5.6** Create `src/logic/playerManager.ts` [LOGIC §2.4]

**✅ Checkpoint:** `wordSelector.pick(['food'], 'en', [])` returns a valid word. `wordSelector.pick(['food'], 'tr', [])` returns a Turkish word.

---

## FEATURE 6 — GAME LOGIC LAYER
*Core logic modules. No UI.*

- [x] **F6.1** Create `src/utils/shuffle.ts` [LOGIC §2.5]
- [x] **F6.2** Create `src/logic/games/imposter.ts` [LOGIC §2.2]
  - assignImposters, getRevealContent, resolveVotes, checkImposterGuess
- [x] **F6.3** Create `src/logic/gameEngine.ts` [LOGIC §2.1]
  - initGame, advanceReveal, resolveVotes, nextRound
- [x] **F6.4** Wire gameEngine into gameStore actions
- [x] **F6.5** Write unit tests for imposterLogic [LOGIC §6]
  - Test imposter assignment, vote resolution, tie handling, guess checking

**✅ Checkpoint:** Unit tests pass. `gameEngine.initGame(validConfig)` returns correct state with imposters assigned.

---

## FEATURE 7 — ONBOARDING FLOW
*First impression. Must be visually stunning.*

- [x] **F7.1** `app/index.tsx` — entry point routing logic
  - Check @onboarding_completed → route to onboarding or home
- [x] **F7.2** `app/onboarding/_layout.tsx` — stack layout, no header, gesture disabled
- [x] **F7.3** `app/onboarding/language.tsx` — language selection screen [PRD §6.1]
  - 2-column grid of 10 languages with flag + native name
  - Selection triggers i18n + wordSelector locale update
  - Disabled Continue until selection made
  - Entrance animation: stagger fade-in
- [x] **F7.4** `app/onboarding/welcome.tsx` — app intro [PRD §6.2]
  - Logo spring entrance animation
  - 3 benefit rows with staggered entrance
  - Animated background matching active theme [DESIGN §7]
- [x] **F7.5** `app/onboarding/how-to-play.tsx` — rules walkthrough [PRD §6.3]
  - 3 animated steps
  - Swipe gesture support
- [x] **F7.6** `app/onboarding/games-showcase.tsx` — game modes preview [PRD §6.4]
  - Horizontal FlatList with peek
  - On complete: write @onboarding_completed, trigger rating flow
- [x] **F7.7** Progress dots component (shared across onboarding screens)

**✅ Checkpoint:** Full onboarding flow navigates correctly. Each screen looks premium in all 3 themes. Language selection persists and updates all text.

---

## FEATURE 8 — RATING & PAYWALL MODALS
*Monetization flow. Critical for revenue.*

- [x] **F8.1** `src/components/modals/RatingModal.tsx` [PRD §7.1]
  - Star row interaction
  - expo-store-review integration
  - Later / No thanks logic with AsyncStorage flags
- [x] **F8.2** `src/components/modals/PaywallModal.tsx` [PRD §7.2]
  - Full-screen modal, bottom-up slide animation
  - Delayed X button: 4-second timer, arc indicator while waiting
  - Plan selector (Monthly / Yearly), yearly default
  - RevenueCat purchase stubs (real integration in F11)
  - Social proof section
  - "Cancel anytime" + restore link
- [x] **F8.3** Onboarding → Rating → Paywall sequence logic
  - 1500ms delay after onboarding
  - 500ms after rating closes → paywall
- [x] **F8.4** `src/components/modals/ThemePickerModal.tsx`
  - 3 theme options with preview swatches
  - Neon locked for non-Pro users

**✅ Checkpoint:** Rating modal appears after onboarding. Paywall appears after rating. X button appears after exactly 4 seconds.

---

## FEATURE 9 — HOME SCREEN
*The hub. Must feel exciting, not like a settings menu.*

- [x] **F9.1** `app/(main)/_layout.tsx` — tab layout (home + settings)
- [x] **F9.2** `app/(main)/home.tsx` [PRD §6.5]
  - Animated theme background [DESIGN §7]
  - Localized app name header
  - Quick resume chip (if last session exists)
  - `src/components/game/GameModeCard.tsx` [DESIGN §6]
  - Game list: 6 free + 6 premium (locked)
  - Premium tap → PaywallModal
- [x] **F9.3** `src/components/game/GameModeCard.tsx`
  - Horizontal layout: emoji + text + chevron
  - Pressed scale animation
  - PRO badge + lock for premium

**✅ Checkpoint:** Home screen looks visually striking in all 3 themes. All 12 games listed. Premium games show lock. Tapping premium triggers paywall.

---

## FEATURE 10 — GAME SETUP SCREEN
*Configuration before the fun starts.*

- [x] **F10.1** `app/(game)/setup.tsx` [PRD §6.6]
  - 4 collapsible sections (Players, Mode, Categories, Advanced)
  - START GAME disabled until valid
- [x] **F10.2** Player management UI
  - Add/remove/reorder players
  - Duplicate name validation
  - Avatar color auto-assignment
  - `src/components/game/PlayerChip.tsx`
- [x] **F10.3** Category selection grid
  - `src/components/game/CategoryCard.tsx` [DESIGN §6]
  - Multi-select, "All" chip, premium locked
- [x] **F10.4** Game mode carousel (for imposter variants)
  - `src/components/game/GameModeCard.tsx` (reused)
- [x] **F10.5** Advanced settings (imposters, timer, sound, haptics)
- [x] **F10.6** Persist last-used settings to AsyncStorage (settingsStore.lastPlayerNames + lastCategories)

**✅ Checkpoint:** Can add 3+ players, select category, start game. Validation prevents <3 players. Last settings restored on revisit.

---

## FEATURE 11 — WORD REVEAL SCREEN
*The emotional peak. Most important screen in the app.*

- [ ] **F11.1** `app/game/reveal/[index].tsx` [PRD §6.7]
  - Route params: current player index
  - Pre-reveal state: blurred card face
- [ ] **F11.2** Hold-to-reveal interaction
  - LongPressGestureHandler (500ms threshold)
  - Progress arc fills during hold
  - Early release: arc resets with spring
- [ ] **F11.3** 3D card flip animation [DESIGN §5]
  - Reanimated rotateY interpolation
  - Front face → Back face at 90°
  - 400ms, ease-in-out
- [ ] **F11.4** `src/components/game/WordRevealCard.tsx` [DESIGN §6]
  - Crew face: word in display-xl font, crew bg + tertiary glow
  - Imposter face: "YOU ARE THE IMPOSTER!" in accent.secondary, danger glow + pulse
  - Auto-blur timer: 5 seconds
- [ ] **F11.5** NEXT PLAYER button — identical position in both states
- [ ] **F11.6** Haptics per reveal type [DESIGN §9]
- [ ] **F11.7** Advance to next player or to play screen when all revealed

**✅ Checkpoint:** Hold to reveal works. Card flips with 3D animation. Crew and imposter states look completely different but NEXT button is identical. Auto-blur works.

---

## FEATURE 12 — ACTIVE GAME & VOTING SCREENS
*Discussion and voting phases.*

- [ ] **F12.1** `app/game/play.tsx` [PRD §6.8]
  - Player checklist (clue given or not)
  - Optional timer: `src/components/game/TimerRing.tsx`
  - START VOTING button
- [ ] **F12.2** `src/components/game/TimerRing.tsx` [DESIGN §6]
  - SVG circle progress
  - Color interpolation: warm → danger
  - Pulse animation in danger zone
- [ ] **F12.3** `app/game/vote.tsx` [PRD §6.9]
  - Player grid: `src/components/game/VoteCard.tsx`
  - One vote per player, can't vote for self
  - REVEAL VOTES enabled only when all voted
  - Simultaneous reveal animation
- [ ] **F12.4** `src/components/game/VoteCard.tsx` [DESIGN §6]
  - Avatar + name, selected state with accent border

**✅ Checkpoint:** Full game flow from reveal → play → vote → reveal votes works end-to-end.

---

## FEATURE 13 — RESULT SCREEN
*The payoff moment.*

- [ ] **F13.1** `app/game/result.tsx` [PRD §6.10]
  - Both states: caught vs escaped
  - Particle burst / confetti for crew win
  - Dramatic dark reveal for imposter win
- [ ] **F13.2** Imposter guess prompt flow
  - "Can [name] guess the word?" → Yes/No
  - Handle both outcomes
- [ ] **F13.3** `src/components/game/ResultBanner.tsx`
  - Animated headline entrance
  - Score/result card
- [ ] **F13.4** Bottom actions: Play Again, New Game, Share
- [ ] **F13.5** Increment gamesCompleted in settingsStore
- [ ] **F13.6** Trigger rating modal on 3rd game (if not already rated)

**✅ Checkpoint:** All result states display correctly. Play Again resets with same config. gamesCompleted increments correctly.

---

## FEATURE 14 — SETTINGS SCREEN
*Clean, functional.*

- [ ] **F14.1** `app/(main)/settings.tsx`
  - Theme picker (opens ThemePickerModal)
  - Language picker (opens language selection)
  - Sound toggle
  - Haptics toggle
  - Upgrade to PRO button (if not pro)
  - Restore Purchases
  - Rate the App
  - Privacy Policy + Terms (open URL)
  - App version display
- [ ] **F14.2** All settings persist via settingsStore (Zustand + AsyncStorage)

**✅ Checkpoint:** All settings work. Theme change is instant. Language change updates all screen text immediately.

---

## FEATURE 15 — ADDITIONAL FREE PARTY GAMES
*Truth or Dare, Never Have I Ever, Most Likely To, Hot Takes, Would You Rather.*

- [ ] **F15.1** Create logic modules for each free game [LOGIC §3]
  - `src/logic/games/truthOrDare.ts`
  - `src/logic/games/neverHaveIEver.ts`
  - `src/logic/games/mostLikelyTo.ts`
  - `src/logic/games/hotTakes.ts`
  - `src/logic/games/wouldYouRather.ts`
- [ ] **F15.2** Create prompt JSON files (EN + TR minimum) [DATA §4]
  - `src/data/prompts/truth-dare/en.json` (200+ prompts)
  - `src/data/prompts/truth-dare/tr.json`
  - (and so on for each game)
- [ ] **F15.3** Create shared game screen component that can render any "prompt-based" game
  - Current prompt display
  - Player tracker
  - Intensity filter
  - Next prompt button
- [ ] **F15.4** Wire each game through setup → shared game screen → result

**✅ Checkpoint:** All 6 free games playable end-to-end with localized prompts.

---

## FEATURE 16 — PREMIUM PARTY GAMES
*Two Truths, Heads Up, Word Chain, Trivia Bet, Charades, Paranoia.*

- [ ] **F16.1** Create logic for each premium game [LOGIC §3]
- [ ] **F16.2** Create prompt/word data for each
- [ ] **F16.3** Heads Up — phone tilt/hold interaction
- [ ] **F16.4** Word Chain — timed per-player input with letter validation
- [ ] **F16.5** Trivia Bet — betting interface + answer reveal
- [ ] **F16.6** All premium games gate through subscriptionStore.isPro check

**✅ Checkpoint:** All 6 premium games work for Pro users. Free users see PaywallModal.

---

## FEATURE 17 — REVENUCAT INTEGRATION
*Real subscription purchases.*

- [ ] **F17.1** Configure RevenueCat dashboard (products, entitlements)
- [ ] **F17.2** Wire `subscriptionStore` to real RevenueCat SDK
  - `checkStatus()`, `purchaseMonthly()`, `purchaseYearly()`, `restore()`
- [ ] **F17.3** Test purchase flow on iOS + Android sandbox
- [ ] **F17.4** Handle edge cases: purchase failed, already subscribed, trial ended
- [ ] **F17.5** Gate all premium features behind `isPro` check

**✅ Checkpoint:** Full purchase flow works in sandbox. Pro content unlocks. Restore works.

---

## FEATURE 18 — REMAINING LANGUAGES
*Localize for all 10 languages.*

- [ ] **F18.1** Complete UI translations for all 10 locales (de, fr, es, pt, ru, ar, it, nl)
- [ ] **F18.2** Create word lists for DE, FR, ES, PT (priority — largest user bases)
- [ ] **F18.3** Create word lists for RU, IT, NL
- [ ] **F18.4** Create word lists for AR (right-to-left, cultural adaptation)
- [ ] **F18.5** Test RTL layout with Arabic
- [ ] **F18.6** Create prompt translations for all games (EN → all locales)

**✅ Checkpoint:** App fully functional in all 10 languages. Arabic RTL renders correctly.

---

## FEATURE 19 — POLISH & ANIMATIONS
*The difference between good and great.*

- [ ] **F19.1** Animated backgrounds for home + onboarding [DESIGN §7]
  - Dark: drifting gradient mesh blobs
  - Light: geometric grid overlay
  - Neon: scanline texture with occasional flicker
- [ ] **F19.2** Screen transition animations (Expo Router shared element or custom)
- [ ] **F19.3** Onboarding step stagger animations [DESIGN §5]
- [ ] **F19.4** Result screen particle/confetti system
- [ ] **F19.5** Imposter reveal pulse glow explosion
- [ ] **F19.6** All sounds integrated and tested [DESIGN §9]
- [ ] **F19.7** Reduced motion mode — disable all animations if system setting on

**✅ Checkpoint:** App feels alive and premium. Every major moment has appropriate animation + haptic + sound.

---

## FEATURE 20 — APP STORE LAUNCH PREP
*Ship it.*

- [ ] **F20.1** App icons (all sizes, iOS + Android)
- [ ] **F20.2** Splash screens (Expo splash)
- [ ] **F20.3** App Store screenshots (6.7", 5.5", iPad) — designed to convert
- [ ] **F20.4** Google Play screenshots + feature graphic
- [ ] **F20.5** App Store metadata (title, subtitle, description, keywords) per locale
- [ ] **F20.6** Privacy policy URL live
- [ ] **F20.7** EAS Production build — iOS + Android
- [ ] **F20.8** TestFlight / Internal Testing distribution
- [ ] **F20.9** Final QA: all 12 games, all 3 themes, EN + TR
- [ ] **F20.10** Submit to App Store + Google Play

---

## QUICK REFERENCE — TASK PROGRESS

```
F0  Foundation          [x] 9 tasks
F1  Theme System        [x] 9 tasks
F2  Localization        [x] 7 tasks
F3  Base UI Components  [x] 12 tasks
F4  Zustand Stores      [x] 4 tasks
F5  Data Layer          [x] 6 tasks
F6  Game Logic          [x] 5 tasks
F7  Onboarding          [x] 7 tasks
F8  Rating & Paywall    [x] 4 tasks
F9  Home Screen         [x] 3 tasks
F10 Game Setup          [x] 6 tasks
F11 Word Reveal         [ ] 7 tasks
F12 Play & Vote         [ ] 4 tasks
F13 Result Screen       [ ] 6 tasks
F14 Settings            [ ] 2 tasks
F15 Free Party Games    [ ] 4 tasks
F16 Premium Games       [ ] 6 tasks
F17 RevenueCat          [ ] 5 tasks
F18 All Languages       [ ] 6 tasks
F19 Polish              [ ] 7 tasks
F20 Launch Prep         [ ] 10 tasks

TOTAL: 139 tasks across 20 features
```
