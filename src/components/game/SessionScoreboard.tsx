import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import type { Player, SessionScores, PlayerRoundPoints } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SessionScoreboardProps {
  players: Player[]
  scores: SessionScores
  roundsPlayed: number
  lastRoundPoints: PlayerRoundPoints[]
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SessionScoreboard({
  players,
  scores,
  roundsPlayed,
  lastRoundPoints,
}: SessionScoreboardProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Build a lookup map for quick delta access
  const deltaMap: Record<string, number> = {}
  for (const rp of lastRoundPoints) {
    deltaMap[rp.playerId] = rp.points
  }

  // Sort a copy of players by cumulative score (descending), then alphabetically
  const sorted = [...players].sort((a, b) => {
    const diff = (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })

  const RANK_MEDALS = ['🥇', '🥈', '🥉']

  return (
    <View
      style={[
        s.container,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
      ]}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.title, { color: theme.text.primary }]}>
          {t('scoreboard.title')}
        </Text>
        <Text style={[s.subtitle, { color: theme.text.muted }]}>
          {t('scoreboard.roundsPlayed', { count: roundsPlayed })}
        </Text>
      </View>

      {/* ── Player rows ── */}
      {sorted.map((player, index) => {
        const totalPts = scores[player.id] ?? 0
        const delta = deltaMap[player.id] ?? 0
        const rankLabel = RANK_MEDALS[index] ?? `${index + 1}`

        return (
          <Animated.View
            key={player.id}
            entering={FadeInUp.delay(index * 60).springify()}
            style={[
              s.row,
              index < sorted.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.border.subtle,
              },
            ]}
          >
            {/* Rank */}
            <Text style={[s.rank, { color: theme.text.muted }]}>
              {rankLabel}
            </Text>

            {/* Color dot + name */}
            <View style={[s.avatar, { backgroundColor: player.color }]}>
              <Text style={s.avatarText}>{player.initials}</Text>
            </View>
            <Text
              style={[s.playerName, { color: theme.text.primary }]}
              numberOfLines={1}
            >
              {player.name}
            </Text>

            {/* Spacer */}
            <View style={s.spacer} />

            {/* +delta badge */}
            {delta > 0 && (
              <View
                style={[
                  s.deltaBadge,
                  { backgroundColor: theme.status.success + '22' },
                ]}
              >
                <Text style={[s.deltaText, { color: theme.status.success }]}>
                  {t('scoreboard.delta', { count: delta })}
                </Text>
              </View>
            )}

            {/* Total points */}
            <Text style={[s.pts, { color: theme.accent.primary }]}>
              {totalPts}
              <Text style={[s.ptsLabel, { color: theme.text.muted }]}>
                {' '}{t('scoreboard.pts')}
              </Text>
            </Text>
          </Animated.View>
        )
      })}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 32

const s = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  title: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyBold,
  },

  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },

  rank: {
    fontSize: fontSize.md,
    width: 28,
    textAlign: 'center',
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodyBold,
    color: '#FFFFFF',
  },

  playerName: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyMedium,
    flex: 1,
  },

  spacer: {
    flex: 1,
  },

  deltaBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },

  deltaText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyBold,
  },

  pts: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.mono,
  },

  ptsLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
  },
})
