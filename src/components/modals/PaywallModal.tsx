import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Linking,
  Modal as RNModal,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { AppTheme } from '@/theme/types'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore, SubscriptionPrices } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'

// ─────────────────────────────────────────────────────────────────────────────
// PAYWALL MODAL — Full-screen bottom-up slide
// Close button appears after 4 seconds.
// ─────────────────────────────────────────────────────────────────────────────

const CLOSE_DELAY_MS = 4000

const PRIVACY_URL = 'https://muratcanyusufoglu.github.io/whoisimposter/legal/privacy/'
const TERMS_URL   = 'https://muratcanyusufoglu.github.io/whoisimposter/legal/terms/'
type PlanId = 'monthly' | 'yearly'

type PaywallReason = 'premium' | 'dailyLimit'

interface PaywallModalProps {
  visible: boolean
  onClose: () => void
  /** Called only when the user explicitly dismisses without purchasing */
  onDismiss?: () => void
  /** Why the paywall is shown — changes the header copy */
  reason?: PaywallReason
}

export function PaywallModal({ visible, onClose, onDismiss, reason = 'premium' }: PaywallModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const incrementPaywallSeen = useSettingsStore((s) => s.incrementPaywallSeen)
  const { purchaseMonthly, purchaseYearly, restore, isLoading, prices } =
    useSubscriptionStore()

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly')
  const [closeVisible, setCloseVisible] = useState(false)

  // internalVisible keeps the RNModal mounted until the close animation finishes
  const [internalVisible, setInternalVisible] = useState(false)

  // ── Slide-up animation ────────────────────────────────────────────────────
  const translateY = useSharedValue(800)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      setInternalVisible(true)
      incrementPaywallSeen()
      setCloseVisible(false)
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 })
      backdropOpacity.value = withTiming(1, { duration: 300 })
      // Reveal close button after 4s
      const timer = setTimeout(() => setCloseVisible(true), CLOSE_DELAY_MS)
      return () => clearTimeout(timer)
    } else {
      // Animate out first, then hide the native Modal
      translateY.value = withTiming(
        800,
        { duration: 250, easing: Easing.in(Easing.quad) },
        (finished) => { if (finished) runOnJS(setInternalVisible)(false) },
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePurchase = async () => {
    haptics.medium()
    if (selectedPlan === 'monthly') {
      await purchaseMonthly()
    } else {
      await purchaseYearly()
    }
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
    // Delay so the slide-out animation (250ms) finishes before the
    // discount modal opens — avoids two modals animating simultaneously
    if (onDismiss) setTimeout(onDismiss, 350)
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
            accessibilityLabel={t('paywall.close')}
            style={[
              styles.closeTouchable,
              { backgroundColor: theme.bg.elevated, borderColor: theme.border.default },
            ]}
          >
            <Ionicons name="close" size={18} color={theme.text.secondary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          {reason === 'dailyLimit' ? (
            <>
              <Text style={styles.crown}>⏰</Text>
              <Text style={[styles.headline, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                {t('paywall.dailyLimitTitle')}
              </Text>
              <Text style={[styles.subheadline, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {t('paywall.dailyLimitSubtitle')}
              </Text>
            </>
          ) : (
            <>
              {/* PRO tag */}
              <View style={[styles.heroTag, { backgroundColor: theme.accent.primary }]}>
                <Text style={[styles.heroTagText, { color: theme.text.onPrimary, fontFamily: fontFamily.displayBold }]}>
                  {t('paywall.heroTag')}
                </Text>
              </View>

              {/* Headline */}
              <Text style={[styles.headline, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                {t('paywall.headline')}
              </Text>

              {/* Subheadline */}
              <Text style={[styles.subheadline, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {t('paywall.subheadline')}
              </Text>
            </>
          )}

          {/* Benefits */}
          <View style={styles.benefits}>
            {BENEFITS.map((key) => (
              <BenefitRow key={key} textKey={key} theme={theme} />
            ))}
          </View>

          <Divider />

          {/* Plan selector */}
          <View style={styles.plans}>
            <PlanCard
              id="yearly"
              selected={selectedPlan === 'yearly'}
              onSelect={() => setSelectedPlan('yearly')}
              theme={theme}
              t={t}
              prices={prices}
            />
            <PlanCard
              id="monthly"
              selected={selectedPlan === 'monthly'}
              onSelect={() => setSelectedPlan('monthly')}
              theme={theme}
              t={t}
              prices={prices}
            />
          </View>

          {/* CTA — shows free trial days if available, else generic CTA */}
          <Button
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handlePurchase}
            accessibilityLabel={
              selectedPlan === 'monthly' && prices.trialDays != null
                ? t('paywall.cta', { days: prices.trialDays })
                : t('paywall.ctaNoTrial')
            }
          >
            {selectedPlan === 'monthly' && prices.trialDays != null
              ? t('paywall.cta', { days: prices.trialDays })
              : t('paywall.ctaNoTrial')}
          </Button>

          {/* Social proof 
          <Text
            style={[
              styles.socialProof,
              { color: theme.text.secondary, fontFamily: fontFamily.body },
            ]}
          >
            ⭐⭐⭐⭐⭐ 4.8 · 18K {t('paywall.ratings')}
          </Text>
          */}
          {/* Footer links */}
          <View style={styles.footerLinks}>
            <Text
              style={[
                styles.footerNote,
                { color: theme.text.muted, fontFamily: fontFamily.body },
              ]}
            >
              {t('paywall.cancelAnytime')}
            </Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text
                style={[
                  styles.link,
                  { color: theme.text.muted, fontFamily: fontFamily.body },
                ]}
              >
                {t('paywall.restore')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}>
              <Text style={[styles.legalText, { color: theme.text.muted }]}>
                {t('paywall.privacy')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legalText, { color: theme.text.muted }]}> · </Text>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}>
              <Text style={[styles.legalText, { color: theme.text.muted }]}>
                {t('paywall.terms')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </RNModal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFIT ROW
// ─────────────────────────────────────────────────────────────────────────────

const BENEFITS = [
  'paywall.benefit1',
  'paywall.benefit2',
  'paywall.benefit3',
  'paywall.benefit4',
  'paywall.benefit5',
]

function BenefitRow({
  textKey,
  theme,
}: {
  textKey: string
  theme: AppTheme
}) {
  const { t } = useTranslation()
  return (
    <View style={styles.benefitRow}>
      <View
        style={[
          styles.checkCircle,
          { backgroundColor: theme.status.success + '22' },
        ]}
      >
        <Ionicons name="checkmark" size={14} color={theme.status.success} />
      </View>
      <Text
        style={[
          styles.benefitText,
          { color: theme.text.primary, fontFamily: fontFamily.bodyMedium },
        ]}
      >
        {t(textKey)}
      </Text>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN CARD
// ─────────────────────────────────────────────────────────────────────────────

function PlanCard({
  id,
  selected,
  onSelect,
  theme,
  t,
  prices,
}: {
  id: PlanId
  selected: boolean
  onSelect: () => void
  theme: AppTheme
  t: (key: string, opts?: Record<string, unknown>) => string
  prices: SubscriptionPrices
}) {
  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 14, stiffness: 300 }),
    )
    onSelect()
  }

  const isYearly = id === 'yearly'
  const periodKey = isYearly ? 'paywall.yearly' : 'paywall.monthly'

  // Apple 3.1.2(c): billed amount must be most prominent pricing element.
  // Yearly → big = total billed (yearlyTotal) + "/ yr", small = per-month calc
  // Monthly → big = monthly price + "/ mo"
  const billedAmount = isYearly
    ? `${prices.yearlyTotal ?? t('paywall.yearlyPrice')} ${t('paywall.perYear')}`
    : `${prices.monthly ?? t('paywall.monthlyPrice')} ${t('paywall.perMonth')}`

  const perMonthNote = isYearly && prices.yearlyPerMonth
    ? `${prices.yearlyPerMonth} ${t('paywall.perMonth')}`
    : null

  // Use live save % if available
  const saveLine = isYearly && prices.yearlySavePct != null
    ? t('paywall.savings', { percent: prices.yearlySavePct })
    : isYearly ? t('paywall.savePct') : null

  // Free trial badge for monthly card
  const trialLine = !isYearly && prices.trialDays != null
    ? t('paywall.freeTrial', { days: prices.trialDays })
    : null

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.planCard,
          {
            backgroundColor: selected ? theme.bg.elevated : theme.bg.surface,
            borderColor: selected ? theme.accent.primary : theme.border.default,
          },
        ]}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        {/* Best value badge (yearly) */}
        {isYearly && (
          <View style={[styles.bestValueBadge, { backgroundColor: theme.accent.primary }]}>
            <Text style={[styles.bestValueText, { color: theme.text.onPrimary, fontFamily: fontFamily.bodyBold }]}>
              {t('paywall.bestValue')}
            </Text>
          </View>
        )}

        {/* Free trial badge (monthly) */}
        {trialLine != null && (
          <View style={[styles.bestValueBadge, { backgroundColor: theme.status.success }]}>
            <Text style={[styles.bestValueText, { color: '#fff', fontFamily: fontFamily.bodyBold }]}>
              {trialLine}
            </Text>
          </View>
        )}

        <View style={styles.planLeft}>
          <View
            style={[
              styles.radio,
              {
                borderColor: selected ? theme.accent.primary : theme.border.default,
              },
            ]}
          >
            {selected && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: theme.accent.primary },
                ]}
              />
            )}
          </View>
          <View>
            <Text
              style={[
                styles.planPeriod,
                { color: theme.text.primary, fontFamily: fontFamily.bodyBold },
              ]}
            >
              {t(periodKey)}
            </Text>
            {saveLine != null && (
              <Text
                style={[
                  styles.planSave,
                  { color: theme.status.success, fontFamily: fontFamily.body },
                ]}
              >
                {saveLine}
              </Text>
            )}
          </View>
        </View>

        {/* Right side: billed amount (big) + per-month note (small) */}
        <View style={styles.planRight}>
          <Text
            style={[
              styles.planPrice,
              { color: theme.text.primary, fontFamily: fontFamily.displayBold },
            ]}
          >
            {billedAmount}
          </Text>
          {perMonthNote != null && (
            <Text
              style={[
                styles.planPerMonth,
                { color: theme.text.muted, fontFamily: fontFamily.body },
              ]}
            >
              {perMonthNote}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
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
    maxHeight: '92%',
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
    alignItems: 'center',
  },
  heroTag: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  heroTagText: {
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  crown: {
    fontSize: 44,
    marginBottom: spacing.xs,
  },
  headline: {
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subheadline: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: -spacing.xs,
  },
  benefits: {
    width: '100%',
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  plans: {
    width: '100%',
    gap: spacing.sm,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'visible',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  bestValueText: {
    fontSize: fontSize.xs,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  planPeriod: {
    fontSize: fontSize.md,
  },
  planSave: {
    fontSize: fontSize.sm,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: fontSize['2xl'],
  },
  planPerMonth: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  socialProof: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerNote: {
    fontSize: fontSize.sm,
  },
  link: {
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
  legalLinks: {
    marginTop: -spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
})
