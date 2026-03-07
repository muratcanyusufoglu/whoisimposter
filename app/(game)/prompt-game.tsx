import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated'
import { Home, SkipForward } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { truthOrDareLogic } from '@/logic/games/truthOrDare'
import { neverHaveIEverLogic } from '@/logic/games/neverHaveIEver'
import { mostLikelyToLogic } from '@/logic/games/mostLikelyTo'
import { hotTakesLogic } from '@/logic/games/hotTakes'
import { wouldYouRatherLogic } from '@/logic/games/wouldYouRather'
import { Button } from '@/components/ui/Button'
import type { PromptItem } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Intensity = 'mild' | 'medium' | 'spicy'
type TruthOrDareChoice = 'truth' | 'dare'

// Map GameModeId → logic module
function getNextPromptForMode(
  mode: string,
  locale: string,
  intensity: Intensity,
  usedIds: string[],
  tdChoice?: TruthOrDareChoice,
): PromptItem {
  switch (mode) {
    case 'truth-dare':
      return truthOrDareLogic.getNextPrompt(locale, intensity, usedIds, tdChoice ?? 'truth')
    case 'never-have-i-ever':
      return neverHaveIEverLogic.getNextPrompt(locale, intensity, usedIds)
    case 'most-likely-to':
      return mostLikelyToLogic.getNextPrompt(locale, intensity, usedIds)
    case 'hot-takes':
      return hotTakesLogic.getNextPrompt(locale, intensity, usedIds)
    case 'would-you-rather':
      return wouldYouRatherLogic.getNextPrompt(locale, intensity, usedIds)
    default:
      return neverHaveIEverLogic.getNextPrompt(locale, intensity, usedIds)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { damping: 20, stiffness: 260 }

export default function PromptGameScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // Store
  const mode = useGameStore((s) => s.mode)
  const players = useGameStore((s) => s.players)
  const locale = useSettingsStore((s) => s.language)

  const isTruthDare = mode === 'truth-dare'

  // ── Local state ──────────────────────────────────────────────────────────
  const [intensity, setIntensity] = useState<Intensity>('mild')
  const [usedIds, setUsedIds] = useState<string[]>([])
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  // truth-or-dare: 'choosing' | 'truth' | 'dare'
  const [tdPhase, setTdPhase] = useState<'choosing' | TruthOrDareChoice>('choosing')
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null)
  const [cardKey, setCardKey] = useState(0)

  // ── Animations ───────────────────────────────────────────────────────────
  const btnScale = useSharedValue(1)
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))
  const skipScale = useSharedValue(1)
  const skipStyle = useAnimatedStyle(() => ({ transform: [{ scale: skipScale.value }] }))

  const currentPlayer = players[currentPlayerIdx] ?? players[0]

  // ── Handlers ─────────────────────────────────────────────────────────────
  const advancePlayer = () => {
    setCurrentPlayerIdx((prev) => (prev + 1) % players.length)
  }

  const loadPrompt = useCallback(
    (chosenIntensity: Intensity, chosenUsedIds: string[], tdChoice?: TruthOrDareChoice) => {
      const prompt = getNextPromptForMode(mode, locale, chosenIntensity, chosenUsedIds, tdChoice)
      setCurrentPrompt(prompt)
      setUsedIds((prev) => [...prev, prompt.id])
      setCardKey((k) => k + 1)
    },
    [mode, locale],
  )

  const handleTruthOrDareChoice = useCallback(
    (choice: TruthOrDareChoice) => {
      haptics.medium()
      setTdPhase(choice)
      loadPrompt(intensity, usedIds, choice)
    },
    [haptics, intensity, usedIds, loadPrompt],
  )

  const handleNextPrompt = useCallback(() => {
    haptics.medium()
    btnScale.value = withSequence(withSpring(0.95, SPRING), withSpring(1, SPRING))
    advancePlayer()
    if (isTruthDare) {
      setTdPhase('choosing')
      setCurrentPrompt(null)
    } else {
      loadPrompt(intensity, usedIds)
    }
  }, [haptics, btnScale, isTruthDare, intensity, usedIds, loadPrompt])

  const handleSkip = useCallback(() => {
    haptics.light()
    skipScale.value = withSequence(withSpring(0.92, SPRING), withSpring(1, SPRING))
    if (isTruthDare) {
      // Re-show choice screen for same player
      setTdPhase('choosing')
      setCurrentPrompt(null)
    } else {
      loadPrompt(intensity, usedIds)
    }
  }, [haptics, skipScale, isTruthDare, intensity, usedIds, loadPrompt])

  const handleIntensityChange = useCallback(
    (newIntensity: Intensity) => {
      haptics.selection()
      setIntensity(newIntensity)
      setUsedIds([]) // Reset used pool when switching intensity
      if (!isTruthDare && currentPrompt !== null) {
        loadPrompt(newIntensity, [])
      }
      if (isTruthDare) {
        setTdPhase('choosing')
        setCurrentPrompt(null)
      }
    },
    [haptics, isTruthDare, currentPrompt, loadPrompt],
  )

  const handleEndGame = useCallback(() => {
    haptics.light()
    router.replace('/(main)/home' as never)
  }, [haptics])

  // ── Derive game label from mode ──────────────────────────────────────────
  // i18n keys use underscores; GameModeId uses hyphens → normalise
  const modeKey = mode.replace(/-/g, '_')
  const gameName = t(`games.${modeKey}.name`, { defaultValue: mode })

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleEndGame}
          style={[styles.homeBtn, { backgroundColor: theme.bg.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t('promptGame.endGame')}
        >
          <Home size={20} color={theme.text.primary} />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}
          numberOfLines={1}
        >
          {gameName}
        </Text>

        {/* Intensity chips */}
        <View style={styles.intensityRow}>
          {(['mild', 'medium', 'spicy'] as Intensity[]).map((lvl) => (
            <TouchableOpacity
              key={lvl}
              onPress={() => handleIntensityChange(lvl)}
              style={[
                styles.intensityChip,
                {
                  backgroundColor: intensity === lvl ? theme.accent.primary : theme.bg.surface,
                  borderColor: intensity === lvl ? theme.accent.primary : theme.border.default,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: intensity === lvl }}
            >
              <Text
                style={[
                  styles.intensityChipText,
                  {
                    color: intensity === lvl ? theme.text.onPrimary : theme.text.secondary,
                    fontFamily: intensity === lvl ? fontFamily.bodyBold : fontFamily.body,
                  },
                ]}
              >
                {t(`promptGame.${lvl}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Player badge ───────────────────────────────────────────────────── */}
      <View style={[styles.playerBadge, { backgroundColor: theme.bg.elevated, borderColor: theme.border.subtle }]}>
        {/* Colored initials avatar */}
        <View style={[styles.playerAvatar, { backgroundColor: currentPlayer?.color ?? theme.accent.primary }]}>
          <Text style={[styles.playerAvatarText, { fontFamily: fontFamily.displayBold }]}>
            {currentPlayer?.initials ?? '?'}
          </Text>
        </View>
        <Text style={[styles.playerName, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
          {t('promptGame.playerTurn', { name: currentPlayer?.name ?? '?' })}
        </Text>
        <View style={styles.playerDots}>
          {players.slice(0, Math.min(players.length, 8)).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentPlayerIdx ? theme.accent.primary : theme.border.default,
                  width: i === currentPlayerIdx ? 16 : 6,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── Prompt area ────────────────────────────────────────────────────── */}
      <View style={styles.promptArea}>
        {/* Truth or Dare — choose phase */}
        {isTruthDare && tdPhase === 'choosing' && (
          <Animated.View
            key="choosing"
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.choiceContainer}
          >
            <Text style={[styles.choiceTitle, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
              {t('promptGame.chooseTruthOrDare')}
            </Text>
            <View style={styles.choiceButtons}>
              <TouchableOpacity
                onPress={() => handleTruthOrDareChoice('truth')}
                style={[styles.choiceBtn, { backgroundColor: theme.accent.primary }]}
                accessibilityRole="button"
              >
                <Text style={[styles.choiceBtnText, { color: theme.text.onPrimary, fontFamily: fontFamily.displayBold }]}>
                  {t('promptGame.truth')}
                </Text>
                <Text style={styles.choiceBtnEmoji}>💬</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleTruthOrDareChoice('dare')}
                style={[styles.choiceBtn, { backgroundColor: theme.status.error }]}
                accessibilityRole="button"
              >
                <Text style={[styles.choiceBtnText, { color: '#FFFFFF', fontFamily: fontFamily.displayBold }]}>
                  {t('promptGame.dare')}
                </Text>
                <Text style={styles.choiceBtnEmoji}>🎭</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Prompt card */}
        {currentPrompt !== null && (
          <Animated.View
            key={`card-${cardKey}`}
            entering={SlideInRight.duration(280).springify()}
            exiting={SlideOutLeft.duration(200)}
            style={[
              styles.promptCard,
              {
                backgroundColor: theme.bg.surface,
                borderColor: theme.border.subtle,
              },
            ]}
          >
            {/* Badge for truth/dare type */}
            {isTruthDare && currentPrompt.type && (
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      currentPrompt.type === 'truth' ? theme.accent.primary : theme.status.error,
                  },
                ]}
              >
                <Text style={[styles.typeBadgeText, { color: currentPrompt.type === 'truth' ? theme.text.onPrimary : '#FFFFFF', fontFamily: fontFamily.bodyBold }]}>
                  {currentPrompt.type === 'truth' ? t('promptGame.truth') : t('promptGame.dare')}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.promptText,
                { color: theme.text.primary, fontFamily: fontFamily.displayBold },
              ]}
            >
              {currentPrompt.text}
            </Text>
          </Animated.View>
        )}

        {/* Initial state — no prompt yet (non-truth-dare) */}
        {!isTruthDare && currentPrompt === null && (
          <Animated.View
            key="initial"
            entering={FadeIn.duration(300)}
            style={[
              styles.promptCard,
              styles.promptCardEmpty,
              {
                backgroundColor: theme.bg.surface,
                borderColor: theme.border.subtle,
                borderStyle: 'dashed',
              },
            ]}
          >
            <Text style={[styles.promptEmptyEmoji]}>👇</Text>
            <Text style={[styles.promptEmptyText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
              {t('promptGame.nextPrompt')}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* ── Bottom actions ─────────────────────────────────────────────────── */}
      <View style={[styles.bottomActions, { borderTopColor: theme.border.subtle }]}>
        {/* Skip — only visible when a prompt is showing */}
        {currentPrompt !== null && (
          <Animated.View style={skipStyle}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[styles.skipBtn, { borderColor: theme.border.default }]}
              accessibilityRole="button"
              accessibilityLabel={t('promptGame.skip')}
            >
              <SkipForward size={18} color={theme.text.muted} />
              <Text style={[styles.skipText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                {t('promptGame.skip')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Next prompt / First prompt */}
        <Animated.View style={[btnStyle, styles.nextBtnWrap]}>
          {(!isTruthDare || currentPrompt !== null) && (
            <Button
              variant="primary"
              size="lg"
              onPress={currentPrompt === null ? () => loadPrompt(intensity, usedIds) : handleNextPrompt}
              accessibilityLabel={t('promptGame.nextPrompt')}
            >
              {t('promptGame.nextPrompt')}
            </Button>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  homeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  intensityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  intensityChipText: {
    fontSize: fontSize.sm,
  },
  playerBadge: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
  },
  playerName: {
    fontSize: fontSize.lg,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  playerDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  promptArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  choiceContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  choiceTitle: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  choiceBtnText: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
  },
  choiceBtnEmoji: {
    fontSize: 32,
  },
  promptCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
    minHeight: 200,
    justifyContent: 'center',
  },
  promptCardEmpty: {
    alignItems: 'center',
    borderWidth: 2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  typeBadgeText: {
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * 1.35,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  promptEmptyEmoji: {
    fontSize: 40,
  },
  promptEmptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.md : spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  skipText: {
    fontSize: fontSize.sm,
  },
  nextBtnWrap: {
    width: '100%',
  },
})
