import { Stack } from 'expo-router'

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding Stack Layout
// No header. Language screen locks back gesture (first screen).
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      {/* Language is the true first screen — no going back */}
      <Stack.Screen name="language" options={{ gestureEnabled: false }} />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="how-to-play" />
      <Stack.Screen name="games-showcase" />
      <Stack.Screen name="personalize" />
      <Stack.Screen name="notifications" />
    </Stack>
  )
}
