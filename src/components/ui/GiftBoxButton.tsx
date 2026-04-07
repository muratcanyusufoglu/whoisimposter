import { useEffect } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'

// ─────────────────────────────────────────────────────────────────────────────
// GIFT BOX BUTTON — Floating discount offer entry point
// Appears after user dismisses the main paywall without purchasing.
// Tapping it hides the button and opens the DiscountPaywallModal.
// ─────────────────────────────────────────────────────────────────────────────

const BUTTON_SIZE = 64
const BOX_W = 36
const LID_H = 11
const BODY_H = 25
const RIBBON_THICKNESS = 4

export function GiftBoxButton() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()

  const giftBoxVisible     = useSubscriptionStore((s) => s.giftBoxVisible)
  const isPro              = useSubscriptionStore((s) => s.isPro)
  const hideGiftBox        = useSubscriptionStore((s) => s.hideGiftBox)
  const showDiscountPaywall = useSubscriptionStore((s) => s.showDiscountPaywall)

  // ── Animation values ──────────────────────────────────────────────────────
  // Entry slide + fade
  const translateX = useSharedValue(BUTTON_SIZE + 24)
  const opacity    = useSharedValue(0)

  // Lid bobs up and down on a loop
  const lidY   = useSharedValue(0)

  // Whole button pulses gently
  const scale  = useSharedValue(1)

  useEffect(() => {
    if (!giftBoxVisible || isPro) {
      // Animate out when hidden
      translateX.value = withTiming(BUTTON_SIZE + 24, { duration: 250 })
      opacity.value    = withTiming(0, { duration: 200 })
      cancelAnimation(lidY)
      cancelAnimation(scale)
      lidY.value  = 0
      scale.value = 1
      return
    }

    // Slide in from right + fade
    translateX.value = withDelay(300, withSpring(0, { damping: 16, stiffness: 180 }))
    opacity.value    = withDelay(300, withTiming(1, { duration: 350 }))

    // Lid loop: lifts up 9px then settles back, repeats every ~2.5s
    lidY.value = withRepeat(
      withSequence(
        withDelay(1800, withSpring(-9, { damping: 5, stiffness: 280 })),
        withDelay(350,  withSpring(0,  { damping: 10, stiffness: 220 })),
      ),
      -1,
      false,
    )

    // Scale pulse synced with lid: gently grows when lid pops up
    scale.value = withRepeat(
      withSequence(
        withDelay(1800, withSpring(1.13, { damping: 6, stiffness: 220 })),
        withDelay(350,  withSpring(1,    { damping: 10, stiffness: 220 })),
      ),
      -1,
      false,
    )
  }, [giftBoxVisible, isPro]) // eslint-disable-line react-hooks/exhaustive-deps

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    opacity: opacity.value,
  }))

  const lidStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lidY.value }],
  }))

  if (!giftBoxVisible || isPro) return null

  const handlePress = () => {
    haptics.medium()
    hideGiftBox()
    showDiscountPaywall()
  }

  // Position above the tab bar (60px) + safe area bottom inset
  const bottomOffset = insets.bottom + 60 + 16

  return (
    <Animated.View style={[styles.wrapper, { bottom: bottomOffset }, containerStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          {
            backgroundColor: theme.accent.primary,
            shadowColor: theme.accent.primary,
          },
        ]}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={t('giftBox.accessibilityLabel')}
      >
        <View style={styles.giftBox}>
          {/* ── Lid (animated) ── */}
          <Animated.View
            style={[styles.lid, { backgroundColor: theme.text.onPrimary }, lidStyle]}
          >
            {/* Vertical ribbon on lid */}
            <View
              style={[
                styles.lidRibbon,
                { backgroundColor: theme.accent.primary },
              ]}
            />
          </Animated.View>

          {/* ── Box body ── */}
          <View style={[styles.body, { backgroundColor: theme.text.onPrimary }]}>
            {/* Horizontal ribbon */}
            <View
              style={[
                styles.ribbonH,
                { backgroundColor: theme.accent.primary },
              ]}
            />
            {/* Vertical ribbon */}
            <View
              style={[
                styles.ribbonV,
                { backgroundColor: theme.accent.primary },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },

  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },

  giftBox: {
    width: BOX_W,
    height: LID_H + BODY_H,
    alignItems: 'center',
  },

  lid: {
    width: BOX_W + 4,
    height: LID_H,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lidRibbon: {
    width: RIBBON_THICKNESS,
    height: LID_H,
    borderRadius: RIBBON_THICKNESS / 2,
  },

  body: {
    width: BOX_W,
    height: BODY_H,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  ribbonH: {
    position: 'absolute',
    width: BOX_W,
    height: RIBBON_THICKNESS,
    borderRadius: RIBBON_THICKNESS / 2,
  },

  ribbonV: {
    position: 'absolute',
    width: RIBBON_THICKNESS,
    height: BODY_H,
    borderRadius: RIBBON_THICKNESS / 2,
  },
})
