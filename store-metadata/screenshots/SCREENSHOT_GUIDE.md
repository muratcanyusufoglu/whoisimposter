# Screenshot Guide

## Required Sizes

### iOS (App Store Connect)
| Device        | Resolution    | Required |
|---------------|---------------|----------|
| 6.7" (iPhone 16 Pro Max) | 1320×2868 | ✅ Required |
| 5.5" (iPhone 8 Plus)     | 1242×2208 | ✅ Required |
| 12.9" iPad Pro           | 2048×2732 | Optional  |

### Android (Google Play)
| Device        | Resolution    | Required |
|---------------|---------------|----------|
| Phone         | min 320px side, max 3840px | ✅ Required |
| 7" Tablet     | min 320px side            | Optional  |
| 10" Tablet    | min 320px side            | Optional  |
| Feature Graphic | 1024×500                | ✅ Required |

## Recommended Screenshots (5–10 per device)

1. **Home Screen** — Dark theme, all 12 game modes visible
2. **Word Reveal** — Dramatic hold-to-reveal moment
3. **Imposter Card** — "YOU ARE THE IMPOSTER!" card revealed
4. **Vote Screen** — Active voting round with player grid
5. **Result Screen** — "CAUGHT!" celebration with confetti
6. **Theme Showcase** — Neon theme glowing game card
7. **10 Languages** — Language selection grid
8. **Paywall / Pro** — Premium games locked with lock icon

## How to Capture
1. Run `eas build --profile development --platform ios`
2. Launch in iPhone 16 Pro Max simulator (6.7")
3. Navigate to each screen and take screenshot: Cmd+S in Simulator
4. Export: Device > Export Screenshot
5. Repeat for 5.5" (iPhone 8 Plus) simulator

## Tools
- Simulator screenshots: Xcode Simulator → File → New Screenshot
- Frame mockups: screenshotframe.com, AppMockUp, or custom Figma frame
- Feature graphic: Figma template recommended (1024×500px)
