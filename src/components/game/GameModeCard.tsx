import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { GameModeDefinition } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { useHaptics } from '@/hooks/useHaptics'

// ─────────────────────────────────────────────────────────────────────────────
// GameModeCard — Horizontal card used on the home screen game list
// ─────────────────────────────────────────────────────────────────────────────

interface GameModeCardProps {
  mode: GameModeDefinition
  locked: boolean
  onPress: () => void
}

export function GameModeCard({ mode, locked, onPress }: GameModeCardProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 12, stiffness: 400 })
  }
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 })
  }
  const handlePress = () => {
    if (locked) haptics.light()
    else haptics.selection()
    onPress()
  }

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.subtle,
          },
          locked && styles.lockedCard,
        ]}
        accessibilityLabel={t(mode.nameKey)}
        accessibilityRole="button"
      >
        {/* Emoji */}
        <Text style={[styles.emoji, locked && styles.lockedEmoji]}>
          {mode.emoji}
        </Text>

        {/* Text */}
        <View style={styles.textWrap}>
          <View style={styles.nameRow}>
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
              {t(mode.nameKey)}
            </Text>
            {mode.isPremium && (
              <Badge variant="pro" label={t('common.pro')} />
            )}
          </View>
          <Text
            style={[
              styles.desc,
              { color: theme.text.secondary, fontFamily: fontFamily.body },
            ]}
            numberOfLines={1}
          >
            {t(mode.descriptionKey)}
          </Text>
        </View>

        {/* Right icon */}
        <View style={styles.rightIcon}>
          {locked ? (
            <Ionicons name="lock-closed" size={18} color={theme.text.muted} />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={theme.text.muted} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  lockedCard: {
    opacity: 0.6,
  },
  emoji: {
    fontSize: 32,
    width: 44,
    textAlign: 'center',
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
  },
  desc: {
    fontSize: fontSize.sm,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
})
