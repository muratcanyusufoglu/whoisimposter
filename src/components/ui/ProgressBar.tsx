import React, { useEffect } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useTheme, radius } from '@/theme'

interface ProgressBarProps {
  /** 0 to 1 */
  progress: number
  height?: number
  color?: string
  trackColor?: string
  style?: ViewStyle
  animated?: boolean
  duration?: number
}

/**
 * Horizontal progress indicator with smooth Reanimated animation.
 */
export function ProgressBar({
  progress,
  height = 4,
  color,
  trackColor,
  style,
  animated = true,
  duration = 300,
}: ProgressBarProps) {
  const { theme } = useTheme()
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const width = useSharedValue(clampedProgress)

  useEffect(() => {
    if (animated) {
      width.value = withTiming(clampedProgress, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    } else {
      width.value = clampedProgress
    }
  }, [clampedProgress, animated, duration, width])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }))

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor ?? theme.border.subtle,
          borderRadius: radius.full,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color ?? theme.accent.primary,
            borderRadius: radius.full,
          },
          animatedStyle,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
})
