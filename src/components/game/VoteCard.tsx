import { Pressable, View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Check } from 'lucide-react-native'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import type { Player } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface VoteCardProps {
  player: Player
  isSelected: boolean
  isDisabled: boolean
  /** How many votes this player received — shown after reveal */
  voteCount?: number
  showVoteCount: boolean
  /** Stagger index for reveal animation */
  revealDelay?: number
  onPress: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function VoteCard({
  player,
  isSelected,
  isDisabled,
  voteCount,
  showVoteCount,
  revealDelay = 0,
  onPress,
}: VoteCardProps) {
  const { theme } = useTheme()

  const scale = useSharedValue(1)
  const countOpacity = useSharedValue(0)
  const countScale = useSharedValue(0.5)

  // Animate vote count badge when showVoteCount becomes true
  if (showVoteCount && countOpacity.value === 0) {
    countOpacity.value = withTiming(1, { duration: 300 })
    countScale.value = withSpring(1, { damping: 12 })
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const countBadgeStyle = useAnimatedStyle(() => ({
    opacity: countOpacity.value,
    transform: [{ scale: countScale.value }],
  }))

  const handlePressIn = () => {
    if (isDisabled) return
    scale.value = withSpring(0.95, { damping: 15 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 })
  }

  const borderColor = isSelected ? theme.accent.primary : theme.border.default
  const bgColor     = isSelected ? theme.accent.primary + '18' : theme.bg.surface
  const opacity     = isDisabled ? 0.35 : 1

  return (
    <Animated.View style={[s.wrapper, { opacity }, cardStyle]}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          s.card,
          {
            backgroundColor: bgColor,
            borderColor,
          },
        ]}
      >
        {/* Selected ring indicator */}
        {isSelected && (
          <View style={[s.selectedRing, { borderColor: theme.accent.primary }]} />
        )}

        {/* Avatar */}
        <View style={[s.avatar, { backgroundColor: player.color }]}>
          <Text style={[s.avatarText, { color: '#FFFFFF' }]}>{player.initials}</Text>
        </View>

        {/* Name */}
        <Text
          style={[s.name, { color: isSelected ? theme.accent.primary : theme.text.primary }]}
          numberOfLines={1}
        >
          {player.name}
        </Text>

        {/* Check mark when selected */}
        {isSelected && (
          <View style={[s.checkBadge, { backgroundColor: theme.accent.primary }]}>
            <Check size={10} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}

        {/* Vote count badge (shown after reveal) */}
        {showVoteCount && (
          <Animated.View
            style={[
              s.voteBadge,
              {
                backgroundColor:
                  (voteCount ?? 0) > 0 ? theme.accent.secondary : theme.bg.elevated,
                borderColor: (voteCount ?? 0) > 0 ? theme.accent.secondary : theme.border.default,
              },
              countBadgeStyle,
            ]}
          >
            <Text
              style={[
                s.voteCount,
                {
                  color: (voteCount ?? 0) > 0 ? '#FFFFFF' : theme.text.muted,
                  fontFamily: fontFamily.mono,
                },
              ]}
            >
              {voteCount ?? 0}
            </Text>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
    minHeight: 100,
    position: 'relative',
  },

  selectedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    borderWidth: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.displayBold,
  },

  name: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyMedium,
    textAlign: 'center',
    maxWidth: '100%',
  },

  checkBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  voteBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },

  voteCount: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.mono,
  },
})
