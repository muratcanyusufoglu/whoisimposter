import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Check, Lock } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { Category } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// CategoryCard — 2-column grid card for the game setup screen
// Design: emoji top-left, name bottom-left, word count chip bottom-right
// Selected: accent border + tinted bg + checkmark badge
// Premium: 50% opacity + lock icon
// ─────────────────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 100

interface CategoryCardProps {
  category: Category
  selected: boolean
  isPro: boolean
  onPress: () => void
  cardWidth: number
  locale: string
}

export function CategoryCard({
  category,
  selected,
  isPro,
  onPress,
  cardWidth,
  locale,
}: CategoryCardProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const locked = category.isPremium && !isPro

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 400 })
  }
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 })
  }

  // Word count for the current locale (fall back to EN)
  const wordCount = category.wordCount[locale] ?? category.wordCount['en'] ?? 0

  return (
    <Animated.View style={[animStyle, { width: cardWidth }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          {
            height: CARD_HEIGHT,
            backgroundColor: selected
              ? theme.accent.primary + '12'
              : theme.bg.surface,
            borderColor: selected ? theme.accent.primary : theme.border.subtle,
            borderWidth: selected ? 2 : 1,
          },
          locked && styles.locked,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled: locked }}
        accessibilityLabel={t(category.nameKey)}
      >
        {/* Emoji — top left */}
        <Text style={styles.emoji}>{category.emoji}</Text>

        {/* Checkmark badge — top right (when selected) */}
        {selected && (
          <View style={[styles.checkBadge, { backgroundColor: theme.accent.primary }]}>
            <Check size={10} color={theme.text.onPrimary} strokeWidth={3} />
          </View>
        )}

        {/* PRO badge — top right (when premium) */}
        {category.isPremium && !selected && (
          <View style={[styles.proBadge, { backgroundColor: theme.accent.premium }]}>
            <Text style={[styles.proBadgeText, { color: '#000', fontFamily: fontFamily.bodyBold }]}>
              PRO
            </Text>
          </View>
        )}

        {/* Lock overlay — centered (for locked premium) */}
        {locked && (
          <View style={styles.lockOverlay}>
            <Lock size={20} color={theme.text.muted} />
          </View>
        )}

        {/* Bottom row: name + word count */}
        <View style={styles.bottom}>
          <Text
            style={[
              styles.name,
              {
                color: locked ? theme.text.muted : theme.text.primary,
                fontFamily: fontFamily.bodyBold,
              },
            ]}
            numberOfLines={1}
          >
            {t(category.nameKey)}
          </Text>

          {wordCount > 0 && (
            <View style={[styles.wordChip, { backgroundColor: theme.bg.elevated }]}>
              <Text
                style={[
                  styles.wordCount,
                  { color: theme.text.muted, fontFamily: fontFamily.body },
                ]}
              >
                {t('setup.words', { count: wordCount })}
              </Text>
            </View>
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
  card: {
    borderRadius: radius.lg,
    padding: spacing.sm,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  locked: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 30,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  proBadgeText: {
    fontSize: 8,
    letterSpacing: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    gap: 2,
  },
  name: {
    fontSize: fontSize.sm,
  },
  wordChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  wordCount: {
    fontSize: fontSize.xs,
  },
})
