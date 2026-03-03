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
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { Smartphone, Eye, Search } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useTheme } from '@/theme'
import { AppTheme } from '@/theme/types'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO PLAY SCREEN — Step 3 of 4
// 3 animated steps with stagger entrance. Swipe-left advances to next screen.
// ─────────────────────────────────────────────────────────────────────────────

const STAGGER_SPRING = { damping: 20, stiffness: 200 }

export default function HowToPlayScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // ── Entrance animation values ──────────────────────────────────────────────
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

  useState(() => {
    // Title
    op0.value = withSpring(1, STAGGER_SPRING)
    ty0.value = withSpring(0, STAGGER_SPRING)
    // Step 1
    op1.value = withDelay(100, withSpring(1, STAGGER_SPRING))
    ty1.value = withDelay(100, withSpring(0, STAGGER_SPRING))
    // Step 2
    op2.value = withDelay(200, withSpring(1, STAGGER_SPRING))
    ty2.value = withDelay(200, withSpring(0, STAGGER_SPRING))
    // Step 3
    op3.value = withDelay(300, withSpring(1, STAGGER_SPRING))
    ty3.value = withDelay(300, withSpring(0, STAGGER_SPRING))
    // CTA
    op4.value = withDelay(450, withTiming(1, { duration: 350 }))
    ty4.value = withDelay(450, withSpring(0, STAGGER_SPRING))
  })

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

  // ── Swipe-left gesture to advance ─────────────────────────────────────────
  const handleContinue = () => {
    haptics.medium()
    router.push('/onboarding/games-showcase')
  }

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onEnd((e) => {
      'worklet'
      if (e.translationX < -60 && Math.abs(e.translationY) < 60) {
        // Navigate to next screen (must run on JS thread)
      }
    })
    .runOnJS(true)
    .onEnd((e) => {
      if (e.translationX < -60 && Math.abs(e.translationY) < 60) {
        handleContinue()
      }
    })

  const iconColor = theme.accent.primary

  return (
    <GestureDetector gesture={swipeGesture}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
        edges={['top', 'bottom']}
      >
        {/* Title */}
        <Animated.View style={[styles.titleWrap, style0]}>
          <Text
            style={[
              styles.title,
              { color: theme.text.primary, fontFamily: fontFamily.displayBold },
            ]}
          >
            {t('onboarding.howToPlay.title')}
          </Text>
        </Animated.View>

        {/* Steps */}
        <View style={styles.stepsWrap}>
          <Animated.View style={style1}>
            <StepCard
              step={1}
              icon={<Smartphone size={28} color={iconColor} />}
              title={t('onboarding.howToPlay.step1_title')}
              description={t('onboarding.howToPlay.step1_desc')}
              theme={theme}
            />
          </Animated.View>

          <Animated.View style={style2}>
            <StepCard
              step={2}
              icon={<Eye size={28} color={iconColor} />}
              title={t('onboarding.howToPlay.step2_title')}
              description={t('onboarding.howToPlay.step2_desc')}
              theme={theme}
            />
          </Animated.View>

          <Animated.View style={style3}>
            <StepCard
              step={3}
              icon={<Search size={28} color={iconColor} />}
              title={t('onboarding.howToPlay.step3_title')}
              description={t('onboarding.howToPlay.step3_desc')}
              theme={theme}
            />
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ProgressDots total={4} current={2} />
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
    </GestureDetector>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP CARD
// ─────────────────────────────────────────────────────────────────────────────

function StepCard({
  step,
  icon,
  title,
  description,
  theme,
}: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
  theme: AppTheme
}) {
  return (
    <View
      style={[
        styles.stepCard,
        {
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.subtle,
        },
      ]}
    >
      {/* Step number badge */}
      <View
        style={[
          styles.stepBadge,
          { backgroundColor: theme.accent.primary },
        ]}
      >
        <Text
          style={[
            styles.stepNumber,
            { color: theme.text.onPrimary, fontFamily: fontFamily.bodyBold },
          ]}
        >
          {step}
        </Text>
      </View>

      {/* Icon */}
      <View
        style={[
          styles.stepIconWrap,
          { backgroundColor: theme.bg.elevated },
        ]}
      >
        {icon}
      </View>

      {/* Text */}
      <View style={styles.stepText}>
        <Text
          style={[
            styles.stepTitle,
            { color: theme.text.primary, fontFamily: fontFamily.bodyBold },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.stepDesc,
            { color: theme.text.secondary, fontFamily: fontFamily.body },
          ]}
        >
          {description}
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
  titleWrap: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.8,
  },
  stepsWrap: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -10,
    left: spacing.md,
    zIndex: 1,
  },
  stepNumber: {
    fontSize: fontSize.sm,
    lineHeight: 16,
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: fontSize.lg,
  },
  stepDesc: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
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
