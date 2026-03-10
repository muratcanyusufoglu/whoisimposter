import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ResultBannerProps {
  caught: boolean
  imposterName: string
  secretWord: string
  /** null until after guess prompt is answered */
  finalOutcome: 'crew_wins' | 'imposter_wins' | 'tie' | null
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE — a single confetti dot
// ─────────────────────────────────────────────────────────────────────────────

interface ParticleProps {
  color: string
  dx: number
  dy: number
  delay: number
  size: number
}

function Particle({ color, dx, dy, delay, size }: ParticleProps) {
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0)

  useEffect(() => {
    x.value = withDelay(delay, withSpring(dx, { damping: 6, stiffness: 40 }))
    y.value = withDelay(delay, withSpring(dy, { damping: 6, stiffness: 40 }))
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(600, withTiming(0, { duration: 400 })),
    ))
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        s.particle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ResultBanner({ caught, imposterName, secretWord, finalOutcome }: ResultBannerProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // ─── Entrance animations ───────────────────────────────────────────────
  const headlineScale   = useSharedValue(0.4)
  const headlineOpacity = useSharedValue(0)
  const cardY           = useSharedValue(40)
  const cardOpacity     = useSharedValue(0)
  const outcomeScale    = useSharedValue(0.5)
  const outcomeOpacity  = useSharedValue(0)
  // Imposter pulse for "escaped" state
  const dangerPulse     = useSharedValue(1)

  useEffect(() => {
    // Headline springs in
    headlineScale.value   = withSpring(1, { damping: 10, stiffness: 80 })
    headlineOpacity.value = withTiming(1, { duration: 300 })

    // Info card slides in
    cardY.value       = withDelay(200, withSpring(0, { damping: 14 }))
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 300 }))

    // Danger pulse if imposter escaped
    if (!caught) {
      dangerPulse.value = withDelay(500,
        withRepeat(
          withSequence(
            withTiming(1.04, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.00, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        ),
      )
    }
  }, [])

  // Animate final outcome when it appears
  useEffect(() => {
    if (finalOutcome !== null) {
      outcomeScale.value   = withSpring(1, { damping: 10, stiffness: 100 })
      outcomeOpacity.value = withTiming(1, { duration: 300 })
    }
  }, [finalOutcome])

  const headlineStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headlineScale.value }],
    opacity: headlineOpacity.value,
  }))

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }))

  const outcomeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outcomeScale.value }],
    opacity: outcomeOpacity.value,
  }))

  const dangerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dangerPulse.value }],
  }))

  // Particle colors for confetti (crew win)
  const particleColors = [
    theme.accent.primary,
    theme.accent.tertiary,
    theme.accent.warm,
    theme.status.success,
    theme.accent.premium,
  ]

  const particles: ParticleProps[] = caught
    ? [
        { color: particleColors[0], dx: -80, dy: -100, delay: 0,   size: 10 },
        { color: particleColors[1], dx:  90, dy:  -80, delay: 40,  size: 8  },
        { color: particleColors[2], dx: -60, dy:   60, delay: 80,  size: 12 },
        { color: particleColors[3], dx:  70, dy:   90, delay: 20,  size: 8  },
        { color: particleColors[4], dx: -90, dy:   30, delay: 60,  size: 6  },
        { color: particleColors[0], dx:  50, dy: -110, delay: 100, size: 10 },
        { color: particleColors[1], dx: 110, dy:   40, delay: 30,  size: 7  },
        { color: particleColors[2], dx: -40, dy:  120, delay: 90,  size: 9  },
      ]
    : []

  return (
    <View style={s.container}>
      {/* ── Confetti particles (crew win only) ── */}
      {caught && (
        <View style={s.particleOrigin} pointerEvents="none">
          {particles.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </View>
      )}

      {/* ── Headline ── */}
      <Animated.View style={headlineStyle}>
        {caught ? (
          <Text style={[s.headline, { color: theme.status.success }]}>
            🎉 {t('result.caught')} 🎉
          </Text>
        ) : (
          <Animated.View style={dangerStyle}>
            <Text style={[s.headline, { color: theme.accent.secondary }]}>
              {t('result.escaped')}
            </Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* ── Info card: imposter name + secret word ── */}
      <Animated.View
        style={[
          s.infoCard,
          {
            backgroundColor: theme.bg.surface,
            borderColor: caught ? theme.status.success + '40' : theme.accent.secondary + '40',
            borderWidth: 1,
          },
          cardStyle,
        ]}
      >
        {/* Imposter reveal */}
        <View style={s.infoRow}>
          <Text style={[s.infoLabel, { color: theme.text.secondary }]}>
            {caught ? t('result.imposterWas') : t('result.imposterIs')}
          </Text>
          <View style={s.imposterNameRow}>
            <Text style={[s.imposterName, { color: caught ? theme.status.success : theme.accent.secondary }]}>
              {imposterName}
            </Text>
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: theme.border.subtle }]} />

        {/* Secret word */}
        <View style={s.infoRow}>
          <Text style={[s.infoLabel, { color: theme.text.secondary }]}>
            {t('result.secretWord')}
          </Text>
          <Text style={[s.secretWord, { color: theme.text.primary }]}>
            {secretWord}
          </Text>
        </View>
      </Animated.View>

      {/* ── Final outcome badge ── */}
      {finalOutcome !== null && (
        <Animated.View style={[s.outcomeBadge, outcomeStyle]}>
          <Text
            style={[
              s.outcomeText,
              {
                color: finalOutcome === 'crew_wins'
                  ? theme.status.success
                  : theme.accent.secondary,
              },
            ]}
          >
            {finalOutcome === 'crew_wins'
              ? t('result.crewWins')
              : finalOutcome === 'imposter_wins'
              ? t('result.imposterWins')
              : t('result.tie')}
          </Text>
        </Animated.View>
      )}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  particleOrigin: {
    position: 'absolute',
    top: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 1,
    height: 1,
  },

  particle: {
    position: 'absolute',
  },

  headline: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.display,
    textAlign: 'center',
    letterSpacing: 1,
  },

  infoCard: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },

  infoRow: {
    gap: spacing.xs,
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 2,
  },

  imposterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  imposterName: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.display,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },

  secretWord: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.display,
    textAlign: 'center',
  },

  outcomeBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },

  outcomeText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.displayBold,
    textAlign: 'center',
  },
})
