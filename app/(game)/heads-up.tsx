import { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { getGameModeById } from '@/data/games'
import { useGameStore } from '@/store/gameStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { headsUpLogic, HeadsUpRoundResult } from '@/logic/games/headsUp'
import { charadesLogic } from '@/logic/games/charades'
import { Button } from '@/components/ui/Button'
import type { GameModeId } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// HEADS UP / CHARADES SCREEN — F16.3
// Both games show a word + timer + two big buttons (Correct / Pass).
// expo-sensors not in project, so we use button-based interaction.
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'ready' | 'playing' | 'result' | 'done' | 'empty'
type ActionEntry = { word: string; action: 'correct' | 'skip' }

export default function HeadsUpScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const mode = useGameStore((s) => s.mode)
  const players = useGameStore((s) => s.players)
  const selectedCategories = useGameStore((s) => s.selectedCategories)
  const storeTimer = useGameStore((s) => s.timerSeconds)
  // 0 means "Off" in setup, fall back to logic default for heads-up / charades
  const ROUND_SECONDS = storeTimer > 0 ? storeTimer : headsUpLogic.defaultTimerSeconds
  const locale = useSettingsStore((s) => s.language)

  const isCharades = mode === 'charades'

  // ── Game state ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('ready')
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [wordPool, setWordPool] = useState<string[]>([])
  const [currentWordIdx, setCurrentWordIdx] = useState(0)
  const [actions, setActions] = useState<ActionEntry[]>([])
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [roundResult, setRoundResult] = useState<HeadsUpRoundResult | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentPlayer = players[currentPlayerIdx]

  // ── Timer ─────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    setTimeLeft(ROUND_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  // When timer hits 0, end the round
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      endRound()
    }
  }, [timeLeft, phase])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  // ── Animations ────────────────────────────────────────────────────────────
  const cardScale = useSharedValue(1)
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }))
  const correctScale = useSharedValue(1)
  const correctStyle = useAnimatedStyle(() => ({ transform: [{ scale: correctScale.value }] }))
  const passScale = useSharedValue(1)
  const passStyle = useAnimatedStyle(() => ({ transform: [{ scale: passScale.value }] }))

  // ── Handlers ─────────────────────────────────────────────────────────────
  const buildPool = useCallback(() => {
    const logic = isCharades ? charadesLogic : headsUpLogic
    return logic.buildRoundPool(locale, usedWords, selectedCategories)
  }, [isCharades, locale, usedWords, selectedCategories])

  const handleStartRound = useCallback(() => {
    haptics.medium()
    const pool = buildPool()
    if (pool.length === 0) {
      setPhase('empty')
      return
    }
    setWordPool(pool)
    setCurrentWordIdx(0)
    setActions([])
    setPhase('playing')
    startTimer()
  }, [haptics, buildPool, startTimer])

  const handleAction = useCallback(
    (actionType: 'correct' | 'skip') => {
      const currentWord = wordPool[currentWordIdx]
      if (!currentWord) return

      haptics[actionType === 'correct' ? 'success' : 'light']()

      cardScale.value = withSequence(
        withSpring(0.93, { damping: 15 }),
        withSpring(1, { damping: 15 }),
      )

      setActions((prev) => [...prev, { word: currentWord, action: actionType }])
      setUsedWords((prev) => [...prev, currentWord])
      setCurrentWordIdx((prev) => prev + 1)
    },
    [haptics, cardScale, wordPool, currentWordIdx],
  )

  const endRound = useCallback(() => {
    stopTimer()
    const playerId = currentPlayer?.id ?? ''
    const result = headsUpLogic.resolveRound(
      playerId,
      actions.map(({ word, action }) => ({
        word,
        action: action === 'skip' ? 'skip' : 'correct',
      })),
    )
    setRoundResult(result)
    setScores((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] ?? 0) + result.correct,
    }))
    setPhase('result')
  }, [stopTimer, currentPlayer, actions])

  const handleNextPlayer = useCallback(() => {
    haptics.selection()
    const nextIdx = currentPlayerIdx + 1
    if (nextIdx >= players.length) {
      setPhase('done')
      return
    }
    setCurrentPlayerIdx(nextIdx)
    setRoundResult(null)
    setActions([])
    setPhase('ready')
  }, [haptics, currentPlayerIdx, players.length])

  const handleEndGame = useCallback(() => {
    stopTimer()
    router.replace('/(main)/home' as never)
  }, [stopTimer])

  const gameMode = getGameModeById(mode as GameModeId)
  const currentWord = wordPool[currentWordIdx] ?? '—'

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleEndGame}
          style={[styles.homeBtn, { backgroundColor: theme.bg.surface }]}
          accessibilityRole="button"
        >
          <Ionicons name="home" size={20} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
          {gameMode ? t(gameMode.nameKey) : mode}
        </Text>
        <View style={styles.homeBtn} />
      </View>

      {/* Content by phase */}
      {phase === 'ready' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          <View style={[styles.playerAvatar, { backgroundColor: currentPlayer?.color ?? theme.accent.primary }]}>
            <Text style={[styles.playerAvatarText, { fontFamily: fontFamily.displayBold, color: theme.game.cardText }]}>
              {currentPlayer?.initials ?? '?'}
            </Text>
          </View>
          <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('headsUp.readyTitle')}
          </Text>
          <Text style={[styles.subText, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
            {t('headsUp.yourTurn', { name: currentPlayer?.name ?? '?' })}
          </Text>
          <Text style={[styles.hintText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
            {t('headsUp.readySubtitle')}
          </Text>
          <Button variant="primary" size="lg" onPress={handleStartRound}>
            {t('headsUp.startTimer')}
          </Button>
        </Animated.View>
      )}

      {phase === 'empty' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          <Text style={styles.resultEmoji}>🧩</Text>
          <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('headsUp.emptyTitle')}
          </Text>
          <Text style={[styles.subText, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
            {t('headsUp.emptySubtitle')}
          </Text>
          <Button variant="primary" size="lg" onPress={handleEndGame}>
            {t('headsUp.endGame')}
          </Button>
        </Animated.View>
      )}

      {phase === 'playing' && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.playingContent}>
          {/* Timer */}
          <View style={[styles.timerRing, {
            borderColor: timeLeft <= 10 ? theme.status.error : theme.accent.primary,
          }]}>
            <Text style={[styles.timerText, {
              color: timeLeft <= 10 ? theme.status.error : theme.text.primary,
              fontFamily: fontFamily.displayBold,
            }]}>
              {timeLeft}
            </Text>
          </View>

          {/* Word card */}
          <Animated.View
            style={[styles.wordCard, cardStyle, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
          >
            <Text style={[styles.wordText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
              {currentWord}
            </Text>
          </Animated.View>

          {/* Score indicator */}
          <Text style={[styles.scoreText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
            {t('headsUp.score', { count: actions.filter((a) => a.action === 'correct').length })}
          </Text>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Animated.View style={[passStyle, styles.actionBtn]}>
              <TouchableOpacity
                onPress={() => handleAction('skip')}
                style={[styles.passBtn, { backgroundColor: theme.bg.elevated, borderColor: theme.border.default }]}
                accessibilityRole="button"
              >
                <Text style={[styles.actionBtnText, { color: theme.text.secondary, fontFamily: fontFamily.displayBold }]}>
                  {t('headsUp.pass')}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[correctStyle, styles.actionBtn]}>
              <TouchableOpacity
                onPress={() => handleAction('correct')}
                style={[styles.correctBtn, { backgroundColor: theme.status.success }]}
                accessibilityRole="button"
              >
                <Text style={[styles.actionBtnText, { color: theme.game.cardText, fontFamily: fontFamily.displayBold }]}>
                  {t('headsUp.correct')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {phase === 'result' && roundResult && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          <Text style={[styles.resultEmoji]}>{roundResult.correct > 0 ? '🎉' : '😅'}</Text>
          <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('headsUp.score', { count: roundResult.correct })}
          </Text>
          <Text style={[styles.subText, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
            {currentPlayer?.name ?? ''}
          </Text>

          {/* Word list */}
          <View style={[styles.wordList, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            {roundResult.words.map((w, i) => (
              <View key={i} style={styles.wordRow}>
                <Text style={{ fontSize: 16 }}>{w.result === 'correct' ? '✅' : '⏩'}</Text>
                <Text style={[styles.wordRowText, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                  {w.word}
                </Text>
              </View>
            ))}
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleNextPlayer}
          >
            {currentPlayerIdx + 1 < players.length ? t('headsUp.nextPlayer') : t('headsUp.endGame')}
          </Button>
        </Animated.View>
      )}

      {phase === 'done' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('scoreboard.final')}
          </Text>
          <View style={[styles.wordList, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            {[...players]
              .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
              .map((p, i) => (
                <View key={p.id} style={styles.wordRow}>
                  <Text style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</Text>
                  <Text style={[styles.wordRowText, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}>
                    {p.name}
                  </Text>
                  <Text style={[{ color: theme.accent.primary, fontFamily: fontFamily.displayBold, marginLeft: 'auto' as never }]}>
                    {scores[p.id] ?? 0}
                  </Text>
                </View>
              ))}
          </View>
          <Button variant="primary" size="lg" onPress={handleEndGame}>
            {t('headsUp.endGame')}
          </Button>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  homeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
    flex: 1,
    textAlign: 'center',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  playerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    fontSize: fontSize.xl,
  },
  bigText: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  hintText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.5,
  },
  resultEmoji: {
    fontSize: 64,
  },
  playingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  timerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
  },
  wordCard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  wordText: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: fontSize.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
  passBtn: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctBtn: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  wordList: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 260,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wordRowText: {
    fontSize: fontSize.md,
  },
})
