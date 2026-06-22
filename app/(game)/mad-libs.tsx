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
import { TabletFrame } from '@/components/layout/TabletFrame'
import { router } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { madLibsLogic, MadLibsStory } from '@/logic/games/madLibs'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// MAD LIBS ("Crazy Story") SCREEN
// Phase 1: collect a word for each blank, one player at a time (blind).
// Phase 2: reveal the assembled story.
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'collecting' | 'reveal'

export default function MadLibsScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players = useGameStore((s) => s.players)
  const locale = useSettingsStore((s) => s.language)

  const [story, setStory] = useState<MadLibsStory>(() => madLibsLogic.getStory(locale, []))
  const [usedIds, setUsedIds] = useState<string[]>([])
  const [words, setWords] = useState<string[]>([])
  const [blankIndex, setBlankIndex] = useState(0)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('collecting')

  const currentPlayer = players[blankIndex % Math.max(1, players.length)]

  const handleSubmit = useCallback(() => {
    const w = input.trim()
    if (!w) return
    haptics.selection()
    setWords((prev) => [...prev, w])
    setInput('')
    if (blankIndex + 1 >= story.blanks.length) {
      setPhase('reveal')
    } else {
      setBlankIndex((i) => i + 1)
    }
  }, [input, blankIndex, story, haptics])

  const handleNewStory = useCallback(() => {
    haptics.medium()
    const next = madLibsLogic.getStory(locale, [...usedIds, story.id])
    setUsedIds((u) => [...u, story.id])
    setStory(next)
    setWords([])
    setBlankIndex(0)
    setInput('')
    setPhase('collecting')
  }, [haptics, locale, usedIds, story])

  const handleEndGame = useCallback(() => {
    router.replace('/(main)/home' as never)
  }, [])

  const isLastBlank = blankIndex + 1 >= story.blanks.length

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg.primary }]} edges={['top', 'bottom']}>
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
            {t('games.mad_libs.name')}
          </Text>
          <Text style={[styles.progress, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
            {phase === 'collecting' ? `${blankIndex + 1}/${story.blanks.length}` : ''}
          </Text>
        </View>

        {/* — Collecting phase — */}
        {phase === 'collecting' && (
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.collectContent} keyboardShouldPersistTaps="handled">
              <View style={[styles.playerBadge, { backgroundColor: currentPlayer?.color + '22', borderColor: currentPlayer?.color }]}>
                <View style={[styles.dot, { backgroundColor: currentPlayer?.color }]} />
                <Text style={[styles.playerName, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}>
                  {t('promptGame.playerTurn', { name: currentPlayer?.name ?? '?' })}
                </Text>
              </View>

              <Text style={[styles.askLabel, { color: theme.text.muted, fontFamily: fontFamily.bodyMedium }]}>
                {t('madLibs.give')}
              </Text>
              <Text style={[styles.hint, { color: theme.accent.primary, fontFamily: fontFamily.displayBold }]}>
                {story.blanks[blankIndex]}
              </Text>
              <Text style={[styles.instruction, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {t('madLibs.instruction')}
              </Text>

              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={t('wordChain.placeholder')}
                placeholderTextColor={theme.text.secondary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.bg.surface,
                    borderColor: theme.border.default,
                    color: theme.text.primary,
                    fontFamily: fontFamily.bodyMedium,
                  },
                ]}
                accessibilityLabel={story.blanks[blankIndex]}
              />

              <View style={styles.ctaArea}>
                <Button variant="primary" size="lg" disabled={input.trim().length === 0} onPress={handleSubmit}>
                  {isLastBlank ? t('madLibs.reveal') : t('madLibs.next')}
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* — Reveal phase — */}
        {phase === 'reveal' && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.flex}>
            <ScrollView contentContainerStyle={styles.revealContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.revealEmoji}>📖</Text>
              <Text style={[styles.storyHeading, { color: theme.text.muted, fontFamily: fontFamily.bodyMedium }]}>
                {t('madLibs.storyHeading')}
              </Text>
              <View style={[styles.storyCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                <Text style={[styles.storyText, { color: theme.text.primary, fontFamily: fontFamily.body }]}>
                  {madLibsLogic.assemble(story, words)}
                </Text>
              </View>

              <View style={styles.revealActions}>
                <Button variant="primary" size="lg" onPress={handleNewStory}>
                  {t('madLibs.newStory')}
                </Button>
                <TouchableOpacity onPress={handleEndGame} style={styles.endBtn} accessibilityRole="button">
                  <Text style={[styles.endBtnText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                    {t('promptGame.endGame')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
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
  collectContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  playerBadge: {
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
  playerName: {
    fontSize: fontSize.md,
    letterSpacing: -0.2,
  },
  askLabel: {
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  instruction: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  input: {
    height: 60,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  ctaArea: {
    paddingTop: spacing.md,
  },
  revealContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  revealEmoji: {
    fontSize: 48,
  },
  storyHeading: {
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storyCard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  storyText: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.55,
  },
  revealActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  endBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  endBtnText: {
    fontSize: fontSize.md,
  },
})
