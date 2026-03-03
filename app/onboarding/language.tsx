import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { LOCALE_META, SUPPORTED_LOCALES, SupportedLocale } from '@/i18n'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE SCREEN — Step 1 of 4
// 2-column grid of 10 language options. Selection enables Continue.
// ─────────────────────────────────────────────────────────────────────────────

export default function LanguageScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  const [selected, setSelected] = useState<SupportedLocale | null>(null)

  // ── Logo entrance ──────────────────────────────────────────────────────────
  const logoOpacity = useSharedValue(0)
  const logoTY = useSharedValue(-16)
  const gridOpacity = useSharedValue(0)
  const gridTY = useSharedValue(20)
  const btnOpacity = useSharedValue(0)

  // Trigger entrance on mount
  useState(() => {
    const SPRING = { damping: 20, stiffness: 200 }
    logoOpacity.value = withSpring(1, SPRING)
    logoTY.value = withSpring(0, SPRING)
    gridOpacity.value = withDelay(160, withTiming(1, { duration: 400 }))
    gridTY.value = withDelay(160, withSpring(0, SPRING))
    btnOpacity.value = withDelay(500, withTiming(1, { duration: 300 }))
  })

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTY.value }],
  }))
  const gridStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
    transform: [{ translateY: gridTY.value }],
  }))
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }))

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelect = (code: SupportedLocale) => {
    haptics.selection()
    setSelected(code)
    // Immediately update language so CTA text and UI respond
    setLanguage(code)
  }

  const handleContinue = () => {
    if (!selected) return
    haptics.medium()
    router.push('/onboarding/welcome')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* Logo */}
      <Animated.View style={[styles.logoSection, logoStyle]}>
        <Text style={styles.logoEmoji}>🕵️</Text>
        <Text
          style={[
            styles.appName,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
        >
          {t('app.name')}
        </Text>
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleWrap, gridStyle]}>
        <Text
          style={[
            styles.title,
            { color: theme.text.secondary, fontFamily: fontFamily.bodyMedium },
          ]}
        >
          {t('onboarding.language.title')}
        </Text>
      </Animated.View>

      {/* Language grid */}
      <Animated.View style={[styles.gridWrap, gridStyle]}>
        <FlatList
          data={SUPPORTED_LOCALES as readonly SupportedLocale[]}
          keyExtractor={(item) => item}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item: code }) => {
            const meta = LOCALE_META[code]
            const isSelected = selected === code
            return (
              <TouchableOpacity
                style={[
                  styles.langItem,
                  {
                    backgroundColor: isSelected
                      ? theme.bg.elevated
                      : theme.bg.surface,
                    borderColor: isSelected
                      ? theme.accent.primary
                      : theme.border.default,
                    shadowColor: isSelected ? theme.glow.primary : 'transparent',
                  },
                ]}
                onPress={() => handleSelect(code)}
                accessibilityLabel={meta.nativeName}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{meta.flag}</Text>
                <Text
                  style={[
                    styles.langName,
                    {
                      color: isSelected ? theme.accent.primary : theme.text.primary,
                      fontFamily: isSelected
                        ? fontFamily.bodyBold
                        : fontFamily.bodyMedium,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {meta.nativeName}
                </Text>
              </TouchableOpacity>
            )
          }}
        />
      </Animated.View>

      {/* Continue CTA */}
      <Animated.View style={[styles.ctaWrap, btnStyle]}>
        <Button
          variant="primary"
          size="lg"
          disabled={!selected}
          onPress={handleContinue}
          accessibilityLabel={t('onboarding.language.continue')}
        >
          {t('onboarding.language.continue')}
        </Button>
      </Animated.View>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  logoEmoji: {
    fontSize: 56,
  },
  appName: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  gridWrap: {
    flex: 1,
  },
  gridContent: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  langItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
  },
  flag: {
    fontSize: 22,
  },
  langName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  ctaWrap: {
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
  },
})
