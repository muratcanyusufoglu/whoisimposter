import { useState } from 'react'
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { useSettingsStore } from '@/store/settingsStore'
import {
  requestNotificationPermission,
  scheduleDiscountNotification,
} from '@/utils/notifications'

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS SCREEN — Step 6 of 6 (Final onboarding step)
// Smooth permission request with two choices:
//   • Primary CTA: "Turn on Notifications" → request OS permission → schedule discount
//   • Ghost CTA: "Maybe later" → skip, complete onboarding
// ─────────────────────────────────────────────────────────────────────────────

const STAGGER_SPRING = { damping: 20, stiffness: 200 }
const BELL_SPRING = { damping: 8, stiffness: 120 }

export default function NotificationsScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding)
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled)
  const setDiscountNotificationId = useSettingsStore((s) => s.setDiscountNotificationId)
  const [loading, setLoading] = useState(false)

  // ── Entrance animations ────────────────────────────────────────────────────
  const bellScale = useSharedValue(0)
  const bellRotate = useSharedValue(0)
  const op0 = useSharedValue(0); const ty0 = useSharedValue(20)
  const op1 = useSharedValue(0); const ty1 = useSharedValue(20)
  const op2 = useSharedValue(0); const ty2 = useSharedValue(20)
  const op3 = useSharedValue(0); const ty3 = useSharedValue(20)
  const op4 = useSharedValue(0); const ty4 = useSharedValue(20)

  useState(() => {
    // Bell springs in, then gently rocks
    bellScale.value = withSpring(1, BELL_SPRING)
    bellRotate.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.12, { duration: 120 }),
          withTiming(-0.12, { duration: 120 }),
          withTiming(0.08, { duration: 100 }),
          withTiming(-0.08, { duration: 100 }),
          withTiming(0, { duration: 150 }),
        ),
        -1,    // infinite
        false, // don't reverse
      ),
    )
    // Text elements staggered
    op0.value = withDelay(200, withSpring(1, STAGGER_SPRING))
    ty0.value = withDelay(200, withSpring(0, STAGGER_SPRING))
    op1.value = withDelay(330, withSpring(1, STAGGER_SPRING))
    ty1.value = withDelay(330, withSpring(0, STAGGER_SPRING))
    op2.value = withDelay(450, withSpring(1, STAGGER_SPRING))
    ty2.value = withDelay(450, withSpring(0, STAGGER_SPRING))
    // CTAs
    op3.value = withDelay(580, withTiming(1, { duration: 350 }))
    ty3.value = withDelay(580, withSpring(0, STAGGER_SPRING))
    op4.value = withDelay(680, withTiming(1, { duration: 300 }))
    ty4.value = withDelay(680, withSpring(0, STAGGER_SPRING))
  })

  const bellStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bellScale.value },
      { rotate: `${bellRotate.value}rad` },
    ],
  }))
  const style0 = useAnimatedStyle(() => ({ opacity: op0.value, transform: [{ translateY: ty0.value }] }))
  const style1 = useAnimatedStyle(() => ({ opacity: op1.value, transform: [{ translateY: ty1.value }] }))
  const style2 = useAnimatedStyle(() => ({ opacity: op2.value, transform: [{ translateY: ty2.value }] }))
  const style3 = useAnimatedStyle(() => ({ opacity: op3.value, transform: [{ translateY: ty3.value }] }))
  const style4 = useAnimatedStyle(() => ({ opacity: op4.value, transform: [{ translateY: ty4.value }] }))

  // ── Helpers ────────────────────────────────────────────────────────────────

  const finishOnboarding = () => {
    completeOnboarding()
    router.replace('/(main)/home')
  }

  const handleEnable = async () => {
    haptics.medium()
    setLoading(true)

    const granted = await requestNotificationPermission()

    if (granted) {
      setNotificationsEnabled(true)
      // Schedule a one-time discount notification 3 days from now
      const notifId = await scheduleDiscountNotification(3, {
        title: t('onboarding.notifications.discount_title'),
        body: t('onboarding.notifications.discount_body'),
      })
      if (notifId) {
        setDiscountNotificationId(notifId)
      }
      haptics.success()
    } else {
      haptics.warning()
    }

    setLoading(false)
    finishOnboarding()
  }

  const handleSkip = () => {
    haptics.light()
    finishOnboarding()
  }

  const iconColor = theme.accent.primary

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* Animated bell */}
      <View style={styles.bellSection}>
        <Animated.View style={bellStyle}>
          <View
            style={[
              styles.bellCircle,
              {
                backgroundColor: theme.accent.primary + '18',
                borderColor: theme.accent.primary + '40',
              },
            ]}
          >
            <Ionicons name="notifications" size={56} color={theme.accent.primary} />
          </View>
        </Animated.View>
      </View>

      {/* Headline + subtitle */}
      <Animated.View style={[styles.headlineWrap, style0]}>
        <Text
          style={[styles.headline, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}
        >
          {t('onboarding.notifications.title')}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.subtitleWrap, style1]}>
        <Text
          style={[styles.subtitle, { color: theme.text.secondary, fontFamily: fontFamily.body }]}
        >
          {t('onboarding.notifications.subtitle')}
        </Text>
      </Animated.View>

      {/* Benefit pills */}
      <View style={styles.benefits}>
        <Animated.View style={style2}>
          <BenefitPill
            icon={<Ionicons name="pricetag" size={16} color={iconColor} />}
            label={t('onboarding.notifications.benefit1')}
            theme={theme}
          />
          <View style={{ height: spacing.sm }} />
          <BenefitPill
            icon={<Ionicons name="game-controller" size={16} color={iconColor} />}
            label={t('onboarding.notifications.benefit2')}
            theme={theme}
          />
        </Animated.View>
      </View>

      {/* CTA buttons */}
      <View style={styles.footer}>
        <ProgressDots total={6} current={5} />

        <Animated.View style={[styles.ctaWrap, style3]}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleEnable}
            disabled={loading}
            accessibilityLabel={t('onboarding.notifications.enable')}
          >
            {t('onboarding.notifications.enable')}
          </Button>
        </Animated.View>

        <Animated.View style={style4}>
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.notifications.skip')}
          >
            <Text
              style={[
                styles.skipText,
                { color: theme.text.muted, fontFamily: fontFamily.body },
              ]}
            >
              {t('onboarding.notifications.skip')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFIT PILL
// ─────────────────────────────────────────────────────────────────────────────

import { AppTheme } from '@/theme/types'

function BenefitPill({
  icon,
  label,
  theme,
}: {
  icon: React.ReactNode
  label: string
  theme: AppTheme
}) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
      ]}
    >
      <View style={[styles.pillIcon, { backgroundColor: theme.bg.elevated }]}>{icon}</View>
      <Text
        style={[styles.pillLabel, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}
      >
        {label}
      </Text>
    </View>
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
  bellSection: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  bellCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineWrap: {
    marginBottom: spacing.xs,
  },
  headline: {
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: fontSize['3xl'] * 1.15,
  },
  subtitleWrap: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  benefits: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillLabel: {
    fontSize: fontSize.md,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
  },
  ctaWrap: {
    width: '100%',
  },
  skipText: {
    fontSize: fontSize.md,
    textDecorationLine: 'underline',
  },
})
