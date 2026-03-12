import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
  Extrapolation,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'
import type { Player } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2
const CARD_HEIGHT = CARD_WIDTH * 1.45

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface WordRevealCardProps {
  player: Player
  isImposter: boolean
  secretWord: string
  /** When true, card animates back to front (auto-blur or manual hide) */
  isBlurred: boolean
  /** Called immediately when hold completes and flip begins */
  onRevealComplete: (isImposter: boolean) => void
  /** Called when user taps the revealed back face to re-blur */
  onBlurRequest: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function WordRevealCard({
  player,
  isImposter,
  secretWord,
  isBlurred,
  onRevealComplete,
  onBlurRequest,
}: WordRevealCardProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // Track whether this player has already revealed (prevents re-hold after flip)
  const [isRevealed, setIsRevealed] = useState(false)

  const flipAnim = useSharedValue(0)     // 0 = front face, 1 = back face
  const holdProgress = useSharedValue(0) // 0–1 hold gesture progress
  const holdScale = useSharedValue(1)    // slight scale on press

  // ─── Reset when parent re-blurs (auto-blur or tap-to-hide) ───────────────
  useEffect(() => {
    if (isBlurred && isRevealed) {
      setIsRevealed(false)
      flipAnim.value = withTiming(0, { duration: 350, easing: Easing.inOut(Easing.ease) })
      holdProgress.value = withSpring(0)
      holdScale.value = withSpring(1)
    }
  }, [isBlurred])

  // ─── Reveal: haptics + flip animation ────────────────────────────────────
  const handleReveal = useCallback(() => {
    if (isImposter) {
      haptics.heavy()
    } else {
      haptics.medium()
    }
    setIsRevealed(true)
    flipAnim.value = withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) })
    onRevealComplete(isImposter)
  }, [isImposter, haptics, onRevealComplete])

  // ─── Hold gesture handlers ────────────────────────────────────────────────
  const handleHoldStart = useCallback(() => {
    if (isRevealed) return
    holdScale.value = withSpring(0.94, { damping: 15 })
    holdProgress.value = withTiming(1, { duration: 500 }, (finished) => {
      if (finished) runOnJS(handleReveal)()
    })
  }, [isRevealed, handleReveal])

  const handleHoldCancel = useCallback(() => {
    holdScale.value = withSpring(1)
    holdProgress.value = withSpring(0)
  }, [])

  // ─── Animated styles ──────────────────────────────────────────────────────

  // Front: rotates 0→90deg, fades out at midpoint
  const frontCardStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 1], [0, 90], Extrapolation.CLAMP)
    const opacity = interpolate(flipAnim.value, [0, 0.42, 0.5], [1, 1, 0], Extrapolation.CLAMP)
    return {
      opacity,
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
    }
  })

  // Back: rotates -90→0deg, fades in at midpoint
  const backCardStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 1], [-90, 0], Extrapolation.CLAMP)
    const opacity = interpolate(flipAnim.value, [0.5, 0.58, 1], [0, 1, 1], Extrapolation.CLAMP)
    return {
      opacity,
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
    }
  })

  const holdButtonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holdScale.value }],
  }))

  // Progress ring grows and brightens as hold progresses
  const progressRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(holdProgress.value, [0, 0.1, 1], [0.25, 0.5, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(holdProgress.value, [0, 1], [0.86, 1.1], Extrapolation.CLAMP) },
    ],
  }))

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>

      {/* ── FRONT FACE — "Hold to reveal" ── */}
      <Animated.View
        pointerEvents={isRevealed ? 'none' : 'auto'}
        style={[
          s.card,
          { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
          frontCardStyle,
        ]}
      >
        <Pressable
          onPressIn={handleHoldStart}
          onPressOut={handleHoldCancel}
          style={s.faceContent}
        >
          {/* Player avatar */}
          <View style={[s.avatar, { backgroundColor: player.color }]}>
            <Text style={[s.avatarText, { color: '#FFFFFF' }]}>{player.initials}</Text>
          </View>

          {/* Player name */}
          <Text style={[s.playerName, { color: theme.text.primary }]}>{player.name}</Text>

          {/* Privacy instruction */}
          <Text style={[s.instruction, { color: theme.text.secondary }]}>
            {t('reveal.instruction')}
          </Text>

          {/* Hold circle with animated progress ring */}
          <View style={s.holdArea}>
            <Animated.View
              style={[
                s.progressRing,
                { borderColor: theme.accent.primary },
                progressRingStyle,
              ]}
            />
            <Animated.View
              style={[
                s.holdButton,
                {
                  backgroundColor: theme.accent.primary + '18',
                  borderColor: theme.accent.primary + '55',
                },
                holdButtonAnimStyle,
              ]}
            >
              <Text style={[s.holdIcon, { color: theme.accent.primary }]}>◉</Text>
            </Animated.View>
          </View>

          <Text style={[s.holdLabel, { color: theme.text.muted }]}>
            {t('reveal.holdToReveal')}
          </Text>
        </Pressable>
      </Animated.View>

      {/* ── BACK FACE — word or imposter reveal ── */}
      <Animated.View
        pointerEvents={isRevealed ? 'auto' : 'none'}
        style={[
          s.card,
          s.backCard,
          {
            backgroundColor: isImposter ? theme.game.imposterBg : theme.game.crewBg,
          },
          backCardStyle,
        ]}
      >
        <Pressable onPress={onBlurRequest} style={s.faceContent}>
          {isImposter ? (
            <View style={s.backInner}>
              <Text style={[s.imposterLine1, { color: theme.game.cardText }]}>
                {t('reveal.imposter_line1')}
              </Text>
              <Text
                style={[s.imposterLine2, { color: theme.accent.secondary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {t('reveal.imposter_line2')}
              </Text>
              <Text style={[s.backSubtitle, { color: theme.game.cardTextMuted }]}>
                {t('reveal.imposter_subtitle')}
              </Text>
            </View>
          ) : (
            <View style={s.backInner}>
              <Text style={[s.crewLabel, { color: theme.game.cardTextMuted }]}>
                {t('reveal.yourWord')}
              </Text>
              <Text
                style={[s.secretWord, { color: theme.game.cardText }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {secretWord}
              </Text>
              <Text style={[s.backSubtitle, { color: theme.game.cardTextMuted }]}>
                {t('reveal.crew_subtitle')}
              </Text>
            </View>
          )}

          {/* Tap-to-hide hint */}
          <Text style={[s.tapToHide, { color: theme.game.cardTextMuted }]}>
            {t('reveal.autoBlur')}
          </Text>
        </Pressable>
      </Animated.View>

    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },

  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },

  backCard: {
    borderWidth: 0,
  },

  faceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },

  // ── Front face ──

  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.displayBold,
  },

  playerName: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bodyBold,
    textAlign: 'center',
  },

  instruction: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  holdArea: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressRing: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: radius.full,
    borderWidth: 3,
  },

  holdButton: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  holdIcon: {
    fontSize: 38,
    lineHeight: 44,
  },

  holdLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    textAlign: 'center',
  },

  // ── Back face ──

  backInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },

  crewLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 3,
  },

  secretWord: {
    fontSize: fontSize['5xl'],
    fontFamily: fontFamily.display,
    textAlign: 'center',
    lineHeight: fontSize['5xl'] * 1.1,
  },

  imposterLine1: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 2,
    textAlign: 'center',
  },

  imposterLine2: {
    fontSize: fontSize['4xl'],
    fontFamily: fontFamily.display,
    textAlign: 'center',
    lineHeight: fontSize['4xl'] * 1.1,
  },

  backSubtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.body,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },

  tapToHide: {
    position: 'absolute',
    bottom: spacing.xl,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    textAlign: 'center',
  },
})
