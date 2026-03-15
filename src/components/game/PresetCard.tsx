import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { GamePreset, GameModeDefinition } from '@/types'
import { GameImage } from '@/components/game/GameImage'

// ─────────────────────────────────────────────────────────────────────────────
// PresetCard — Vertical 120px-wide card used in the home presets strip
// ─────────────────────────────────────────────────────────────────────────────

interface PresetCardProps {
  preset: GamePreset
  modeDefinition: GameModeDefinition
  onPress: () => void
  onDelete: () => void
}

export function PresetCard({ preset, modeDefinition, onPress, onDelete }: PresetCardProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const cardScale = useSharedValue(1)
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }))

  const deleteScale = useSharedValue(1)
  const deleteAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: deleteScale.value }] }))

  const handlePressIn = () => {
    cardScale.value = withSpring(0.95, { damping: 12, stiffness: 400 })
  }
  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 300 })
  }

  const handleDelete = () => {
    deleteScale.value = withSpring(0.8, { damping: 10, stiffness: 400 }, () => {
      deleteScale.value = withSpring(1, { damping: 14, stiffness: 300 })
    })
    onDelete()
  }

  return (
    <Animated.View style={[styles.wrapper, cardAnimStyle]}>
      {/* Delete button (top-right) */}
      <Animated.View style={[styles.deleteWrap, deleteAnimStyle]}>
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={[styles.deleteBtn, { backgroundColor: theme.bg.elevated }]}
          accessibilityRole="button"
          accessibilityLabel={t('presets.sectionTitle')}
        >
          <Text style={[styles.deleteEllipsis, { color: theme.text.muted }]}>{'•••'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main card */}
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.subtle,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={preset.name}
      >
        {/* Top: emoji or game image */}
        {preset.emoji ? (
          <Text style={styles.emojiIcon}>{preset.emoji}</Text>
        ) : (
          <GameImage id={preset.modeId} size={32} />
        )}

        {/* Name */}
        <Text
          style={[
            styles.name,
            { color: theme.text.primary, fontFamily: fontFamily.bodyBold },
          ]}
          numberOfLines={1}
        >
          {preset.name}
        </Text>

        {/* Player count */}
        <Text
          style={[
            styles.playerCount,
            { color: theme.text.muted, fontFamily: fontFamily.body },
          ]}
          numberOfLines={1}
        >
          {t('presets.playerCount', { count: preset.playerNames.length })}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: 120,
    position: 'relative',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 100,
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 32,
    lineHeight: 38,
  },
  name: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  playerCount: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  deleteWrap: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 1,
  },
  deleteBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  deleteEllipsis: {
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
})
