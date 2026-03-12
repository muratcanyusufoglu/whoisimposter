import { View, Text, StyleSheet } from 'react-native'
import Animated, { BounceIn } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import type { StreakState } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface StreakBannerProps {
  streak: StreakState
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function StreakBanner({ streak }: StreakBannerProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Only render when there's a meaningful streak (2+)
  if (streak.count < 2 || streak.currentHolder === null) return null

  const isCrew = streak.currentHolder === 'crew'
  const bgColor = isCrew ? theme.status.success + '22' : theme.status.error + '22'
  const textColor = isCrew ? theme.status.success : theme.status.error
  const borderColor = isCrew ? theme.status.success + '44' : theme.status.error + '44'

  return (
    <Animated.View
      entering={BounceIn.springify()}
      style={s.wrapper}
    >
      <View
        style={[
          s.pill,
          { backgroundColor: bgColor, borderColor },
        ]}
      >
        <Text style={[s.text, { color: textColor }]}>
          {isCrew
            ? t('streak.crewStreak', { count: streak.count })
            : t('streak.imposterStreak', { count: streak.count })}
        </Text>
      </View>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
  },

  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },

  text: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyBold,
    textAlign: 'center',
  },
})
