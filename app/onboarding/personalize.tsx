import { useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { AppTheme } from '@/theme/types'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALIZE SCREEN — Step 5 of 6
// Showcases: Player Avatars, Custom Themes, Quick Presets.
// Staggered feature card entrance (same pattern as welcome.tsx).
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { damping: 14, stiffness: 180 }
const STAGGER_SPRING = { damping: 20, stiffness: 200 }

export default function PersonalizeScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // ── Entrance animations ────────────────────────────────────────────────────
  const logoScale = useSharedValue(0)
  const op0 = useSharedValue(0); const ty0 = useSharedValue(20)
  const op1 = useSharedValue(0); const ty1 = useSharedValue(20)
  const op2 = useSharedValue(0); const ty2 = useSharedValue(20)
  const op3 = useSharedValue(0); const ty3 = useSharedValue(20)
  const op4 = useSharedValue(0); const ty4 = useSharedValue(20)

  useState(() => {
    logoScale.value = withSpring(1, SPRING)
    // Headline
    op0.value = withDelay(180, withSpring(1, STAGGER_SPRING))
    ty0.value = withDelay(180, withSpring(0, STAGGER_SPRING))
    // Feature 1
    op1.value = withDelay(300, withSpring(1, STAGGER_SPRING))
    ty1.value = withDelay(300, withSpring(0, STAGGER_SPRING))
    // Feature 2
    op2.value = withDelay(400, withSpring(1, STAGGER_SPRING))
    ty2.value = withDelay(400, withSpring(0, STAGGER_SPRING))
    // Feature 3
    op3.value = withDelay(500, withSpring(1, STAGGER_SPRING))
    ty3.value = withDelay(500, withSpring(0, STAGGER_SPRING))
    // CTA
    op4.value = withDelay(640, withTiming(1, { duration: 350 }))
    ty4.value = withDelay(640, withSpring(0, STAGGER_SPRING))
  })

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }))
  const style0 = useAnimatedStyle(() => ({ opacity: op0.value, transform: [{ translateY: ty0.value }] }))
  const style1 = useAnimatedStyle(() => ({ opacity: op1.value, transform: [{ translateY: ty1.value }] }))
  const style2 = useAnimatedStyle(() => ({ opacity: op2.value, transform: [{ translateY: ty2.value }] }))
  const style3 = useAnimatedStyle(() => ({ opacity: op3.value, transform: [{ translateY: ty3.value }] }))
  const style4 = useAnimatedStyle(() => ({ opacity: op4.value, transform: [{ translateY: ty4.value }] }))

  const handleContinue = () => {
    haptics.medium()
    router.push('/onboarding/notifications')
  }

  const iconColor = theme.accent.primary

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      <AnimatedBackground />

      {/* Sparkles icon — centered top */}
      <Animated.View style={[styles.logoSection, logoStyle]}>
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.bg.elevated, borderColor: theme.border.default },
          ]}
        >
          <Text style={styles.logoEmoji}>✨</Text>
        </View>
      </Animated.View>

      {/* Headline */}
      <Animated.View style={[styles.headlineWrap, style0]}>
        <Text
          style={[styles.headline, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}
        >
          {t('onboarding.personalize.title')}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.text.secondary, fontFamily: fontFamily.body }]}
        >
          {t('onboarding.personalize.subtitle')}
        </Text>
      </Animated.View>

      {/* Feature rows */}
      <View style={styles.features}>
        <Animated.View style={style1}>
          <FeatureRow
            icon={<Ionicons name="happy" size={24} color={iconColor} />}
            title={t('onboarding.personalize.feature1_title')}
            desc={t('onboarding.personalize.feature1_desc')}
            theme={theme}
          />
        </Animated.View>

        <Animated.View style={style2}>
          <FeatureRow
            icon={<Ionicons name="color-palette" size={24} color={iconColor} />}
            title={t('onboarding.personalize.feature2_title')}
            desc={t('onboarding.personalize.feature2_desc')}
            theme={theme}
          />
        </Animated.View>

        <Animated.View style={style3}>
          <FeatureRow
            icon={<Ionicons name="flash" size={24} color={iconColor} />}
            title={t('onboarding.personalize.feature3_title')}
            desc={t('onboarding.personalize.feature3_desc')}
            theme={theme}
          />
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ProgressDots total={6} current={4} />
        <Animated.View style={[styles.ctaWrap, style4]}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinue}
            accessibilityLabel={t('onboarding.personalize.continue')}
          >
            {t('onboarding.personalize.continue')}
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE ROW — icon + title + description (two-line)
// ─────────────────────────────────────────────────────────────────────────────

function FeatureRow({
  icon,
  title,
  desc,
  theme,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  theme: AppTheme
}) {
  return (
    <View
      style={[
        styles.featureRow,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.bg.elevated }]}>
        {icon}
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: theme.text.primary, fontFamily: fontFamily.bodyBold }]}>
          {title}
        </Text>
        <Text style={[styles.featureDesc, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
          {desc}
        </Text>
      </View>
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
    gap: spacing.xs,
  },
  headline: {
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: fontSize['3xl'] * 1.15,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  features: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  featureRow: {
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
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 3,
  },
  featureTitle: {
    fontSize: fontSize.md,
  },
  featureDesc: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
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
