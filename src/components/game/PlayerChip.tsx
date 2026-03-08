import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { Player } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// PlayerChip — Avatar circle + name + remove button
// Used in the Game Setup players section.
// ─────────────────────────────────────────────────────────────────────────────

interface PlayerChipProps {
  player: Player
  onRemove: () => void
  /** Disable remove when at minimum player count */
  canRemove: boolean
}

export function PlayerChip({ player, onRemove, canRemove }: PlayerChipProps) {
  const { theme } = useTheme()

  const scale = useSharedValue(1)
  const chipStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePressIn = () => {
    if (!canRemove) return
    scale.value = withSpring(0.95, { damping: 12, stiffness: 400 })
  }
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 })
  }

  return (
    <Animated.View
      style={[
        chipStyle,
        styles.chip,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: player.color }]}>
        <Text style={[styles.initials, { color: '#fff', fontFamily: fontFamily.bodyBold }]}>
          {player.initials}
        </Text>
      </View>

      {/* Name */}
      <Text
        style={[
          styles.name,
          { color: theme.text.primary, fontFamily: fontFamily.bodyMedium },
        ]}
        numberOfLines={1}
      >
        {player.name}
      </Text>

      {/* Remove button */}
      <TouchableOpacity
        onPress={canRemove ? onRemove : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.removeBtn,
          {
            backgroundColor: canRemove ? theme.bg.elevated : 'transparent',
            opacity: canRemove ? 1 : 0.3,
          },
        ]}
        accessibilityLabel={`Remove ${player.name}`}
        accessibilityRole="button"
        disabled={!canRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={14} color={theme.text.muted} />
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  name: {
    fontSize: fontSize.sm,
    maxWidth: 80,
  },
  removeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
