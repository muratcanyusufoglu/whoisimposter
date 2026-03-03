import { Stack } from 'expo-router'

// ─────────────────────────────────────────────────────────────────────────────
// (game) ROUTE GROUP LAYOUT — Setup → Reveal → Play → Vote → Result
// No native header; each screen builds its own.
// ─────────────────────────────────────────────────────────────────────────────

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // prevent swipe-back mid-game
      }}
    />
  )
}
