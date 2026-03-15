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
//
// • dark   — two soft blobs drifting slowly (12s cycle)
// • neon   — moving scanline + subtle screen flicker (8s interval)
// • party  — three orbs (teal · coral · lavender) drifting at different speeds
// • sunset — large amber glow pulsing + smaller rust blob drifting
// • others — static accent tint overlay
//
// Must be rendered as first child of a flex container so it stays behind content.
// pointerEvents="none" ensures it never intercepts user touches.
// ─────────────────────────────────────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get('screen')

export function AnimatedBackground() {
  const { theme, themeId } = useTheme()
  const reducedMotion = useReducedMotion()

  // ── Dark theme: two drifting blobs ───────────────────────────────────────
  const b1x = useSharedValue(-120)
  const b1y = useSharedValue(-100)
  const b2x = useSharedValue(W * 0.55)
  const b2y = useSharedValue(H * 0.5)

  // ── Neon theme: scanline + flicker ───────────────────────────────────────
  const scanY    = useSharedValue(-4)
  const screenOp = useSharedValue(1)

  // ── Party theme: three floating orbs ─────────────────────────────────────
  const p1x = useSharedValue(-80)
  const p1y = useSharedValue(-80)
  const p2x = useSharedValue(W * 0.50)
  const p2y = useSharedValue(H * 0.60)
  const p3x = useSharedValue(W * 0.30)
  const p3y = useSharedValue(H * 0.30)

  // ── Sunset theme: rust + coral drift ────────────────────────────────────
  const sx1  = useSharedValue(W * 0.05)
  const sy1  = useSharedValue(-80)
  const ss1  = useSharedValue(1)          // scale — drives the pulse
  const sx2  = useSharedValue(W * 0.35)
  const sy2  = useSharedValue(H * 0.58)

  // ── Golden theme: two gentle warm blobs on cream/amber surfaces ──────────
  const gx1  = useSharedValue(W * 0.55)
  const gy1  = useSharedValue(-60)
  const gx2  = useSharedValue(-60)
  const gy2  = useSharedValue(H * 0.55)

  // ─────────────────────────────────────────────────────────────────────────
  // DARK — blobs
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // NEON — scanline + flicker
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // PARTY — three orbs (teal · coral · lavender) at different rhythms
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || themeId !== 'party') {
      cancelAnimation(p1x); cancelAnimation(p1y)
      cancelAnimation(p2x); cancelAnimation(p2y)
      cancelAnimation(p3x); cancelAnimation(p3y)
      return
    }
    const EASE = Easing.inOut(Easing.sin)

    // Teal orb — top-left → center-right
    p1x.value = withRepeat(withSequence(
      withTiming(W * 0.40, { duration: 8000,  easing: EASE }),
      withTiming(-80,      { duration: 8000,  easing: EASE }),
    ), -1, false)
    p1y.value = withRepeat(withSequence(
      withTiming(H * 0.50, { duration: 10000, easing: EASE }),
      withTiming(-80,      { duration: 10000, easing: EASE }),
    ), -1, false)

    // Coral orb — center-right → bottom-left
    p2x.value = withRepeat(withSequence(
      withTiming(W * 0.05, { duration: 12000, easing: EASE }),
      withTiming(W * 0.50, { duration: 12000, easing: EASE }),
    ), -1, false)
    p2y.value = withRepeat(withSequence(
      withTiming(H * 0.22, { duration: 9000,  easing: EASE }),
      withTiming(H * 0.60, { duration: 9000,  easing: EASE }),
    ), -1, false)

    // Lavender orb — slow diagonal drift
    p3x.value = withRepeat(withSequence(
      withTiming(W * 0.55, { duration: 15000, easing: EASE }),
      withTiming(W * 0.25, { duration: 15000, easing: EASE }),
    ), -1, false)
    p3y.value = withRepeat(withSequence(
      withTiming(H * 0.58, { duration: 11000, easing: EASE }),
      withTiming(H * 0.25, { duration: 11000, easing: EASE }),
    ), -1, false)

    return () => {
      cancelAnimation(p1x); cancelAnimation(p1y)
      cancelAnimation(p2x); cancelAnimation(p2y)
      cancelAnimation(p3x); cancelAnimation(p3y)
    }
  }, [themeId, reducedMotion])

  // ─────────────────────────────────────────────────────────────────────────
  // SUNSET — amber pulse-glow at top + rust blob drifting at bottom
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || themeId !== 'sunset') {
      cancelAnimation(sx1); cancelAnimation(sy1); cancelAnimation(ss1)
      cancelAnimation(sx2); cancelAnimation(sy2)
      return
    }
    const EASE = Easing.inOut(Easing.sin)

    // Large amber orb — gentle horizontal drift at top + slow scale pulse
    sx1.value = withRepeat(withSequence(
      withTiming(W * 0.30, { duration: 10000, easing: EASE }),
      withTiming(W * 0.02, { duration: 10000, easing: EASE }),
    ), -1, false)
    sy1.value = withRepeat(withSequence(
      withTiming(H * 0.10, { duration: 13000, easing: EASE }),
      withTiming(-80,      { duration: 13000, easing: EASE }),
    ), -1, false)
    // Breathe: scale 1.0 → 1.20 → 1.0 over 7s
    ss1.value = withRepeat(withSequence(
      withTiming(1.20, { duration: 7000, easing: EASE }),
      withTiming(1.0,  { duration: 7000, easing: EASE }),
    ), -1, false)

    // Smaller rust orb — slow bottom drift, opposite phase
    sx2.value = withRepeat(withSequence(
      withTiming(W * 0.55, { duration: 11000, easing: EASE }),
      withTiming(W * 0.28, { duration: 11000, easing: EASE }),
    ), -1, false)
    sy2.value = withRepeat(withSequence(
      withTiming(H * 0.48, { duration: 14000, easing: EASE }),
      withTiming(H * 0.68, { duration: 14000, easing: EASE }),
    ), -1, false)

    return () => {
      cancelAnimation(sx1); cancelAnimation(sy1); cancelAnimation(ss1)
      cancelAnimation(sx2); cancelAnimation(sy2)
    }
  }, [themeId, reducedMotion])

  // ─────────────────────────────────────────────────────────────────────────
  // GOLDEN — two soft warm blobs drifting on cream/amber bg
  // accent.primary = #AB3C1F (rust), accent.secondary = #DD563D (coral)
  // High opacity since bg is bright (#FDAB4E)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || themeId !== 'golden') {
      cancelAnimation(gx1); cancelAnimation(gy1)
      cancelAnimation(gx2); cancelAnimation(gy2)
      return
    }
    const EASE = Easing.inOut(Easing.sin)

    // Rust blob — top-right → center-left
    gx1.value = withRepeat(withSequence(
      withTiming(W * 0.10, { duration: 11000, easing: EASE }),
      withTiming(W * 0.55, { duration: 11000, easing: EASE }),
    ), -1, false)
    gy1.value = withRepeat(withSequence(
      withTiming(H * 0.35, { duration: 13000, easing: EASE }),
      withTiming(-60,       { duration: 13000, easing: EASE }),
    ), -1, false)

    // Coral blob — bottom-left → center-right
    gx2.value = withRepeat(withSequence(
      withTiming(W * 0.45, { duration: 9000,  easing: EASE }),
      withTiming(-60,       { duration: 9000,  easing: EASE }),
    ), -1, false)
    gy2.value = withRepeat(withSequence(
      withTiming(H * 0.30, { duration: 12000, easing: EASE }),
      withTiming(H * 0.55, { duration: 12000, easing: EASE }),
    ), -1, false)

    return () => {
      cancelAnimation(gx1); cancelAnimation(gy1)
      cancelAnimation(gx2); cancelAnimation(gy2)
    }
  }, [themeId, reducedMotion])

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATED STYLES
  // ─────────────────────────────────────────────────────────────────────────

  // Dark
  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b1x.value }, { translateY: b1y.value }],
  }))
  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b2x.value }, { translateY: b2y.value }],
  }))

  // Neon
  const scanStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: scanY.value }] }))
  const flickerStyle = useAnimatedStyle(() => ({ opacity: screenOp.value }))

  // Party
  const partyBlob1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: p1x.value }, { translateY: p1y.value }],
  }))
  const partyBlob2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: p2x.value }, { translateY: p2y.value }],
  }))
  const partyBlob3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: p3x.value }, { translateY: p3y.value }],
  }))

  // Sunset
  const sunsetBlob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: sx1.value },
      { translateY: sy1.value },
      { scale: ss1.value },
    ],
  }))
  const sunsetBlob2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: sx2.value }, { translateY: sy2.value }],
  }))

  // Golden
  const goldenBlob1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: gx1.value }, { translateY: gy1.value }],
  }))
  const goldenBlob2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: gx2.value }, { translateY: gy2.value }],
  }))

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Dark — two lime / red blobs
  if (themeId === 'dark') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[s.blob,  { backgroundColor: theme.accent.primary   + '20' }, blob1Style]} />
        <Animated.View style={[s.blob2, { backgroundColor: theme.accent.secondary + '16' }, blob2Style]} />
      </View>
    )
  }

  // Neon — scanline + flicker
  if (themeId === 'neon') {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, flickerStyle]} pointerEvents="none">
        <View style={[s.fill, { backgroundColor: theme.accent.primary + '06' }]} />
        <Animated.View style={[s.scanline, { backgroundColor: theme.accent.primary + '22' }, scanStyle]} />
      </Animated.View>
    )
  }

  // Party — three orbs: teal · coral · lavender
  if (themeId === 'party') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[s.pBlob1, { backgroundColor: theme.accent.primary   + '22' }, partyBlob1Style]} />
        <Animated.View style={[s.pBlob2, { backgroundColor: theme.accent.secondary + '1C' }, partyBlob2Style]} />
        <Animated.View style={[s.pBlob3, { backgroundColor: theme.accent.tertiary  + '18' }, partyBlob3Style]} />
      </View>
    )
  }

  // Sunset — large amber pulse-glow + rust drift
  if (themeId === 'sunset') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[s.sBlob1, { backgroundColor: theme.accent.primary   + '2A' }, sunsetBlob1Style]} />
        <Animated.View style={[s.sBlob2, { backgroundColor: theme.accent.secondary + '22' }, sunsetBlob2Style]} />
      </View>
    )
  }

  // Golden — rust + coral blobs on warm amber/cream bg
  // Higher opacity: bg is bright (#FDAB4E) so low opacity blobs would vanish
  if (themeId === 'golden') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[s.blob,  { backgroundColor: theme.accent.primary   + '38' }, goldenBlob1Style]} />
        <Animated.View style={[s.blob2, { backgroundColor: theme.accent.secondary + '2C' }, goldenBlob2Style]} />
      </View>
    )
  }

  // All other themes — static accent wash
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[s.fill, { backgroundColor: theme.accent.primary + '06' }]} />
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },

  // Dark blobs
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  blob2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },

  // Neon scanline
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    top: 0,
  },

  // Party orbs
  pBlob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  pBlob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  pBlob3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },

  // Sunset glows
  sBlob1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  sBlob2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
})
