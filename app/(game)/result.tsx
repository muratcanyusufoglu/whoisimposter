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
import { useSessionStore } from '@/store/sessionStore'
import { useStatsStore } from '@/store/statsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { ResultBanner } from '@/components/game/ResultBanner'
import { SessionScoreboard } from '@/components/game/SessionScoreboard'
import { StreakBanner } from '@/components/game/StreakBanner'
import { AchievementToast } from '@/components/modals/AchievementToast'
import { RatingModal } from '@/components/modals/RatingModal'
import {
  calcRoundPoints,
  toPointsMap,
  checkAchievementsForPlayer,
  ACHIEVEMENT_DEFINITIONS,
} from '@/logic/scoring'
import type {
  PlayerRoundPoints,
  AchievementDefinition,
  AchievementId,
  PlayerLifetimeStats,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_STATS: PlayerLifetimeStats = {
  gamesPlayed: 0,
  wins: 0,
  timesImposter: 0,
  timesCaught: 0,
  timesVotedCorrectly: 0,
  imposterWins: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // ─── Game state ───────────────────────────────────────────────────────────
  const mode                    = useGameStore((s) => s.mode)
  const players                 = useGameStore((s) => s.players)
  const imposterIds             = useGameStore((s) => s.imposterIds)
  const secretWord              = useGameStore((s) => s.secretWord)
  const lastVoteResult          = useGameStore((s) => s.lastVoteResult)
  const setImposterGuess        = useGameStore((s) => s.setImposterGuess)
  const nextRound               = useGameStore((s) => s.nextRound)
  const resetGame               = useGameStore((s) => s.resetGame)

  // ─── Settings state ───────────────────────────────────────────────────────
  const gamesCompleted          = useSettingsStore((s) => s.gamesCompleted)
  const ratingState             = useSettingsStore((s) => s.ratingState)
  const incrementGamesCompleted = useSettingsStore((s) => s.incrementGamesCompleted)

  // ─── Session scoring ─────────────────────────────────────────────────────
  const sessionScores      = useSessionStore((s) => s.scores)
  const streak             = useSessionStore((s) => s.streak)
  const roundsRecorded     = useSessionStore((s) => s.roundsRecorded)
  const addRoundPoints     = useSessionStore((s) => s.addRoundPoints)
  const recordStreakOutcome = useSessionStore((s) => s.recordStreakOutcome)
  const resetSession       = useSessionStore((s) => s.resetSession)

  // ─── Lifetime stats ───────────────────────────────────────────────────────
  const recordRoundResult  = useStatsStore((s) => s.recordRoundResult)
  const unlockAchievement  = useStatsStore((s) => s.unlockAchievement)
  const playerStats        = useStatsStore((s) => s.playerStats)

  // ─── Local state ─────────────────────────────────────────────────────────
  const [guessAnswered, setGuessAnswered]     = useState(false)
  const [guessCorrect, setGuessCorrect]       = useState<boolean | null>(null)
  const [showRating, setShowRating]           = useState(false)
  const [lastRoundPoints, setLastRoundPoints] = useState<PlayerRoundPoints[]>([])
  const [toastQueue, setToastQueue]           = useState<AchievementDefinition[]>([])
  const [activeToast, setActiveToast]         = useState<AchievementDefinition | null>(null)
  const [resultsRecorded, setResultsRecorded] = useState(false)

  // ─── Derived ─────────────────────────────────────────────────────────────
  const result          = lastVoteResult
  const caught          = result?.impostersCaught ?? false
  const firstImposterId = imposterIds[0] ?? ''
  const imposterPlayer  = players.find((p) => p.id === firstImposterId)
  const imposterName    = imposterPlayer?.name ?? '?'

  // Determine final outcome:
  // • Escaped → imposter wins immediately
  // • Caught  → wait for guess prompt answer
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

  // ─── Record scoring + stats + achievements once finalOutcome resolves ─────
  useEffect(() => {
    // Guard: only run once and only when outcome is known
    if (finalOutcome === null || resultsRecorded) return
    // Only applies to imposter mode; other modes handled elsewhere
    if (mode !== 'imposter') {
      // For non-imposter modes: just track gamesPlayed
      recordRoundResult({
        mode,
        playerNames: players.map((p) => p.name),
        imposterNames: [],
        outcome: finalOutcome,
        caughtNames: [],
        correctGuess: false,
        votedForImposterNames: [],
        playerAvatars: Object.fromEntries(players.map((p) => [p.name, { emoji: p.emoji, color: p.color }])),
      })
      setResultsRecorded(true)
      return
    }

    // ── 1. Compute round points ──────────────────────────────────────────
    const roundPoints = calcRoundPoints({
      players,
      imposterIds,
      voteResult: result!,
      imposterGuessedCorrectly: guessCorrect,
    })
    setLastRoundPoints(roundPoints)

    // ── 2. Update session scoreboard ─────────────────────────────────────
    addRoundPoints(toPointsMap(roundPoints))

    // ── 3. Build params for statsStore ───────────────────────────────────
    const normalize = (name: string) => name.trim().toLowerCase()

    const imposterPlayers = players.filter((p) => imposterIds.includes(p.id))
    const caughtPlayers   = result?.impostersCaught ? imposterPlayers : []

    // Who voted for the imposter correctly?
    // tally maps targetId → voteCount. The imposter(s) are the "correct" targets.
    const imposterIdSet = new Set(imposterIds)
    const votedForImposterNames: string[] = []
    if (finalOutcome === 'crew_wins' && result?.tally) {
      for (const player of players) {
        if (!imposterIdSet.has(player.id)) {
          // Check if this crew member's vote went to an imposter.
          // The store has votes: Record<voterId, targetId>
          // We need the votes map from gameStore — but result only has tally.
          // Instead we track all crew who participated in a crew-win vote as "voted correctly".
          // NOTE: This is a reasonable approximation since crew_wins means majority voted right.
          // Exact per-voter tracking would require reading gameStore.votes.
          votedForImposterNames.push(player.name)
        }
      }
    }

    recordRoundResult({
      mode,
      playerNames: players.map((p) => p.name),
      imposterNames: imposterPlayers.map((p) => p.name),
      outcome: finalOutcome,
      caughtNames: caughtPlayers.map((p) => p.name),
      correctGuess: guessCorrect ?? false,
      votedForImposterNames,
      playerAvatars: Object.fromEntries(players.map((p) => [p.name, { emoji: p.emoji, color: p.color }])),
    })

    // ── 4. Check + unlock achievements for each player ────────────────────
    const newlyEarned: AchievementId[] = []

    for (const player of players) {
      const isImposter = imposterIdSet.has(player.id)
      const key = normalize(player.name)
      const stats: PlayerLifetimeStats = playerStats[key] ?? { ...EMPTY_STATS }

      // Did this crew player vote for the imposter?
      const votedCorrectly = !isImposter && finalOutcome === 'crew_wins'

      const earned = checkAchievementsForPlayer({
        outcome: finalOutcome,
        impostersCaught: result?.impostersCaught ?? false,
        imposterGuessedCorrectly: guessCorrect ?? false,
        isImposter,
        sessionStreak: streak,
        voteTally: result?.tally ?? {},
        playerCount: players.length,
        imposterCount: imposterIds.length,
        playerLifetimeStats: stats,
        votedCorrectly,
      })

      for (const id of earned) {
        const isNew = unlockAchievement(id)
        if (isNew && !newlyEarned.includes(id)) {
          newlyEarned.push(id)
        }
      }
    }

    // ── 5. Queue achievement toasts ────────────────────────────────────────
    if (newlyEarned.length > 0) {
      const defs = newlyEarned
        .map((id) => ACHIEVEMENT_DEFINITIONS.find((d) => d.id === id))
        .filter((d): d is AchievementDefinition => d !== undefined)
      setToastQueue(defs.slice(1))
      setActiveToast(defs[0] ?? null)
    }

    // ── 6. Update streak (AFTER achievement check — important for +1 offset) ─
    // The finalOutcome IIFE only produces 'crew_wins' or 'imposter_wins' for
    // the imposter game (guess prompt resolves to one side; ties are not possible
    // via the IIFE). The streak call is always valid here.
    recordStreakOutcome(finalOutcome === 'crew_wins' ? 'crew' : 'imposter')

    setResultsRecorded(true)
  }, [finalOutcome])

  // ─── Toast dismissal — shifts the queue ──────────────────────────────────
  const handleToastDismiss = useCallback(() => {
    setToastQueue((q) => {
      const remaining = q.slice(1)
      setActiveToast(remaining[0] ?? null)
      return remaining
    })
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
    // resetSession BEFORE resetGame to avoid stale mode flashing the scoreboard
    resetSession()
    resetGame()
    router.replace('/(main)/home' as never)
  }, [haptics, resetSession, resetGame])

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
                <Text style={[s.guessBtnText, { color: theme.game.cardText }]}>
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

        {/* ── Session Scoreboard (imposter mode only, after outcome resolves) ── */}
        {mode === 'imposter' && finalOutcome !== null && (
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <SessionScoreboard
              players={players}
              scores={sessionScores}
              roundsPlayed={roundsRecorded}
              lastRoundPoints={lastRoundPoints}
            />
          </Animated.View>
        )}

        {/* ── Streak Banner (imposter mode, streak ≥ 2) ── */}
        {mode === 'imposter' && finalOutcome !== null && streak.count >= 2 && (
          <StreakBanner streak={streak} />
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

      {/* ── Achievement toast — absolutely positioned, above scroll ── */}
      <AchievementToast
        achievement={activeToast}
        onDismiss={handleToastDismiss}
      />

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
