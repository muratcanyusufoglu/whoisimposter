import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import { WordRevealCard } from '@/components/game/WordRevealCard'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const AUTO_BLUR_MS = 5000

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function RevealScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players       = useGameStore((s) => s.players)
  const revealOrder   = useGameStore((s) => s.revealOrder)
  const revealIndex   = useGameStore((s) => s.currentRevealIndex)
  const imposterIds   = useGameStore((s) => s.imposterIds)
  const secretWord    = useGameStore((s) => s.secretWord)
  const roundPhase    = useGameStore((s) => s.roundPhase)
  const advanceReveal = useGameStore((s) => s.advanceReveal)

  // Per-reveal UI state — reset on each new player
  const [isBlurred, setIsBlurred]     = useState(false)
  const [canProceed, setCanProceed]   = useState(false)
  const autoBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Button entrance animation
  const btnScale = useSharedValue(0)
  const btnOpacity = useSharedValue(0)

  // Derive current player
  const currentPlayerId = revealOrder[revealIndex] ?? ''
  const currentPlayer   = players.find((p) => p.id === currentPlayerId) ?? players[0]
  const isImposter      = imposterIds.includes(currentPlayerId)
  const totalPlayers    = revealOrder.length
  const isLastPlayer    = revealIndex >= totalPlayers - 1

  // ─── Navigate to play once store transitions phase ──────────────────────
  useEffect(() => {
    if (roundPhase === 'play') {
      router.replace('/(game)/play' as never)
    }
  }, [roundPhase])

  // ─── Reset per-player state when index changes ────────────────────────
  useEffect(() => {
    setIsBlurred(false)
    setCanProceed(false)
    btnScale.value = 0
    btnOpacity.value = 0
    return () => {
      if (autoBlurRef.current) clearTimeout(autoBlurRef.current)
    }
  }, [revealIndex])

  // ─── Auto-blur timer management ──────────────────────────────────────────
  const startAutoBlurTimer = useCallback(() => {
    if (autoBlurRef.current) clearTimeout(autoBlurRef.current)
    autoBlurRef.current = setTimeout(() => {
      setIsBlurred(true)
    }, AUTO_BLUR_MS)
  }, [])

  const clearAutoBlurTimer = useCallback(() => {
    if (autoBlurRef.current) {
      clearTimeout(autoBlurRef.current)
      autoBlurRef.current = null
    }
  }, [])

  // ─── Card callbacks ───────────────────────────────────────────────────────
  const handleRevealComplete = useCallback((_isImposter: boolean) => {
    setCanProceed(true)
    startAutoBlurTimer()
    // Animate NEXT PLAYER button in
    btnScale.value = withSpring(1, { damping: 14, stiffness: 120 })
    btnOpacity.value = withTiming(1, { duration: 300 })
  }, [startAutoBlurTimer])

  const handleBlurRequest = useCallback(() => {
    clearAutoBlurTimer()
    setIsBlurred(true)
  }, [clearAutoBlurTimer])

  // ─── Next player / finish ────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!canProceed) return
    clearAutoBlurTimer()
    haptics.selection()
    // Animate button out
    btnScale.value = withSpring(0.9)
    btnOpacity.value = withTiming(0, { duration: 150 })
    // advanceReveal will either increment index or transition to 'play'
    advanceReveal()
  }, [canProceed, clearAutoBlurTimer, haptics, advanceReveal])

  // ─── Animated styles ──────────────────────────────────────────────────────
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnOpacity.value,
  }))

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!currentPlayer) return null

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* ── Header: player progress ── */}
      <View style={s.header}>
        <Text style={[s.progressLabel, { color: theme.text.muted }]}>
          {revealIndex + 1} / {totalPlayers}
        </Text>

        {/* Dot indicators */}
        <View style={s.dots}>
          {revealOrder.map((id, idx) => (
            <View
              key={id}
              style={[
                s.dot,
                {
                  backgroundColor:
                    idx < revealIndex
                      ? theme.accent.primary + '60'
                      : idx === revealIndex
                      ? theme.accent.primary
                      : theme.border.subtle,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── Card ── */}
      <View style={s.cardArea}>
        <WordRevealCard
          key={currentPlayerId}
          player={currentPlayer}
          isImposter={isImposter}
          secretWord={secretWord}
          isBlurred={isBlurred}
          onRevealComplete={handleRevealComplete}
          onBlurRequest={handleBlurRequest}
        />
      </View>

      {/* ── Footer: Next button ── */}
      <View style={s.footer}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            onPress={handleNext}
            disabled={!canProceed}
            style={[
              s.nextBtn,
              {
                backgroundColor: canProceed ? theme.accent.primary : theme.bg.surface,
                borderColor: canProceed ? theme.accent.primary : theme.border.default,
              },
            ]}
          >
            <Text
              style={[
                s.nextBtnText,
                { color: canProceed ? theme.text.onPrimary : theme.text.muted },
              ]}
            >
              {isLastPlayer ? t('play.startVoting') : t('reveal.next')}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },

  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  progressLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.mono,
    letterSpacing: 2,
  },

  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },

  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    minHeight: 72,
    justifyContent: 'center',
  },

  nextBtn: {
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextBtnText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
  },
})
