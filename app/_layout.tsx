import { useEffect } from 'react'
import { View, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
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
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

import { ThemeProvider, useTheme } from '@/theme'
import { initI18n } from '@/i18n'
import { REVENUECAT_API_KEY } from '@/config/revenueCat'
import { useSubscriptionStore } from '@/store/subscriptionStore'

// Initialize i18next synchronously before any render.
// Language rehydration is handled by settingsStore.onRehydrateStorage.
initI18n()

// ─────────────────────────────────────────────────────────────────────────────
// INNER LAYOUT — reads theme from context (provided by ThemeProvider above)
// ─────────────────────────────────────────────────────────────────────────────

function RootLayoutInner() {
  const { themeId } = useTheme()
  const checkStatus  = useSubscriptionStore((s) => s.checkStatus)
  const fetchPrices  = useSubscriptionStore((s) => s.fetchPrices)

  // ── F17.2: RevenueCat SDK init ─────────────────────────────────────────────
  useEffect(() => {
    // Only configure on real platforms (not web)
    if (Platform.OS === 'web') return

    // Skip if placeholder key — avoids crash in Expo Go / CI
    const isPlaceholder =
      REVENUECAT_API_KEY.includes('REPLACE_WITH')
    if (isPlaceholder) return

    // Keep isPro in sync with RC server events:
    // subscription renewals, expiries, server-side revocations,
    // and purchases made on another device.
    const onCustomerInfoUpdate = () => checkStatus()

    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG)
      }
      Purchases.configure({ apiKey: REVENUECAT_API_KEY })
      checkStatus()
      fetchPrices()
      Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate)
    } catch (e) {
      // Expo Go doesn't support native store — continue gracefully
      if (__DEV__) console.warn('RevenueCat init skipped:', e)
    }

    return () => {
      Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdate)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // StatusBar: dark/neon → light icons, light → dark icons
  const statusBarStyle = themeId === 'light' ? 'dark' : 'light'

  return (
    <>
      <StatusBar style={statusBarStyle} />
      {/* F19.2: Screen transition animations */}
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(game)" options={{ animation: 'slide_from_right' }} />
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
