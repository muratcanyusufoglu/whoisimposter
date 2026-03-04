import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
  cancelAnimation,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'
import { fontSize, fontFamily } from '@/theme/tokens'

// ─────────────────────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TimerRingProps {
  totalSeconds: number
  isActive: boolean
  onComplete?: () => void
  size?: number
  strokeWidth?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TimerRing({
  totalSeconds,
  isActive,
  onComplete,
  size = 120,
  strokeWidth = 8,
}: TimerRingProps) {
  const { theme } = useTheme()

  const [remaining, setRemaining] = useState(totalSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  // 0 = empty (done), 1 = full (just started)
  const progress = useSharedValue(1)
  // Pulse scale for danger zone
  const pulse = useSharedValue(1)

  const warmColor   = theme.accent.warm
  const dangerColor = theme.accent.secondary
  const trackColor  = theme.border.subtle

  // ─── Start / stop / reset when isActive changes ─────────────────────────
  useEffect(() => {
    if (isActive) {
      completedRef.current = false
      setRemaining(totalSeconds)
      progress.value = 1
      cancelAnimation(pulse)
      pulse.value = 1

      // Smooth progress animation
      progress.value = withTiming(0, {
        duration: totalSeconds * 1000,
        easing: Easing.linear,
      })

      // JS interval for the displayed countdown number
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (!completedRef.current) {
              completedRef.current = true
              onComplete?.()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      // Pause / stop
      if (intervalRef.current) clearInterval(intervalRef.current)
      cancelAnimation(progress)
      cancelAnimation(pulse)
      pulse.value = 1
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, totalSeconds])

  // ─── Pulse animation when in danger zone (< 25% remaining) ─────────────
  useEffect(() => {
    const dangerThreshold = Math.ceil(totalSeconds * 0.25)
    if (isActive && remaining <= dangerThreshold && remaining > 0) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0,  { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      )
    } else {
      cancelAnimation(pulse)
      pulse.value = withTiming(1, { duration: 200 })
    }
  }, [remaining, isActive, totalSeconds])

  // ─── Animated SVG props ───────────────────────────────────────────────────
  const animatedCircleProps = useAnimatedProps(() => {
    const stroke = interpolateColor(
      progress.value,
      [0, 0.25, 1],
      [dangerColor, dangerColor, warmColor],
    )
    return {
      strokeDashoffset: circumference * (1 - progress.value),
      stroke,
    }
  })

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[s.container, { width: size, height: size }, pulseStyle]}>
      <Svg width={size} height={size}>
        {/* Track ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedCircleProps}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      {/* Center countdown */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={s.centerLabel}>
          <Text
            style={[
              s.timeText,
              {
                color: remaining <= Math.ceil(totalSeconds * 0.25)
                  ? theme.accent.secondary
                  : theme.text.primary,
                fontFamily: fontFamily.mono,
                fontSize: fontSize['2xl'],
              },
            ]}
          >
            {remaining}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  centerLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
})
