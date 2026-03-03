# Project: Who's the Imposter?
A premium offline-first social deduction party game. Expo React Native, iOS + Android.

## Critical Rules — Never Break
1. Zero hardcoded colors — ALL colors via useTheme() from src/theme/
2. Zero raw strings — ALL user-facing text via t('key') from i18n
3. Reanimated v3 ONLY — never React Native's built-in Animated API
4. Game logic in src/logic/ ONLY — never inside components or screens
5. Zustand for shared/game state — useState only for local UI state
6. TypeScript strict mode — no `any` types ever

## Documentation
- docs/PRD.md — screens, flows, stores, platform specs
- docs/DESIGN_SYSTEM.md — themes, colors, animations, component specs
- docs/TASK_LIST.md — feature checklist, current progress
- docs/GAME_LOGIC.md — read when working on F5, F6, or any logic task
- docs/DATA_SCHEMA.md — read when working on F5, F18, or data/i18n tasks

## How to Work
- Check TASK_LIST.md first — find the next incomplete feature
- Read only the docs relevant to that feature
- Complete the feature's checkpoint before moving on
- Mark tasks ✅ in TASK_LIST.md as you finish them