import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated'
import { Check } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import { CATEGORIES } from '@/data/categories'
import { TimerRing } from '@/components/game/TimerRing'

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function PlayScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players            = useGameStore((s) => s.players)
  const playerCluesGiven   = useGameStore((s) => s.playerCluesGiven)
  const timerSeconds       = useGameStore((s) => s.timerSeconds)
  const roundNumber        = useGameStore((s) => s.roundNumber)
  const selectedCategories = useGameStore((s) => s.selectedCategories)
  const locale             = useGameStore((s) => s.locale)
  const markClueGiven      = useGameStore((s) => s.markClueGiven)

  // Active timer player (the one currently speaking)
  const [activeTimerPlayerId, setActiveTimerPlayerId] = useState<string | null>(null)

  const allCluesGiven = players.every((p) => playerCluesGiven.includes(p.id))

  // ─── Category display ────────────────────────────────────────────────────
  const firstCategoryId  = selectedCategories[0] ?? ''
  const categoryDef      = CATEGORIES.find((c) => c.id === firstCategoryId)
  const categoryEmoji    = categoryDef?.emoji ?? '🎲'
  const categoryName     = categoryDef ? t(categoryDef.nameKey) : firstCategoryId

  // ─── Clue row tap — mark given + start timer ─────────────────────────────
  const handleRowPress = useCallback((playerId: string) => {
    const alreadyGiven = playerCluesGiven.includes(playerId)
    if (alreadyGiven) return

    haptics.selection()
    markClueGiven(playerId)

    if (timerSeconds > 0) {
      // Activate timer for this player (reset if another was active)
      setActiveTimerPlayerId(playerId)
    }
  }, [playerCluesGiven, markClueGiven, haptics, timerSeconds])

  const handleTimerComplete = useCallback(() => {
    haptics.warning()
    // Timer finished — auto-clear so the ring resets for next player
    setActiveTimerPlayerId(null)
  }, [haptics])

  // ─── START VOTING ─────────────────────────────────────────────────────────
  const handleStartVoting = useCallback(() => {
    haptics.medium()
    router.push('/(game)/vote' as never)
  }, [haptics])

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg.primary }]} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.roundLabel, { color: theme.text.muted }]}>
          {t('play.round', { number: roundNumber })}
        </Text>
        <View style={s.categoryRow}>
          <Text style={s.categoryEmoji}>{categoryEmoji}</Text>
          <Text style={[s.categoryName, { color: theme.text.primary }]}>{categoryName}</Text>
        </View>
      </View>

      {/* ── Timer ring (when timer > 0) ── */}
      {timerSeconds > 0 && (
        <View style={s.timerArea}>
          <TimerRing
            totalSeconds={timerSeconds}
            isActive={activeTimerPlayerId !== null}
            onComplete={handleTimerComplete}
            size={110}
          />
          <Text style={[s.timerLabel, { color: theme.text.muted }]}>
            {activeTimerPlayerId
              ? players.find((p) => p.id === activeTimerPlayerId)?.name ?? ''
              : t('play.category')}
          </Text>
        </View>
      )}

      {/* ── Player clue list ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {players.map((player, idx) => {
          const done = playerCluesGiven.includes(player.id)
          const isTimerActive = activeTimerPlayerId === player.id

          return (
            <Animated.View
              key={player.id}
              entering={FadeInDown.delay(idx * 60).springify()}
            >
              <Pressable
                onPress={() => handleRowPress(player.id)}
                style={[
                  s.playerRow,
                  {
                    backgroundColor: done ? theme.bg.surface : theme.bg.surface,
                    borderColor: isTimerActive
                      ? theme.accent.primary
                      : done
                      ? theme.border.subtle
                      : theme.border.default,
                    opacity: done ? 0.65 : 1,
                  },
                ]}
              >
                {/* Avatar */}
                <View style={[s.avatar, { backgroundColor: player.color }]}>
                  <Text style={[s.avatarText, { color: '#FFFFFF' }]}>{player.initials}</Text>
                </View>

                {/* Name */}
                <Text
                  style={[
                    s.playerName,
                    { color: done ? theme.text.muted : theme.text.primary },
                  ]}
                >
                  {player.name}
                </Text>

                {/* Status */}
                <View style={s.statusArea}>
                  {done ? (
                    <View style={[s.checkCircle, { backgroundColor: theme.status.success }]}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : (
                    <Text style={[s.tapHint, { color: theme.text.muted }]}>
                      {t('play.clueGiven')}
                    </Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          )
        })}
      </ScrollView>

      {/* ── START VOTING button ── */}
      <View style={s.footer}>
        <Pressable
          onPress={handleStartVoting}
          style={[
            s.votingBtn,
            {
              backgroundColor: theme.accent.primary,
              opacity: allCluesGiven ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[s.votingBtnText, { color: theme.text.onPrimary }]}>
            {t('play.startVoting')}
          </Text>
        </Pressable>

        {!allCluesGiven && (
          <Text style={[s.overrideHint, { color: theme.text.muted }]}>
            {t('play.startVoting')} ↑
          </Text>
        )}
      </View>

    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },

  roundLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.mono,
    letterSpacing: 2,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  categoryEmoji: {
    fontSize: fontSize.xl,
  },

  categoryName: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
  },

  timerArea: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },

  timerLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
  },

  scroll: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.displayBold,
  },

  playerName: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyMedium,
  },

  statusArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },

  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tapHint: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    textAlign: 'right',
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
  },

  votingBtn: {
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  votingBtnText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
  },

  overrideHint: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
  },
})
