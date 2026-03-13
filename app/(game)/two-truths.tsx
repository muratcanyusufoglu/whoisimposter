import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import {
  twoTruthsOneLieLogic,
  TwoTruthsSubmission,
  TwoTruthsVote,
} from '@/logic/games/twoTruthsOneLie'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// TWO TRUTHS ONE LIE SCREEN — F16.6
// Phase 1: Teller privately writes 3 statements and marks the lie
// Phase 2: Other players vote on which is the lie
// Phase 3: Reveal + score update
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'writing' | 'voting' | 'reveal' | 'done'

export default function TwoTruthsScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players = useGameStore((s) => s.players)

  // ── State ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('writing')
  const [tellerIndex, setTellerIndex] = useState(0)
  const [statements, setStatements] = useState<[string, string, string]>(['', '', ''])
  const [lieIndex, setLieIndex] = useState<0 | 1 | 2 | null>(null)
  const [displayedStatements, setDisplayedStatements] = useState<[string, string, string]>(['', '', ''])
  const [displayedLieIndex, setDisplayedLieIndex] = useState<0 | 1 | 2>(0)
  const [votes, setVotes] = useState<TwoTruthsVote[]>([])
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})

  const teller = players[tellerIndex]
  const nonTellers = players.filter((_, i) => i !== tellerIndex)
  const currentVoter = nonTellers[currentVoterIndex]

  // ── Animations ────────────────────────────────────────────────────────
  const btnScale = useSharedValue(1)
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleStatementChange = useCallback(
    (idx: 0 | 1 | 2, text: string) => {
      setStatements((prev) => {
        const next = [...prev] as [string, string, string]
        next[idx] = text
        return next
      })
    },
    [],
  )

  const canSubmit =
    statements.every((s) => s.trim().length > 0) && lieIndex !== null

  const handleSubmitStatements = useCallback(() => {
    if (!canSubmit || lieIndex === null) return
    haptics.medium()
    btnScale.value = withSequence(withSpring(0.95), withSpring(1))

    const submission: TwoTruthsSubmission = {
      playerId: teller.id,
      statements,
      lieIndex,
    }
    const { displayed, displayedLieIndex: dLieIdx } =
      twoTruthsOneLieLogic.shuffleStatements(statements, lieIndex)

    setDisplayedStatements(displayed)
    setDisplayedLieIndex(dLieIdx)
    setVotes([])
    setCurrentVoterIndex(0)
    setPhase('voting')
  }, [canSubmit, lieIndex, haptics, btnScale, teller, statements])

  const handleVote = useCallback(
    (guessIndex: 0 | 1 | 2) => {
      if (!currentVoter) return
      haptics.selection()
      const newVotes = [...votes, { voterId: currentVoter.id, guessIndex }]
      setVotes(newVotes)

      if (currentVoterIndex + 1 < nonTellers.length) {
        setCurrentVoterIndex((prev) => prev + 1)
      } else {
        // All voted
        const submission: TwoTruthsSubmission = {
          playerId: teller.id,
          statements: displayedStatements,
          lieIndex: displayedLieIndex,
        }
        const result = twoTruthsOneLieLogic.resolveRound(submission, newVotes, players)
        setScores((prev) => {
          const updated = { ...prev }
          Object.entries(result.scoreDeltas).forEach(([id, delta]) => {
            updated[id] = (updated[id] ?? 0) + delta
          })
          return updated
        })
        setPhase('reveal')
      }
    },
    [
      currentVoter,
      haptics,
      votes,
      currentVoterIndex,
      nonTellers.length,
      teller,
      displayedStatements,
      displayedLieIndex,
      players,
    ],
  )

  const handleNextTeller = useCallback(() => {
    haptics.selection()
    const nextTeller = twoTruthsOneLieLogic.getNextTellerIndex(tellerIndex, players.length)
    if (twoTruthsOneLieLogic.isGameComplete(nextTeller, players.length)) {
      setPhase('done')
      return
    }
    setTellerIndex(nextTeller)
    setStatements(['', '', ''])
    setLieIndex(null)
    setPhase('writing')
  }, [haptics, tellerIndex, players.length])

  const handleEndGame = useCallback(() => {
    router.replace('/(main)/home' as never)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────
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
          {t('twoTruths.title')}
        </Text>
        <Text style={[styles.progress, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
          {tellerIndex + 1}/{players.length}
        </Text>
      </View>

      {/* — Writing phase — */}
      {phase === 'writing' && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollPad} keyboardShouldPersistTaps="handled">
            {/* Teller badge */}
            <View style={[styles.tellerBadge, { backgroundColor: teller.color + '33', borderColor: teller.color }]}>
              <View style={[styles.dot, { backgroundColor: teller.color }]} />
              <Text style={[styles.tellerName, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                {teller.name}
              </Text>
            </View>

            <Text style={[styles.instruction, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
              {t('twoTruths.tellerInstruction')}
            </Text>

            {/* 3 statement inputs */}
            {([0, 1, 2] as const).map((idx) => (
              <View key={idx} style={styles.statementWrap}>
                <TextInput
                  value={statements[idx]}
                  onChangeText={(text) => handleStatementChange(idx, text)}
                  placeholder={t(`twoTruths.statement${(idx + 1) as 1 | 2 | 3}`)}
                  placeholderTextColor={theme.text.secondary}
                  multiline
                  style={[
                    styles.statementInput,
                    {
                      backgroundColor: theme.bg.surface,
                      borderColor:
                        lieIndex === idx ? theme.status.error : theme.border.subtle,
                      color: theme.text.primary,
                      fontFamily: fontFamily.body,
                    },
                  ]}
                  accessibilityLabel={t(`twoTruths.statement${(idx + 1) as 1 | 2 | 3}`)}
                />
                {/* Mark as lie button */}
                <TouchableOpacity
                  onPress={() => {
                    haptics.selection()
                    setLieIndex(idx)
                  }}
                  style={[
                    styles.lieBtn,
                    {
                      backgroundColor:
                        lieIndex === idx ? theme.status.error : theme.bg.elevated,
                      borderColor:
                        lieIndex === idx ? theme.status.error : theme.border.strong,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: lieIndex === idx }}
                >
                  <Text
                    style={[
                      styles.lieBtnText,
                      {
                        color: lieIndex === idx ? '#FFFFFF' : theme.text.secondary,
                        fontFamily: lieIndex === idx ? fontFamily.bodyBold : fontFamily.body,
                      },
                    ]}
                  >
                    {lieIndex === idx ? '🤥 LIE' : t('twoTruths.markLie')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <Animated.View style={[btnStyle, styles.ctaWrap]}>
              <Button
                variant="primary"
                size="lg"
                disabled={!canSubmit}
                onPress={handleSubmitStatements}
              >
                {t('twoTruths.submitStatements')}
              </Button>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* — Voting phase — */}
      {phase === 'voting' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          {currentVoter && (
            <>
              <View style={[styles.tellerBadge, { backgroundColor: currentVoter.color + '33', borderColor: currentVoter.color }]}>
                <View style={[styles.dot, { backgroundColor: currentVoter.color }]} />
                <Text style={[styles.tellerName, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                  {currentVoter.name}
                </Text>
              </View>
              <Text style={[styles.instruction, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {t('twoTruths.voting')}
              </Text>
            </>
          )}

          {displayedStatements.map((stmt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleVote(idx as 0 | 1 | 2)}
              style={[
                styles.voteCard,
                { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
              ]}
              accessibilityRole="button"
            >
              <Text style={[styles.voteNumber, { color: theme.text.muted, fontFamily: fontFamily.bodyBold }]}>
                #{idx + 1}
              </Text>
              <Text style={[styles.voteText, { color: theme.text.primary, fontFamily: fontFamily.body }]}>
                {stmt}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* — Reveal phase — */}
      {phase === 'reveal' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centeredContent}>
          <Text style={[styles.revealTitle, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('twoTruths.lieWas', { number: displayedLieIndex + 1 })}
          </Text>

          {displayedStatements.map((stmt, idx) => (
            <View
              key={idx}
              style={[
                styles.voteCard,
                {
                  backgroundColor:
                    idx === displayedLieIndex
                      ? (theme.status.error + '22')
                      : (theme.status.success + '11'),
                  borderColor:
                    idx === displayedLieIndex ? theme.status.error : theme.border.subtle,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{idx === displayedLieIndex ? '🤥' : '✅'}</Text>
              <Text style={[styles.voteText, { color: theme.text.primary, fontFamily: fontFamily.body }]}>
                {stmt}
              </Text>
            </View>
          ))}

          <Button variant="primary" size="lg" onPress={handleNextTeller}>
            {tellerIndex + 1 < players.length ? t('twoTruths.nextPlayer') : t('twoTruths.endGame')}
          </Button>
        </Animated.View>
      )}

      {/* — Done — */}
      {phase === 'done' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.centeredContent}>
          <Text style={{ fontSize: 56 }}>🏆</Text>
          <Text style={[styles.revealTitle, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            Final Scores
          </Text>
          <View style={[styles.scoreboard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            {[...players]
              .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
              .map((p, i) => (
                <View key={p.id} style={styles.scoreRow}>
                  <Text style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</Text>
                  <Text style={[styles.scoreName, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}>{p.name}</Text>
                  <Text style={[styles.scoreVal, { color: theme.accent.primary, fontFamily: fontFamily.displayBold }]}>
                    {scores[p.id] ?? 0} pts
                  </Text>
                </View>
              ))}
          </View>
          <Button variant="primary" size="lg" onPress={handleEndGame}>
            {t('twoTruths.endGame')}
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
  flex: { flex: 1 },
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
  progress: {
    fontSize: fontSize.sm,
    minWidth: 40,
    textAlign: 'right',
  },
  scrollPad: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  tellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tellerName: {
    fontSize: fontSize.lg,
    letterSpacing: -0.3,
  },
  instruction: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  statementWrap: {
    gap: spacing.xs,
  },
  statementInput: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    minHeight: 80,
  },
  lieBtn: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  lieBtnText: {
    fontSize: fontSize.sm,
  },
  ctaWrap: {
    marginTop: spacing.md,
  },
  centeredContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  voteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  voteNumber: {
    fontSize: fontSize.sm,
    width: 24,
    textAlign: 'center',
  },
  voteText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.4,
  },
  revealTitle: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  scoreboard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  scoreName: {
    flex: 1,
    fontSize: fontSize.md,
  },
  scoreVal: {
    fontSize: fontSize.md,
  },
})
