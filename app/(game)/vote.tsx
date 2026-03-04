import { useState, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import { VoteCard } from '@/components/game/VoteCard'

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function VoteScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const players       = useGameStore((s) => s.players)
  const votes         = useGameStore((s) => s.votes)
  const castVote      = useGameStore((s) => s.castVote)
  const resolveVotes  = useGameStore((s) => s.resolveVotes)

  // Sequential voting: index into players array of who is currently voting
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0)
  // Current voter's selected target
  const [selection, setSelection] = useState<string | null>(null)
  // Whether all votes are cast and we're in the "reveal" phase
  const [revealed, setRevealed] = useState(false)

  // Vote tally (populated after reveal)
  const [tally, setTally] = useState<Record<string, number>>({})

  const currentVoter = players[currentVoterIdx]
  const allVoted     = Object.keys(votes).length >= players.length || revealed

  // ─── Per-card reveal animation drivers ──────────────────────────────────
  // We create one shared value per player card for the reveal stagger
  const revealAnimations = useRef(
    players.map(() => ({ opacity: 0, scale: 0.5 }))
  ).current

  // ─── Select a target ────────────────────────────────────────────────────
  const handleSelectTarget = useCallback((targetId: string) => {
    if (revealed) return
    haptics.selection()
    setSelection(targetId)
  }, [revealed, haptics])

  // ─── Cast vote and advance to next voter ────────────────────────────────
  const handleCastVote = useCallback(() => {
    if (!selection || !currentVoter || revealed) return
    haptics.medium()
    castVote(currentVoter.id, selection)
    setSelection(null)

    const nextIdx = currentVoterIdx + 1
    if (nextIdx >= players.length) {
      // All votes recorded — stay on screen, show REVEAL VOTES
      setCurrentVoterIdx(players.length) // sentinel past end
    } else {
      setCurrentVoterIdx(nextIdx)
    }
  }, [selection, currentVoter, currentVoterIdx, players.length, revealed, castVote, haptics])

  // ─── Reveal votes ────────────────────────────────────────────────────────
  const handleRevealVotes = useCallback(() => {
    haptics.heavy()
    const result = resolveVotes()

    // Build tally from resolved votes
    const tallyMap: Record<string, number> = {}
    players.forEach((p) => { tallyMap[p.id] = result.tally[p.id] ?? 0 })
    setTally(tallyMap)
    setRevealed(true)

    // Navigate to result after short delay (let stagger animate first)
    setTimeout(() => {
      router.replace('/(game)/result' as never)
    }, players.length * 60 + 800)
  }, [resolveVotes, players, haptics])

  // ─── Render ───────────────────────────────────────────────────────────────
  const isSelectingPhase = !revealed && currentVoterIdx < players.length

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg.primary }]} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.title, { color: theme.text.primary }]}>
          {t('vote.title')}
        </Text>
        <Text style={[s.subtitle, { color: theme.text.secondary }]}>
          {isSelectingPhase
            ? `${currentVoter?.name ?? ''} — ${t('vote.subtitle').split('.')[0]}`
            : allVoted
            ? t('vote.reveal')
            : t('vote.waiting')}
        </Text>
      </View>

      {/* ── Pass-phone indicator ── */}
      {isSelectingPhase && (
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            s.passBanner,
            { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
          ]}
        >
          <View style={[s.passDot, { backgroundColor: currentVoter?.color }]} />
          <Text style={[s.passText, { color: theme.text.primary }]}>
            {currentVoter?.name ?? ''}'s turn
          </Text>
        </Animated.View>
      )}

      {/* ── Vote grid ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.grid}>
          {players.map((player, idx) => {
            const isCurrentVoter = currentVoter?.id === player.id
            const hasVoted       = player.id in votes
            const isDisabled     = isCurrentVoter || revealed
            const isSelected     = selection === player.id

            return (
              <VoteCard
                key={player.id}
                player={player}
                isSelected={isSelected}
                isDisabled={isDisabled}
                voteCount={tally[player.id]}
                showVoteCount={revealed}
                revealDelay={idx * 60}
                onPress={() => handleSelectTarget(player.id)}
              />
            )
          })}
        </View>
      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={s.footer}>
        {isSelectingPhase ? (
          /* Cast Vote button */
          <Pressable
            onPress={handleCastVote}
            disabled={!selection}
            style={[
              s.actionBtn,
              {
                backgroundColor: selection ? theme.accent.primary : theme.bg.surface,
                borderColor: selection ? theme.accent.primary : theme.border.default,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                s.actionBtnText,
                { color: selection ? theme.text.onPrimary : theme.text.muted },
              ]}
            >
              {currentVoterIdx === players.length - 1
                ? t('vote.reveal')
                : `${t('common.confirm')} →`}
            </Text>
          </Pressable>
        ) : allVoted && !revealed ? (
          /* Reveal Votes button */
          <Pressable
            onPress={handleRevealVotes}
            style={[s.actionBtn, { backgroundColor: theme.accent.secondary }]}
          >
            <Text style={[s.actionBtnText, { color: '#FFFFFF' }]}>
              {t('vote.reveal')}
            </Text>
          </Pressable>
        ) : null}
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
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },

  title: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.display,
    textAlign: 'center',
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    textAlign: 'center',
  },

  passBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },

  passDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },

  passText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyMedium,
  },

  scroll: { flex: 1 },

  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
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
})
