import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// DISCOUNT PAYWALL MODAL
// Shown when user dismisses the main PaywallModal without purchasing.
// Offers the yearly discount plan ($19.99/yr = $1.67/mo).
// Close button appears after 3 seconds.
// ─────────────────────────────────────────────────────────────────────────────

const CLOSE_DELAY_MS = 3000

// $19.99 / 12 months = $1.6658 → shown as $1.67/mo
// Savings vs $4.99/mo: (4.99 - 1.67) / 4.99 = 66.5% → shown as 67%

interface DiscountPaywallModalProps {
  visible: boolean
  onClose: () => void
}

export function DiscountPaywallModal({ visible, onClose }: DiscountPaywallModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const { purchaseYearlyDiscount, restore, isLoading, prices } = useSubscriptionStore()

  const [closeVisible, setCloseVisible] = useState(false)
  const [internalVisible, setInternalVisible] = useState(false)

  // ── Slide-up animation ────────────────────────────────────────────────────
  const translateY = useSharedValue(900)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      setInternalVisible(true)
      setCloseVisible(false)
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 })
      backdropOpacity.value = withTiming(1, { duration: 300 })
      const timer = setTimeout(() => setCloseVisible(true), CLOSE_DELAY_MS)
      return () => clearTimeout(timer)
    } else {
      translateY.value = withTiming(
        900,
        { duration: 250, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished) runOnJS(setInternalVisible)(false)
        },
      )
      backdropOpacity.value = withTiming(0, { duration: 250 })
    }
  }, [visible])

  // ── Close button fade-in ──────────────────────────────────────────────────
  const closeOpacity = useSharedValue(0)
  const closeScale = useSharedValue(0.8)

  useEffect(() => {
    if (closeVisible) {
      closeOpacity.value = withSpring(1, { damping: 14, stiffness: 200 })
      closeScale.value = withSpring(1, { damping: 14, stiffness: 200 })
    }
  }, [closeVisible])

  // ── Price pulse animation ─────────────────────────────────────────────────
  const priceScale = useSharedValue(1)

  useEffect(() => {
    if (visible) {
      priceScale.value = withDelay(
        600,
        withSequence(
          withSpring(1.06, { damping: 8, stiffness: 300 }),
          withSpring(1, { damping: 12, stiffness: 200 }),
        ),
      )
    }
  }, [visible])

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))
  const closeStyle = useAnimatedStyle(() => ({
    opacity: closeOpacity.value,
    transform: [{ scale: closeScale.value }],
  }))
  const priceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
  }))

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePurchase = async () => {
    haptics.medium()
    await purchaseYearlyDiscount()
    onClose()
  }

  const handleRestore = async () => {
    haptics.light()
    await restore()
    onClose()
  }

  const handleClose = () => {
    haptics.light()
    onClose()
  }

  return (
    <RNModal
      visible={internalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { backgroundColor: theme.bg.overlay }, backdropStyle]}
        pointerEvents="none"
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
          slideStyle,
        ]}
      >
        {/* Close button (delayed) */}
        <Animated.View style={[styles.closeBtn, closeStyle]}>
          <TouchableOpacity
            onPress={handleClose}
            accessibilityLabel={t('discountPaywall.close')}
            style={[
              styles.closeTouchable,
              { backgroundColor: theme.bg.elevated, borderColor: theme.border.default },
            ]}
          >
            <Ionicons name="close" size={18} color={theme.text.secondary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.content}>
          {/* Special offer tag */}
          <View style={[styles.tag, { backgroundColor: theme.accent.warm + '22', borderColor: theme.accent.warm + '55' }]}>
            <Ionicons name="flash" size={13} color={theme.accent.warm} />
            <Text style={[styles.tagText, { color: theme.accent.warm, fontFamily: fontFamily.bodyBold }]}>
              {t('discountPaywall.tag')}
            </Text>
          </View>

          {/* Headline */}
          <Text style={[styles.title, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('discountPaywall.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
            {t('discountPaywall.subtitle')}
          </Text>

          {/* Price comparison card */}
          <View style={[styles.priceCard, { backgroundColor: theme.bg.elevated, borderColor: theme.border.default }]}>
            {/* Save badge — dynamic % or fallback */}
            <View style={[styles.saveBadge, { backgroundColor: theme.status.success }]}>
              <Text style={[styles.saveBadgeText, { color: '#fff', fontFamily: fontFamily.displayBold }]}>
                {prices.discountSavePct != null
                  ? t('discountPaywall.saving', { percent: prices.discountSavePct })
                  : t('discountPaywall.saving', { percent: 67 })}
              </Text>
            </View>

            {/* Original price — crossed out (live monthly price from RC) */}
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                {t('discountPaywall.originalPriceLabel')}
              </Text>
              <Text style={[styles.originalPrice, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                {prices.monthly ? `${prices.monthly} / mo` : t('discountPaywall.originalPrice')}
              </Text>
            </View>

            {/* Divider */}
            <View style={[styles.priceDivider, { backgroundColor: theme.border.subtle }]} />

            {/* Discount price — highlighted (live per-month from RC) */}
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.text.secondary, fontFamily: fontFamily.bodyBold }]}>
                {t('discountPaywall.discountPriceLabel')}
              </Text>
              <Animated.Text
                style={[
                  styles.discountPrice,
                  { color: theme.accent.warm, fontFamily: fontFamily.displayBold },
                  priceStyle,
                ]}
              >
                {prices.yearlyDiscountPerMonth
                  ? `${prices.yearlyDiscountPerMonth} / mo`
                  : t('discountPaywall.discountPrice')}
              </Animated.Text>
            </View>

            {/* Billed annually note — live total from RC */}
            <Text style={[styles.billedNote, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
              {prices.yearlyDiscountTotal
                ? t('discountPaywall.billedAnnually', { total: prices.yearlyDiscountTotal })
                : t('discountPaywall.billedAnnually', { total: '$19.99' })}
            </Text>
          </View>

          {/* CTA button */}
          <Button
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handlePurchase}
            accessibilityLabel={t('discountPaywall.cta')}
          >
            {t('discountPaywall.cta')}
          </Button>

          {/* Decline link */}
          <TouchableOpacity onPress={handleClose} style={styles.declineBtn}>
            <Text style={[styles.declineText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
              {t('discountPaywall.decline')}
            </Text>
          </TouchableOpacity>

          {/* Restore link */}
          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.restoreText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
              {t('discountPaywall.restore')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </RNModal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  closeTouchable: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  priceCard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.xs,
    overflow: 'visible',
  },
  saveBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  saveBadgeText: {
    fontSize: fontSize.sm,
    letterSpacing: 0.2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: fontSize.md,
  },
  originalPrice: {
    fontSize: fontSize.md,
    textDecorationLine: 'line-through',
  },
  priceDivider: {
    height: 1,
    width: '100%',
  },
  discountPrice: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
  },
  billedNote: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  declineBtn: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  declineText: {
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  restoreText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
})
