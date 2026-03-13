import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useTheme } from '@/theme'
import { useSettingsStore } from '@/store/settingsStore'

// ─────────────────────────────────────────────────────────────────────────────
// ROOT REDIRECT
// Waits for Zustand to rehydrate from AsyncStorage, then sends the user
// to onboarding (first launch) or home (returning user).
// ─────────────────────────────────────────────────────────────────────────────

export default function Index() {
  const { theme } = useTheme()
  const hasHydrated = useSettingsStore((s) => s._hasHydrated)
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted)

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent.primary} />
      </View>
    )
  }

  return <Redirect href={onboardingCompleted ? '/(main)/home' : '/onboarding/language'} />
}
