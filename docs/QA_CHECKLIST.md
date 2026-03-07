# QA Checklist — Who's the Imposter?

Run this checklist on a real device before submitting to App Store + Google Play.

---

## 🔧 Build Setup
- [ ] RevenueCat API keys replaced in `src/config/revenueCat.ts` (iOS + Android)
- [ ] `eas.json` submit section updated with real Apple ID, ASC App ID, Team ID
- [ ] Production build tested on physical device (not simulator)

---

## 🎮 Game Flow — All 12 Games

### Free Games
- [ ] **Imposter** — Full flow: Setup → Reveal → Play → Vote → Result
  - [ ] Word reveal hold interaction works
  - [ ] Imposter card shows "???" not the word
  - [ ] Imposter glow pulse fires on reveal
  - [ ] Vote resolves correctly, tie breaks to imposter escape
  - [ ] "Play Again" resets and returns to reveal screen
- [ ] **Truth or Dare** — Prompts load, intensity filter works, Skip works
- [ ] **Never Have I Ever** — Prompts load, all intensities present
- [ ] **Most Likely To** — Prompts load correctly
- [ ] **Hot Takes** — Prompts load, card flip animation smooth
- [ ] **Would You Rather** — Both options display, prompts cycle

### Premium Games (requires Pro subscription)
- [ ] **Two Truths & a Lie** — Locked for free users, unlocks for Pro
- [ ] **Heads Up!** — Tilt detection works, timer counts down
- [ ] **Word Chain** — Letter validation works, timer per player
- [ ] **Trivia Bet** — Betting UI works, answer reveal correct
- [ ] **Charades** — Card flip + skip works
- [ ] **Paranoia** — Whisper prompt + reveal flow

---

## 💎 Subscription Flow
- [ ] PaywallModal opens for premium games (free users)
- [ ] PaywallModal opens automatically after onboarding (first launch)
- [ ] X button appears after exactly 4 seconds
- [ ] Monthly / Yearly plan selector defaults to Yearly
- [ ] Purchase flow triggers RevenueCat (sandbox)
- [ ] Restore Purchases works for existing subscribers
- [ ] `isPro` gates unlock after successful purchase

---

## 🎨 Themes (test each screen in all 3 themes)
- [ ] **Dark theme** — home, setup, reveal, play, vote, result, settings, onboarding
- [ ] **Light theme** — all screens above
- [ ] **Neon theme** — all screens above (Pro only — verify gate)
- [ ] Theme picker modal opens from Settings
- [ ] Theme persists across app restarts

---

## 🌍 Localization
- [ ] **English** — all screens render correctly
- [ ] **Turkish** — all screens render correctly
- [ ] Language selector on onboarding works
- [ ] Language setting in Settings persists
- [ ] Word lists load in selected language
- [ ] Arabic RTL: layout flips correctly (test on device)

---

## 🔔 Modals & Ratings
- [ ] Rating modal appears 1.5s after first onboarding completion (first launch only)
- [ ] Rating modal: 4-star → opens App Store review, 1-3 star → dismisses
- [ ] Paywall appears 500ms after rating closes (first launch)
- [ ] Rating doesn't re-appear after dismissal

---

## 📱 Platform-Specific
### iOS
- [ ] Safe area insets correct on iPhone 16 Pro (Dynamic Island)
- [ ] Safe area correct on iPhone SE (small screen)
- [ ] Status bar style correct per theme
- [ ] App icon displays correctly (no white corners)
- [ ] Splash screen shows #0D0D0F background
- [ ] No crash on app backgrounding/foregrounding during game

### Android
- [ ] Back gesture works correctly (predictive back disabled)
- [ ] Keyboard resize mode works in player name input
- [ ] Adaptive icon displays on Android 13+
- [ ] Monochrome icon works on themed launchers
- [ ] No ANR (Application Not Responding) during game

---

## ♿ Accessibility
- [ ] All buttons have `accessibilityLabel`
- [ ] Reduced motion mode disables animations (test in system settings)
- [ ] Font size scaling doesn't break layout (test at 150% font size)

---

## 🔇 Haptics & Sound
- [ ] Haptics fire on: imposter reveal (heavy), crew reveal (medium), button press (light/selection)
- [ ] Haptics toggle in settings disables all haptics
- [ ] Sound toggle in settings disables all sounds (if sound files present)

---

## 📦 Store Assets
- [ ] App icon on store listing matches in-app icon
- [ ] Screenshots uploaded for all required sizes (6.7", 5.5")
- [ ] App Store description matches app capabilities
- [ ] Privacy policy URL is live: https://whosimposter.party/privacy
- [ ] Age rating: 4+ (no violent content, no in-app purchases of gambling type)

---

## ✅ Final Sign-off
- [ ] Version 1.0.0 / Build 1 confirmed in Settings screen
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors in production build
- [ ] EAS production build succeeds for both platforms
- [ ] Internal TestFlight tested by at least 2 people
