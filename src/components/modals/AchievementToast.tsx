import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  SlideInDown,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import type { AchievementDefinition } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AchievementToastProps {
  achievement: AchievementDefinition | null
  onDismiss: () => void
}

// Auto-dismiss delay in milliseconds
const AUTO_DISMISS_MS = 3000

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Auto-dismiss after AUTO_DISMISS_MS when a new achievement appears
  useEffect(() => {
    if (!achievement) return
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [achievement, onDismiss])

  if (!achievement) return null

  return (
    <Animated.View
      key={achievement.id}
      entering={SlideInDown.springify().damping(18)}
      exiting={SlideOutUp.duration(250)}
      style={[
        s.container,
        {
          backgroundColor: theme.bg.elevated,
          borderColor: theme.accent.premium,
        },
      ]}
    >
      {/* Emoji */}
      <Text style={s.emoji}>{achievement.emoji}</Text>

      {/* Text content */}
      <View style={s.textBlock}>
        <Text style={[s.label, { color: theme.accent.premium }]}>
          {t('achievements.unlockedTitle')}
        </Text>
        <Text style={[s.title, { color: theme.text.primary }]}>
          {t(achievement.titleKey)}
        </Text>
        <Text style={[s.desc, { color: theme.text.secondary }]}>
          {t(achievement.descKey)}
        </Text>
      </View>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    // Shadow for elevation effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },

  emoji: {
    fontSize: 36,
  },

  textBlock: {
    flex: 1,
    gap: 2,
  },

  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
  },

  desc: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
  },
})
