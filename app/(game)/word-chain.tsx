import { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import { wordChainLogic, WordChainState } from '@/logic/games/wordChain'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// WORD CHAIN SCREEN — F16.4
// Each player types a word starting with the last letter of the previous word.
// Timer per player. Eliminate on timeout or invalid word.
// ─────────────────────────────────────────────────────────────────────────────

export default function WordChainScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players = useGameStore((s) => s.players)
  const storeTimer = useGameStore((s) => s.timerSeconds)
  // 0 means "Off" in setup, fall back to logic default for word-chain
  const TIMER_SECONDS = storeTimer > 0 ? storeTimer : wordChainLogic.defaultTimerSeconds

  // ── Game state ─────────────────────────────────────────────────────────
  const [chainState, setChainState] = useState<WordChainState>(
    wordChainLogic.createInitialState(),
  )
  const [inputValue, setInputValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [eliminatedMessage, setEliminatedMessage] = useState<string | null>(null)
  const [winner, setWinner] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<TextInput>(null)

  // Active (non-eliminated) players
  const activePlayers = players.filter(
    (p) => !chainState.eliminatedPlayerIds.includes(p.id),
  )
  const currentPlayer = activePlayers[chainState.currentPlayerIndex] ?? activePlayers[0]

  // ── Timer ─────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    stopTimer()
    setTimeLeft(TIMER_SECONDS)
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

  // Start timer on mount
  useEffect(() => {
    resetTimer()
    return stopTimer
  }, [])

  // When timer hits 0 — eliminate current player
  useEffect(() => {
    if (timeLeft === 0 && !winner) {
      handleTimeout()
    }
  }, [timeLeft])

  // ── Animations ────────────────────────────────────────────────────────
  const shakeSv = useSharedValue(0)
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeSv.value }],
  }))
  const lastWordScale = useSharedValue(1)
  const lastWordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lastWordScale.value }],
  }))

  const shake = () => {
    shakeSv.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    )
  }

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleTimeout = useCallback(() => {
    stopTimer()
    haptics.error?.() ?? haptics.medium()

    if (!currentPlayer) return

    const updated = wordChainLogic.eliminateCurrentPlayer(
      currentPlayer.id,
      chainState,
      activePlayers.length,
    )
    const remaining = activePlayers.filter(
      (p) => !updated.eliminatedPlayerIds.includes(p.id),
    )

    setEliminatedMessage(t('wordChain.timerOut', { name: currentPlayer.name }))

    setTimeout(() => {
      setEliminatedMessage(null)
      if (wordChainLogic.isGameOver(updated.eliminatedPlayerIds.length, players.length)) {
        const winnerId = wordChainLogic.getWinner(
          players.map((p) => p.id),
          updated.eliminatedPlayerIds,
        )
        setWinner(winnerId)
      } else {
        setChainState(updated)
        setInputValue('')
        setValidationError(null)
        resetTimer()
        inputRef.current?.focus()
      }
    }, 2000)
  }, [stopTimer, haptics, currentPlayer, chainState, activePlayers, players, t, resetTimer])

  const handleSubmit = useCallback(() => {
    const word = inputValue.trim()
    const validation = wordChainLogic.validateWord(word, chainState)

    if (!validation.valid) {
      haptics.error?.() ?? haptics.medium()
      shake()
      switch (validation.reason) {
        case 'wrong_letter':
          setValidationError(
            t('wordChain.wrongLetter', { letter: chainState.lastLetter.toUpperCase() }),
          )
          break
        case 'already_used':
          setValidationError(t('wordChain.alreadyUsed'))
          break
        case 'too_short':
          setValidationError(t('wordChain.tooShort'))
          break
        case 'invalid_characters':
          setValidationError(t('wordChain.invalidChars'))
          break
      }
      return
    }

    haptics.success()
    lastWordScale.value = withSequence(
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    )

    const updated = wordChainLogic.applyWord(word, chainState, activePlayers.length)
    setChainState(updated)
    setInputValue('')
    setValidationError(null)
    resetTimer()
    inputRef.current?.focus()
  }, [inputValue, chainState, haptics, lastWordScale, activePlayers.length, t, resetTimer])

  const handleEndGame = useCallback(() => {
    stopTimer()
    router.replace('/(main)/home' as never)
  }, [stopTimer])

  const winnerPlayer = players.find((p) => p.id === winner)

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
          {t('wordChain.title')}
        </Text>
        <Text style={[styles.playersLeft, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
          {t('wordChain.playersLeft', { count: activePlayers.length })}
        </Text>
      </View>

      {/* Winner screen */}
      {winner && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.winnerContent}>
          <Text style={styles.winnerEmoji}>🏆</Text>
          <Text style={[styles.winnerText, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
            {t('wordChain.winner', { name: winnerPlayer?.name ?? '?' })}
          </Text>
          <View style={[styles.chainBox, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            {chainState.usedWords.slice(-8).map((w, i) => (
              <Text key={i} style={[styles.chainWord, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {w}
              </Text>
            ))}
          </View>
          <Button variant="primary" size="lg" onPress={handleEndGame}>
            {t('wordChain.endGame')}
          </Button>
        </Animated.View>
      )}

      {!winner && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Elimination toast */}
          {eliminatedMessage && (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(200)}
              style={[styles.eliminatedToast, { backgroundColor: theme.status.error }]}
            >
              <Text style={[styles.eliminatedText, { color: '#FFFFFF', fontFamily: fontFamily.bodyBold }]}>
                {eliminatedMessage}
              </Text>
            </Animated.View>
          )}

          {/* Main game area */}
          <View style={styles.gameContent}>
            {/* Timer */}
            <View
              style={[
                styles.timerRing,
                { borderColor: timeLeft <= 5 ? theme.status.error : theme.accent.primary },
              ]}
            >
              <Text style={[styles.timerText, {
                color: timeLeft <= 5 ? theme.status.error : theme.text.primary,
                fontFamily: fontFamily.displayBold,
              }]}>
                {timeLeft}
              </Text>
            </View>

            {/* Last word display */}
            {chainState.lastWord ? (
              <Animated.View style={lastWordStyle}>
                <Text style={[styles.lastWordLabel, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                  {t('wordChain.continueWith', { letter: chainState.lastLetter.toUpperCase() })}
                </Text>
                <Text style={[styles.lastWord, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                  {chainState.lastWord}
                </Text>
              </Animated.View>
            ) : (
              <Text style={[styles.lastWordLabel, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {t('wordChain.startWith')}
              </Text>
            )}

            {/* Current player */}
            <View style={[styles.playerBadge, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
              <View style={[styles.dot, { backgroundColor: currentPlayer?.color ?? theme.accent.primary }]} />
              <Text style={[styles.playerName, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                {currentPlayer?.name ?? '?'}
              </Text>
            </View>

            {/* Input */}
            <Animated.View style={[styles.inputWrap, shakeStyle]}>
              <TextInput
                ref={inputRef}
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text)
                  if (validationError) setValidationError(null)
                }}
                placeholder={t('wordChain.placeholder')}
                placeholderTextColor={theme.text.secondary}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.bg.elevated,
                    borderColor: validationError ? theme.status.error : theme.border.default,
                    color: theme.text.primary,
                    fontFamily: fontFamily.displayBold,
                    fontSize: fontSize.xl,
                  },
                ]}
                accessibilityLabel={t('wordChain.placeholder')}
              />
              {validationError && (
                <Text style={[styles.errorText, { color: theme.status.error, fontFamily: fontFamily.body }]}>
                  {validationError}
                </Text>
              )}
            </Animated.View>
          </View>

          {/* Submit CTA */}
          <View style={[styles.bottomBar, { borderTopColor: theme.border.subtle }]}>
            <Button
              variant="primary"
              size="lg"
              disabled={inputValue.trim().length === 0}
              onPress={handleSubmit}
            >
              {t('wordChain.submit')}
            </Button>
          </View>
        </KeyboardAvoidingView>
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
  playersLeft: {
    fontSize: fontSize.sm,
    minWidth: 60,
    textAlign: 'right',
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  timerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
  },
  lastWordLabel: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  lastWord: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.5,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  playerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  playerName: {
    fontSize: fontSize.md,
    letterSpacing: -0.2,
  },
  inputWrap: {
    width: '100%',
    gap: spacing.xs,
  },
  input: {
    height: 64,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  errorText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.md : spacing.sm,
    borderTopWidth: 1,
  },
  eliminatedToast: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  eliminatedText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  winnerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  winnerEmoji: {
    fontSize: 64,
  },
  winnerText: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  chainBox: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  chainWord: {
    fontSize: fontSize.sm,
  },
})
