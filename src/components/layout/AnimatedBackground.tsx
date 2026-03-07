import { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED BACKGROUND
// Theme-aware decorative background layer.
// • dark  — two soft blobs drifting slowly (12s cycle) per DESIGN §7
// • neon  — moving scanline + subtle screen flicker (8s interval)
// • light — static warm-tinted overlay
// Must be rendered as first child of a flex container so it stays behind content.
// pointerEvents="none" ensures it never intercepts user touches.
// ─────────────────────────────────────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get('screen')
const BLOB_SIZE = 320
const BLOB2_SIZE = 260

export function AnimatedBackground() {
  const { theme, themeId } = useTheme()
  const reducedMotion = useReducedMotion()

  // ── Dark theme: two drifting blobs ───────────────────────────────────────
  const b1x = useSharedValue(-120)
  const b1y = useSharedValue(-100)
  const b2x = useSharedValue(W * 0.55)
  const b2y = useSharedValue(H * 0.5)

  // ── Neon theme: scanline + flicker ───────────────────────────────────────
  const scanY   = useSharedValue(-4)
  const screenOp = useSharedValue(1)

  // ── Dark blobs animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || themeId !== 'dark') {
      cancelAnimation(b1x); cancelAnimation(b1y)
      cancelAnimation(b2x); cancelAnimation(b2y)
      return
    }
    const EASE = Easing.inOut(Easing.quad)
    b1x.value = withRepeat(withSequence(
      withTiming(W * 0.45, { duration: 7000, easing: EASE }),
      withTiming(-120,     { duration: 7000, easing: EASE }),
    ), -1, false)
    b1y.value = withRepeat(withSequence(
      withTiming(H * 0.55, { duration: 9000, easing: EASE }),
      withTiming(-100,     { duration: 9000, easing: EASE }),
    ), -1, false)
    b2x.value = withRepeat(withSequence(
      withTiming(W * 0.05, { duration: 11000, easing: EASE }),
      withTiming(W * 0.55, { duration: 11000, easing: EASE }),
    ), -1, false)
    b2y.value = withRepeat(withSequence(
      withTiming(H * 0.2,  { duration: 8000, easing: EASE }),
      withTiming(H * 0.5,  { duration: 8000, easing: EASE }),
    ), -1, false)
    return () => {
      cancelAnimation(b1x); cancelAnimation(b1y)
      cancelAnimation(b2x); cancelAnimation(b2y)
    }
  }, [themeId, reducedMotion])

  // ── Neon scanline + flicker ───────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || themeId !== 'neon') {
      cancelAnimation(scanY)
      cancelAnimation(screenOp)
      return
    }
    scanY.value = withRepeat(
      withTiming(H + 4, { duration: 5000, easing: Easing.linear }),
      -1, false,
    )
    // Flicker every 8 seconds
    const flickerInterval = setInterval(() => {
      screenOp.value = withSequence(
        withTiming(0.72, { duration: 60 }),
        withTiming(1,    { duration: 60 }),
        withTiming(0.88, { duration: 40 }),
        withTiming(1,    { duration: 60 }),
      )
    }, 8000)
    return () => {
      clearInterval(flickerInterval)
      cancelAnimation(scanY)
      cancelAnimation(screenOp)
    }
  }, [themeId, reducedMotion])

  // ── Animated styles ───────────────────────────────────────────────────────
  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b1x.value }, { translateY: b1y.value }],
  }))
  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b2x.value }, { translateY: b2y.value }],
  }))
  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }))
  const flickerStyle = useAnimatedStyle(() => ({
    opacity: screenOp.value,
  }))

  // ── Dark theme ────────────────────────────────────────────────────────────
  if (themeId === 'dark') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            s.blob,
            { backgroundColor: theme.accent.primary + '20' },
            blob1Style,
          ]}
        />
        <Animated.View
          style={[
            s.blob2,
            { backgroundColor: theme.accent.secondary + '16' },
            blob2Style,
          ]}
        />
      </View>
    )
  }

  // ── Neon theme ────────────────────────────────────────────────────────────
  if (themeId === 'neon') {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, flickerStyle]} pointerEvents="none">
        {/* Subtle overall tint */}
        <View style={[s.neonTint, { backgroundColor: theme.accent.primary + '06' }]} />
        {/* Moving scanline */}
        <Animated.View
          style={[s.scanline, { backgroundColor: theme.accent.primary + '22' }, scanStyle]}
        />
      </Animated.View>
    )
  }

  // ── Light theme — static warm wash ───────────────────────────────────────
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[s.lightOverlay, { backgroundColor: theme.accent.primary + '06' }]} />
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
  },
  blob2: {
    position: 'absolute',
    width: BLOB2_SIZE,
    height: BLOB2_SIZE,
    borderRadius: BLOB2_SIZE / 2,
  },
  neonTint: {
    ...StyleSheet.absoluteFillObject,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    top: 0,
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
})
