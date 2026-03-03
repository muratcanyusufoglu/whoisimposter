import { View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono'

import { ThemeProvider, useTheme } from '@/theme'
import { initI18n } from '@/i18n'

// Initialize i18next synchronously before any render.
// Language rehydration is handled by settingsStore.onRehydrateStorage.
initI18n()

// ─────────────────────────────────────────────────────────────────────────────
// INNER LAYOUT — reads theme from context (provided by ThemeProvider above)
// ─────────────────────────────────────────────────────────────────────────────

function RootLayoutInner() {
  const { themeId } = useTheme()

  // StatusBar: dark/neon → light icons, light → dark icons
  const statusBarStyle = themeId === 'light' ? 'dark' : 'light'

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="game" />
      </Stack>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT — loads fonts, provides theme, blocks render until fonts ready
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    JetBrainsMono_700Bold,
  })

  // Hold splash until fonts are loaded (fontError = show with system fallback)
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: '#0D0D0F' }} />
  }

  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  )
}
