import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'
import { spacing, radius } from '@/theme/tokens'

// ─────────────────────────────────────────────────────────────────────────────
// ProgressDots — Onboarding step indicator
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressDotsProps {
  total: number
  current: number // 0-indexed
}

function Dot({ active }: { active: boolean }) {
  const { theme } = useTheme()
  const width = useSharedValue(active ? 24 : 8)
  const opacity = useSharedValue(active ? 1 : 0.35)

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, { damping: 20, stiffness: 250 })
    opacity.value = withSpring(active ? 1 : 0.35, { damping: 20, stiffness: 250 })
  })

  const animStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: theme.accent.primary },
        animStyle,
      ]}
    />
  )
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
})
