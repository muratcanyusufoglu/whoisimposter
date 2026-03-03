import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated'
import * as StoreReview from 'expo-store-review'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// RATING MODAL
// Shown 1500ms after onboarding, and after 3rd completed game if deferred.
// ─────────────────────────────────────────────────────────────────────────────

interface RatingModalProps {
  visible: boolean
  onClose: () => void
}

export function RatingModal({ visible, onClose }: RatingModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const updateRatingState = useSettingsStore((s) => s.updateRatingState)

  const [selectedStars, setSelectedStars] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  // Star animation scales
  const starScales = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ]

  const starStyles = starScales.map((sv) =>
    useAnimatedStyle(() => ({ transform: [{ scale: sv.value }] })),
  )

  const handleStarPress = (star: number) => {
    haptics.selection()
    setSelectedStars(star)
    // Animate the tapped star with a bounce
    const sv = starScales[star - 1]
    sv.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 14, stiffness: 300 }),
    )
  }

  const handleRateNow = async () => {
    haptics.success()
    updateRatingState('done')
    const isAvailable = await StoreReview.isAvailableAsync()
    if (isAvailable) {
      await StoreReview.requestReview()
    }
    setSubmitted(true)
    setTimeout(onClose, 600)
  }

  const handleLater = () => {
    haptics.light()
    updateRatingState('later')
    onClose()
  }

  const handleNoThanks = () => {
    haptics.light()
    updateRatingState('done')
    onClose()
  }

  return (
    <Modal visible={visible} position="center" onClose={handleLater}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.headerEmoji}>⭐</Text>
        <Text
          style={[
            styles.title,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
        >
          {t('rating.headline')}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.text.secondary, fontFamily: fontFamily.body },
          ]}
        >
          {t('rating.subtext')}
        </Text>

        {/* Star row */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              accessibilityLabel={`${star} stars`}
              accessibilityRole="button"
            >
              <Animated.Text
                style={[
                  styles.star,
                  starStyles[star - 1],
                  { opacity: star <= selectedStars ? 1 : 0.25 },
                ]}
              >
                ⭐
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTAs */}
        {!submitted ? (
          <View style={styles.actions}>
            <Button
              variant="primary"
              size="md"
              disabled={selectedStars === 0}
              onPress={handleRateNow}
              accessibilityLabel={t('rating.rateNow')}
            >
              {t('rating.rateNow')} ⭐
            </Button>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                onPress={handleLater}
                accessibilityLabel={t('rating.later')}
              >
                <Text
                  style={[
                    styles.link,
                    { color: theme.text.muted, fontFamily: fontFamily.body },
                  ]}
                >
                  {t('rating.later')}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.dot, { color: theme.text.muted }]}>·</Text>

              <TouchableOpacity
                onPress={handleNoThanks}
                accessibilityLabel={t('rating.noThanks')}
              >
                <Text
                  style={[
                    styles.link,
                    { color: theme.text.muted, fontFamily: fontFamily.body },
                  ]}
                >
                  {t('rating.noThanks')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text
            style={[
              styles.thanks,
              { color: theme.status.success, fontFamily: fontFamily.bodyMedium },
            ]}
          >
            {t('rating.thanks')}
          </Text>
        )}
      </View>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    maxWidth: 240,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  star: {
    fontSize: 36,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  link: {
    fontSize: fontSize.sm,
  },
  dot: {
    fontSize: fontSize.sm,
  },
  thanks: {
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
  },
})
