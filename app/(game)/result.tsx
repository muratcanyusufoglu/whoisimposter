import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { ResultBanner } from '@/components/game/ResultBanner'
import { RatingModal } from '@/components/modals/RatingModal'

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players                 = useGameStore((s) => s.players)
  const imposterIds             = useGameStore((s) => s.imposterIds)
  const secretWord              = useGameStore((s) => s.secretWord)
  const lastVoteResult          = useGameStore((s) => s.lastVoteResult)
  const setImposterGuess        = useGameStore((s) => s.setImposterGuess)
  const nextRound               = useGameStore((s) => s.nextRound)
  const resetGame               = useGameStore((s) => s.resetGame)

  const gamesCompleted          = useSettingsStore((s) => s.gamesCompleted)
  const ratingState             = useSettingsStore((s) => s.ratingState)
  const incrementGamesCompleted = useSettingsStore((s) => s.incrementGamesCompleted)

  // ─── Local state ─────────────────────────────────────────────────────────
  const [guessAnswered, setGuessAnswered] = useState(false)
  const [guessCorrect, setGuessCorrect]   = useState<boolean | null>(null)
  const [showRating, setShowRating]       = useState(false)

  // ─── Derived ─────────────────────────────────────────────────────────────
  const result          = lastVoteResult
  const caught          = result?.impostersCaught ?? false
  const firstImposterId = imposterIds[0] ?? ''
  const imposterPlayer  = players.find((p) => p.id === firstImposterId)
  const imposterName    = imposterPlayer?.name ?? '?'

  // Determine final outcome:
  // • Escaped → imposter wins immediately
  // • Caught → wait for guess prompt answer
  const finalOutcome: 'crew_wins' | 'imposter_wins' | 'tie' | null = (() => {
    if (!result) return null
    if (!caught) return 'imposter_wins'
    if (!guessAnswered) return null
    return guessCorrect ? 'imposter_wins' : 'crew_wins'
  })()

  // ─── F13.5: Increment gamesCompleted once on mount ───────────────────────
  useEffect(() => {
    incrementGamesCompleted()
  }, [])

  // ─── F13.6: Show rating modal on 3rd game completion ─────────────────────
  useEffect(() => {
    if (ratingState === 'unseen' && gamesCompleted + 1 >= 3) {
      const timer = setTimeout(() => setShowRating(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  // ─── Haptics on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (caught) {
      haptics.success()
    } else {
      haptics.error()
    }
  }, [])

  // ─── Guess prompt ─────────────────────────────────────────────────────────
  const handleGuessYes = useCallback(() => {
    haptics.medium()
    setImposterGuess(true)
    setGuessCorrect(true)
    setGuessAnswered(true)
  }, [haptics, setImposterGuess])

  const handleGuessNo = useCallback(() => {
    haptics.medium()
    setImposterGuess(false)
    setGuessCorrect(false)
    setGuessAnswered(true)
  }, [haptics, setImposterGuess])

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handlePlayAgain = useCallback(() => {
    haptics.medium()
    nextRound()
    router.replace('/(game)/reveal' as never)
  }, [haptics, nextRound])

  const handleNewGame = useCallback(() => {
    haptics.light()
    resetGame()
    router.replace('/(main)/home' as never)
  }, [haptics, resetGame])

  const handleShare = useCallback(async () => {
    const outcomeMsg =
      finalOutcome === 'crew_wins'
        ? 'Crew wins! 🎉 The imposter was caught!'
        : `Imposter wins! 🕵️ ${imposterName} got away!`

    try {
      await Share.share({
        message: `Who's the Imposter? — ${outcomeMsg} Secret word: "${secretWord}" 🎭`,
      })
    } catch {
      // share dismissed — no-op
    }
  }, [finalOutcome, imposterName, secretWord])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg.primary }]} edges={['top', 'bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Banner: headline + info card + confetti ── */}
        <ResultBanner
          caught={caught}
          imposterName={imposterName}
          secretWord={secretWord}
          finalOutcome={finalOutcome}
        />

        {/* ── Guess prompt (only when imposter caught, before answer) ── */}
        {caught && !guessAnswered && (
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={[
              s.guessCard,
              { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
            ]}
          >
            <Text style={[s.guessQuestion, { color: theme.text.primary }]}>
              {t('result.guessPrompt', { name: imposterName })}
            </Text>
            <Text style={[s.guessWordHint, { color: theme.text.muted }]}>
              "{secretWord}"
            </Text>
            <View style={s.guessButtons}>
              <Pressable
                onPress={handleGuessYes}
                style={[s.guessBtn, { backgroundColor: theme.status.success }]}
              >
                <Text style={[s.guessBtnText, { color: '#FFFFFF' }]}>
                  {t('result.guessYes')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleGuessNo}
                style={[
                  s.guessBtn,
                  { backgroundColor: theme.bg.elevated, borderColor: theme.border.default, borderWidth: 1 },
                ]}
              >
                <Text style={[s.guessBtnText, { color: theme.text.secondary }]}>
                  {t('result.guessNo')}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* ── Actions (visible once outcome determined) ── */}
        {finalOutcome !== null && (
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={s.actions}
          >
            <Pressable
              onPress={handlePlayAgain}
              style={[s.actionBtn, { backgroundColor: theme.accent.primary }]}
            >
              <Text style={[s.actionBtnText, { color: theme.text.onPrimary }]}>
                {t('result.playAgain')}
              </Text>
            </Pressable>

            <View style={s.secondaryRow}>
              <Pressable
                onPress={handleNewGame}
                style={[
                  s.secondaryBtn,
                  { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
                ]}
              >
                <Text style={[s.secondaryBtnText, { color: theme.text.secondary }]}>
                  {t('result.newGame')}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={[
                  s.secondaryBtn,
                  { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
                ]}
              >
                <Text style={[s.secondaryBtnText, { color: theme.text.secondary }]}>
                  {t('result.share')}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>

      {/* ── F13.6: Rating modal on 3rd game ── */}
      <RatingModal visible={showRating} onClose={() => setShowRating(false)} />
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },

  scroll: { flex: 1 },

  content: {
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },

  guessCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },

  guessQuestion: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
    textAlign: 'center',
  },

  guessWordHint: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.display,
    textAlign: 'center',
  },

  guessButtons: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  guessBtn: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  guessBtnText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyBold,
  },

  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  actionBtn: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionBtnText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
  },

  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryBtnText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyMedium,
  },

  bottomSpacer: {
    height: spacing.xl,
  },
})
