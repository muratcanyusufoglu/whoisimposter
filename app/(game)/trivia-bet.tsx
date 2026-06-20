import { useState, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabletFrame } from '@/components/layout/TabletFrame'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import {
  triviaBetLogic,
  TriviaQuestion,
  TriviaBetState,
  STARTING_TOKENS,
  MIN_BET,
} from '@/logic/games/triviaBet'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'

// ─────────────────────────────────────────────────────────────────────────────
// TRIVIA BET SCREEN — F16.5
// Players bet tokens, choose an answer, reveal, distribute/collect.
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'betting' | 'answering' | 'reveal' | 'done'

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

export default function TriviaBetScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players = useGameStore((s) => s.players)
  const locale = useSettingsStore((s) => s.language)

  const playerIds = players.map((p) => p.id)

  // ── Game state ─────────────────────────────────────────────────────────
  const [triviaState, setTriviaState] = useState<TriviaBetState>(
    triviaBetLogic.createInitialState(playerIds),
  )
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null)
  const [phase, setPhase] = useState<Phase>('betting')
  const [bets, setBets] = useState<Record<string, number>>({})
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [revealDeltas, setRevealDeltas] = useState<Record<string, number>>({})
  const [questionNumber, setQuestionNumber] = useState(1)
  // Sequential answering: only the current player sees the options (pass-the-phone)
  // so nobody can copy another player's answer.
  const [answererIndex, setAnswererIndex] = useState(0)
  const [showHandoff, setShowHandoff] = useState(true)

  // ── Animations ────────────────────────────────────────────────────────
  const btnScale = useSharedValue(1)
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

  // ── Helpers ───────────────────────────────────────────────────────────
  const activePlayers = useMemo(
    () =>
      typeof triviaBetLogic.getActivePlayers === 'function'
        ? triviaBetLogic.getActivePlayers(triviaState.tokens)
        : Object.entries(triviaState.tokens)
            .filter(([, v]) => v > 0)
            .map(([id]) => id),
    [triviaState.tokens],
  )
  const leaders = useMemo(
    () =>
      typeof triviaBetLogic.getLeaders === 'function'
        ? triviaBetLogic.getLeaders(triviaState.tokens)
        : [],
    [triviaState.tokens],
  )

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLoadQuestion = useCallback(() => {
    haptics.medium()
    const q = triviaBetLogic.getNextQuestion(locale, triviaState.usedQuestionIds)
    // Reset bets to 1 for active players
    const defaultBets: Record<string, number> = {}
    activePlayers.forEach((id) => (defaultBets[id] = MIN_BET))
    setBets(defaultBets)
    setAnswers({})
    setRevealDeltas({})
    setCurrentQuestion(q)
    setTriviaState((prev) => ({
      ...prev,
      usedQuestionIds: [...prev.usedQuestionIds, q.id],
      roundNumber: prev.roundNumber + 1,
    }))
    setPhase('betting')
  }, [haptics, locale, triviaState.usedQuestionIds, activePlayers])

  const handleStartAnswering = useCallback(() => {
    haptics.medium()
    setAnswererIndex(0)
    setShowHandoff(true)
    setPhase('answering')
  }, [haptics])

  const handleAnswer = useCallback(
    (playerId: string, optionIndex: number) => {
      haptics.selection()
      setAnswers((prev) => ({ ...prev, [playerId]: optionIndex }))
    },
    [haptics],
  )

  const handleReveal = useCallback(() => {
    if (!currentQuestion) return
    haptics.medium()

    const result = triviaBetLogic.resolveRound(
      currentQuestion,
      bets,
      answers,
      triviaState.tokens,
    )
    const newTokens = triviaBetLogic.applyTokenDeltas(triviaState.tokens, result.tokenDeltas)

    setRevealDeltas(result.tokenDeltas)
    setTriviaState((prev) => ({ ...prev, tokens: newTokens }))
    setPhase('reveal')
  }, [currentQuestion, haptics, bets, answers, triviaState.tokens])

  // Lock in the current player's answer and pass to the next, or reveal if last.
  const handleLockAnswer = useCallback(() => {
    haptics.selection()
    if (answererIndex + 1 < activePlayers.length) {
      setAnswererIndex((i) => i + 1)
      setShowHandoff(true)
    } else {
      handleReveal()
    }
  }, [haptics, answererIndex, activePlayers.length, handleReveal])

  const handleNextOrDone = useCallback(() => {
    haptics.selection()
    btnScale.value = withSequence(withSpring(0.95), withSpring(1))

    const newActive =
      typeof triviaBetLogic.getActivePlayers === 'function'
        ? triviaBetLogic.getActivePlayers(triviaState.tokens)
        : Object.entries(triviaState.tokens)
            .filter(([, v]) => v > 0)
            .map(([id]) => id)
    if (newActive.length <= 1 || questionNumber >= 10) {
      setPhase('done')
      return
    }
    setQuestionNumber((n) => n + 1)
    handleLoadQuestion()
  }, [haptics, btnScale, triviaState.tokens, questionNumber, handleLoadQuestion])

  const handleEndGame = useCallback(() => {
    router.replace('/(main)/home' as never)
  }, [])

  // ── Render helpers ────────────────────────────────────────────────────
  const playerById = (id: string) => players.find((p) => p.id === id)

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      <TabletFrame>
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
          {t('triviaBet.title')}
        </Text>
        <Text style={[styles.qNumber, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
          {t('triviaBet.question', { number: questionNumber })}
        </Text>
      </View>

      {/* Token scoreboard — always visible */}
      <View style={[styles.tokenBar, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
        {players.map((p) => (
          <View key={p.id} style={styles.tokenItem}>
            <View style={[styles.tokenDot, { backgroundColor: p.color }]} />
            <Text style={[styles.tokenName, { color: theme.text.secondary, fontFamily: fontFamily.body }]} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={[styles.tokenCount, { color: theme.accent.primary, fontFamily: fontFamily.displayBold }]}>
              {triviaState.tokens[p.id] ?? 0}
            </Text>
          </View>
        ))}
      </View>

      {/* — No question loaded yet — */}
      {currentQuestion === null && phase !== 'done' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          <Text style={styles.gameEmoji}>🧠</Text>
          <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('triviaBet.title')}
          </Text>
          <Animated.View style={[btnStyle, styles.fullWidth]}>
            <Button variant="primary" size="lg" onPress={handleLoadQuestion}>
              {t('triviaBet.question', { number: 1 })} →
            </Button>
          </Animated.View>
        </Animated.View>
      )}

      {/* — Betting phase — */}
      {currentQuestion !== null && phase === 'betting' && (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionLabel, { color: theme.text.muted, fontFamily: fontFamily.bodyMedium }]}>
            {t('triviaBet.yourBet')}
          </Text>
          {activePlayers.map((id) => {
            const p = playerById(id)
            if (!p) return null
            return (
              <View key={id} style={[styles.betRow, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                <View style={styles.betRowTop}>
                  <View style={[styles.betDot, { backgroundColor: p.color }]} />
                  <Text style={[styles.betName, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.betValue, { color: theme.accent.primary, fontFamily: fontFamily.displayBold }]}>
                    {bets[id] ?? MIN_BET}
                  </Text>
                  <Text style={[styles.maxLabel, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                    /{triviaState.tokens[id] ?? 0}
                  </Text>
                </View>
                <Slider
                  value={bets[id] ?? MIN_BET}
                  min={MIN_BET}
                  max={Math.max(MIN_BET, triviaState.tokens[id] ?? MIN_BET)}
                  onChange={(v) => setBets((prev) => ({ ...prev, [id]: v }))}
                  color={p.color}
                  trackColor={theme.bg.elevated}
                />
              </View>
            )
          })}
          <View style={styles.ctaArea}>
            <Button variant="primary" size="lg" onPress={handleStartAnswering}>
              {t('triviaBet.placeBet')}
            </Button>
          </View>
        </ScrollView>
      )}

      {/* — Answering phase (sequential & private: pass the phone) — */}
      {currentQuestion !== null && phase === 'answering' && (() => {
        const currentId = activePlayers[answererIndex]
        const cp = currentId ? playerById(currentId) : null
        if (!cp) return null
        const isLast = answererIndex >= activePlayers.length - 1

        // Handoff cover — hides the previous player's pick before the next plays.
        if (showHandoff) {
          return (
            <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
              <View style={[styles.handoffDot, { backgroundColor: cp.color }]} />
              <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                {t('promptGame.playerTurn', { name: cp.name })}
              </Text>
              <Text style={[styles.handoffHint, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                {t('reveal.instruction')}
              </Text>
              <View style={styles.fullWidth}>
                <Button variant="primary" size="lg" onPress={() => { haptics.medium(); setShowHandoff(false) }}>
                  {t('headsUp.startTimer')}
                </Button>
              </View>
            </Animated.View>
          )
        }

        const chosen = answers[currentId]
        return (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.answerPlayer}>
              <View style={[styles.betDot, { backgroundColor: cp.color }]} />
              <Text style={[styles.betName, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>{cp.name}</Text>
            </View>
            <View style={[styles.questionCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <Text style={[styles.questionText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                {currentQuestion.question}
              </Text>
            </View>
            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((opt, idx) => {
                const selected = chosen === idx
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleAnswer(currentId, idx)}
                    style={[
                      styles.optionBtn,
                      {
                        backgroundColor: selected ? theme.accent.primary : theme.bg.elevated,
                        borderColor: selected ? theme.accent.primary : theme.border.default,
                      },
                    ]}
                  >
                    <Text style={[styles.optionLabel, { color: selected ? theme.text.onPrimary : theme.text.muted, fontFamily: fontFamily.bodyBold }]}>
                      {OPTION_LABELS[idx]}
                    </Text>
                    <Text style={[styles.optionText, { color: selected ? theme.text.onPrimary : theme.text.secondary, fontFamily: fontFamily.body }]} numberOfLines={2}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View style={styles.ctaArea}>
              <Button variant="primary" size="lg" disabled={chosen === undefined} onPress={handleLockAnswer}>
                {isLast ? t('triviaBet.reveal') : t('reveal.next')}
              </Button>
            </View>
          </ScrollView>
        )
      })()}

      {/* — Reveal phase — */}
      {currentQuestion !== null && phase === 'reveal' && (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.questionCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.questionText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
              {currentQuestion.question}
            </Text>
          </View>

          {/* Options with correct highlighted */}
          <View style={styles.optionsGrid}>
            {currentQuestion.options.map((opt, idx) => {
              const isCorrect = idx === currentQuestion.correctIndex
              return (
                <View
                  key={idx}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: isCorrect ? theme.status.success : theme.bg.elevated,
                      borderColor: isCorrect ? theme.status.success : theme.border.subtle,
                    },
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: isCorrect ? theme.game.cardText : theme.text.muted, fontFamily: fontFamily.bodyBold }]}>
                    {OPTION_LABELS[idx]}
                  </Text>
                  <Text style={[styles.optionText, { color: isCorrect ? theme.game.cardText : theme.text.secondary, fontFamily: fontFamily.body }]}>
                    {opt}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Per-player result */}
          {activePlayers.map((id) => {
            const p = playerById(id)
            if (!p) return null
            const delta = revealDeltas[id] ?? 0
            const isWin = delta > 0
            return (
              <View key={id} style={[styles.resultRow, {
                backgroundColor: isWin ? (theme.status.success + '22') : (theme.status.error + '22'),
                borderColor: isWin ? theme.status.success : theme.status.error,
              }]}>
                <View style={[styles.betDot, { backgroundColor: p.color }]} />
                <Text style={[styles.betName, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}>{p.name}</Text>
                <Text style={[styles.deltaText, {
                  color: isWin ? theme.status.success : theme.status.error,
                  fontFamily: fontFamily.displayBold,
                  marginLeft: 'auto' as never,
                }]}>
                  {delta > 0 ? `+${delta}` : delta}
                </Text>
              </View>
            )
          })}

          <Animated.View style={[btnStyle, styles.ctaArea]}>
            <Button variant="primary" size="lg" onPress={handleNextOrDone}>
              {questionNumber < 10 ? t('triviaBet.nextQuestion') : t('triviaBet.endGame')}
            </Button>
          </Animated.View>
        </ScrollView>
      )}

      {/* — Done — */}
      {phase === 'done' && (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.centeredScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.gameEmoji}>🏆</Text>
          <Text style={[styles.bigText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('triviaBet.leaderboard')}
          </Text>
          <View style={[styles.leaderboard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            {[...players]
              .sort((a, b) => (triviaState.tokens[b.id] ?? 0) - (triviaState.tokens[a.id] ?? 0))
              .map((p, i) => (
                <View key={p.id} style={styles.leaderRow}>
                  <Text style={{ fontSize: 20 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</Text>
                  <Text style={[styles.leaderName, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}>{p.name}</Text>
                  <Text style={[styles.leaderTokens, { color: theme.accent.primary, fontFamily: fontFamily.displayBold }]}>
                    {t('triviaBet.tokens', { count: triviaState.tokens[p.id] ?? 0 })}
                  </Text>
                </View>
              ))}
          </View>
          <Button variant="primary" size="lg" onPress={handleEndGame}>
            {t('triviaBet.endGame')}
          </Button>
        </ScrollView>
      )}
      </TabletFrame>
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
  qNumber: {
    fontSize: fontSize.sm,
    minWidth: 64,
    textAlign: 'right',
  },
  tokenBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 70,
  },
  tokenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tokenName: {
    fontSize: fontSize.xs,
    flex: 1,
  },
  tokenCount: {
    fontSize: fontSize.sm,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  handoffDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  handoffHint: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  centeredScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  gameEmoji: {
    fontSize: 56,
  },
  bigText: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  betRow: {
    gap: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  betRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  betDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  betName: {
    flex: 1,
    fontSize: fontSize.md,
  },
  betBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  betBtnText: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl,
  },
  betValue: {
    fontSize: fontSize.lg,
    minWidth: 28,
    textAlign: 'center',
  },
  maxLabel: {
    fontSize: fontSize.sm,
    minWidth: 24,
  },
  questionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xs,
  },
  questionText: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.4,
    textAlign: 'center',
  },
  answerSection: {
    gap: spacing.xs,
  },
  answerPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chosenBadge: {
    fontSize: fontSize.sm,
    marginLeft: 'auto' as never,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: '44%',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  optionLabel: {
    fontSize: fontSize.sm,
    width: 20,
    textAlign: 'center',
  },
  optionText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: fontSize.sm * 1.3,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deltaText: {
    fontSize: fontSize.lg,
  },
  ctaArea: {
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'android' ? spacing.md : spacing.sm,
  },
  leaderboard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  leaderName: {
    flex: 1,
    fontSize: fontSize.md,
  },
  leaderTokens: {
    fontSize: fontSize.md,
  },
})
