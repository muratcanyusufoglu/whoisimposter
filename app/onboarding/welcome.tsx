import { View, Text, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { Gamepad2, WifiOff, Users } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME SCREEN — Step 2 of 4
// Logo spring entrance + 3 benefit rows with stagger.
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { damping: 14, stiffness: 180 }
const STAGGER_SPRING = { damping: 20, stiffness: 200 }

export default function WelcomeScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // ── Shared values ──────────────────────────────────────────────────────────
  // Logo: spring scale from 0
  const logoScale = useSharedValue(0)
  // Each item: spring opacity+translateY from 0/20
  const op0 = useSharedValue(0)
  const op1 = useSharedValue(0)
  const op2 = useSharedValue(0)
  const op3 = useSharedValue(0)
  const op4 = useSharedValue(0)
  const ty0 = useSharedValue(20)
  const ty1 = useSharedValue(20)
  const ty2 = useSharedValue(20)
  const ty3 = useSharedValue(20)
  const ty4 = useSharedValue(20)

  // Trigger on mount via useState (runs once synchronously on first render)
  useState(() => {
    // Logo scales in first
    logoScale.value = withSpring(1, SPRING)
    // Headline
    op0.value = withDelay(200, withSpring(1, STAGGER_SPRING))
    ty0.value = withDelay(200, withSpring(0, STAGGER_SPRING))
    // Benefit 1
    op1.value = withDelay(320, withSpring(1, STAGGER_SPRING))
    ty1.value = withDelay(320, withSpring(0, STAGGER_SPRING))
    // Benefit 2
    op2.value = withDelay(420, withSpring(1, STAGGER_SPRING))
    ty2.value = withDelay(420, withSpring(0, STAGGER_SPRING))
    // Benefit 3
    op3.value = withDelay(520, withSpring(1, STAGGER_SPRING))
    ty3.value = withDelay(520, withSpring(0, STAGGER_SPRING))
    // CTA
    op4.value = withDelay(650, withTiming(1, { duration: 350 }))
    ty4.value = withDelay(650, withSpring(0, STAGGER_SPRING))
  })

  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }))
  const style0 = useAnimatedStyle(() => ({
    opacity: op0.value,
    transform: [{ translateY: ty0.value }],
  }))
  const style1 = useAnimatedStyle(() => ({
    opacity: op1.value,
    transform: [{ translateY: ty1.value }],
  }))
  const style2 = useAnimatedStyle(() => ({
    opacity: op2.value,
    transform: [{ translateY: ty2.value }],
  }))
  const style3 = useAnimatedStyle(() => ({
    opacity: op3.value,
    transform: [{ translateY: ty3.value }],
  }))
  const style4 = useAnimatedStyle(() => ({
    opacity: op4.value,
    transform: [{ translateY: ty4.value }],
  }))

  const handleContinue = () => {
    haptics.medium()
    router.push('/onboarding/how-to-play')
  }

  const iconColor = theme.accent.primary

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* F19.1 Animated background */}
      <AnimatedBackground />

      {/* Logo */}
      <Animated.View style={[styles.logoSection, logoStyle]}>
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.bg.elevated, borderColor: theme.border.default },
          ]}
        >
          <Text style={styles.logoEmoji}>🕵️</Text>
        </View>
      </Animated.View>

      {/* Headline */}
      <Animated.View style={[styles.headlineWrap, style0]}>
        <Text
          style={[
            styles.headline,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
        >
          {t('onboarding.welcome.headline')}
        </Text>
      </Animated.View>

      {/* Benefits */}
      <View style={styles.benefits}>
        <Animated.View style={style1}>
          <BenefitRow
            icon={<Gamepad2 size={24} color={iconColor} />}
            label={t('onboarding.welcome.benefit1')}
            theme={theme}
          />
        </Animated.View>

        <Animated.View style={style2}>
          <BenefitRow
            icon={<WifiOff size={24} color={iconColor} />}
            label={t('onboarding.welcome.benefit2')}
            theme={theme}
          />
        </Animated.View>

        <Animated.View style={style3}>
          <BenefitRow
            icon={<Users size={24} color={iconColor} />}
            label={t('onboarding.welcome.benefit3')}
            theme={theme}
          />
        </Animated.View>
      </View>

      {/* Spacer + Dots + CTA */}
      <View style={styles.footer}>
        <ProgressDots total={4} current={1} />
        <Animated.View style={[styles.ctaWrap, style4]}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinue}
            accessibilityLabel={t('onboarding.welcome.continue')}
          >
            {t('onboarding.welcome.continue')}
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFIT ROW
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { AppTheme } from '@/theme/types'

function BenefitRow({
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
        styles.benefitRow,
        {
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.subtle,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.bg.elevated },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.benefitLabel,
          { color: theme.text.primary, fontFamily: fontFamily.bodyMedium },
        ]}
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
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 52,
  },
  headlineWrap: {
    marginBottom: spacing.xl,
  },
  headline: {
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: fontSize['3xl'] * 1.15,
  },
  benefits: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
  },
  ctaWrap: {
    width: '100%',
  },
})
