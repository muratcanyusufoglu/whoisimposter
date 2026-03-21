import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { useStatsStore } from '@/store/statsStore'
import { useGameStore } from '@/store/gameStore'
import { ACHIEVEMENT_DEFINITIONS } from '@/logic/scoring'
import type { Player, PlayerLifetimeStats } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface StatsModalProps {
  visible: boolean
  onClose: () => void
}

type Tab = 'stats' | 'achievements'

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function StatsModal({ visible, onClose }: StatsModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('stats')

  const playerStats = useStatsStore((s) => s.playerStats)
  const unlockedAchievements = useStatsStore((s) => s.unlockedAchievements)
  const gamePlayers = useGameStore((s) => s.players)

  // Build a lookup of normalized name → Player for avatar fallback
  const gamePlayerMap: Record<string, Player> = {}
  for (const p of gamePlayers) {
    gamePlayerMap[p.name.trim().toLowerCase()] = p
  }

  const playerEntries = Object.entries(playerStats).sort(
    ([, a], [, b]) => b.gamesPlayed - a.gamesPlayed,
  )

  const unlockedSet = new Set(unlockedAchievements.map((a) => a.id))

  return (
    <Modal visible={visible} position="bottom" onClose={onClose}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: theme.text.primary }]}>
          {t('stats.title')}
        </Text>
        <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color={theme.text.muted} />
        </TouchableOpacity>
      </View>

      {/* ── Tab switcher ── */}
      <View
        style={[s.tabs, { backgroundColor: theme.bg.primary, borderColor: theme.border.subtle }]}
      >
        <TabButton
          label={t('stats.myStats')}
          active={activeTab === 'stats'}
          onPress={() => setActiveTab('stats')}
          theme={theme}
        />
        <TabButton
          label={t('stats.achievements')}
          active={activeTab === 'achievements'}
          onPress={() => setActiveTab('achievements')}
          theme={theme}
        />
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {activeTab === 'stats' ? (
          <>
            {playerEntries.length === 0 ? (
              <Text style={[s.emptyText, { color: theme.text.muted }]}>
                {t('stats.noStats')}
              </Text>
            ) : (
              playerEntries.map(([normalizedName, stats]) => (
                <PlayerStatsRow
                  key={normalizedName}
                  name={normalizedName}
                  stats={stats}
                  gamePlayer={gamePlayerMap[normalizedName]}
                  theme={theme}
                  t={t}
                />
              ))
            )}
          </>
        ) : (
          <View style={s.achievementsGrid}>
            {ACHIEVEMENT_DEFINITIONS.map((def) => {
              const isUnlocked = unlockedSet.has(def.id)
              const unlocked = unlockedAchievements.find((a) => a.id === def.id)
              return (
                <AchievementCell
                  key={def.id}
                  emoji={def.emoji}
                  title={t(def.titleKey)}
                  desc={t(def.descKey)}
                  isUnlocked={isUnlocked}
                  unlockedAt={unlocked?.unlockedAt ?? null}
                  theme={theme}
                  t={t}
                />
              )
            })}
          </View>
        )}
      </ScrollView>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onPress,
  theme,
}: {
  label: string
  active: boolean
  onPress: () => void
  theme: ReturnType<typeof useTheme>['theme']
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.tabBtn,
        active && { backgroundColor: theme.bg.elevated, borderColor: theme.border.default },
        !active && { borderColor: 'transparent' },
      ]}
    >
      <Text
        style={[
          s.tabLabel,
          { color: active ? theme.text.primary : theme.text.muted },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function PlayerStatsRow({
  name,
  stats,
  gamePlayer,
  theme,
  t,
}: {
  name: string
  stats: PlayerLifetimeStats
  gamePlayer?: Player
  theme: ReturnType<typeof useTheme>['theme']
  t: (key: string) => string
}) {
  // Capitalize the stored normalized name for display
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  // Prefer live gamePlayer data, then persisted stats avatar, then defaults
  const avatarEmoji = gamePlayer?.emoji ?? stats.emoji
  const avatarColor = gamePlayer?.color ?? stats.color ?? theme.accent.primary

  return (
    <View
      style={[
        s.playerRow,
        { backgroundColor: theme.bg.primary, borderColor: theme.border.subtle },
      ]}
    >
      <View style={s.playerRowHeader}>
        <Avatar
          name={displayName}
          color={avatarColor}
          emoji={avatarEmoji}
          size={40}
        />
        <Text style={[s.playerRowName, { color: theme.text.primary }]}>
          {displayName}
        </Text>
      </View>
      <View style={s.statsGrid}>
        <StatCell label={t('stats.gamesPlayed')} value={stats.gamesPlayed} theme={theme} />
        <StatCell label={t('stats.wins')} value={stats.wins} theme={theme} />
        <StatCell label={t('stats.timesImposter')} value={stats.timesImposter} theme={theme} />
        <StatCell label={t('stats.timesCaught')} value={stats.timesCaught} theme={theme} />
      </View>
    </View>
  )
}

function StatCell({
  label,
  value,
  theme,
}: {
  label: string
  value: number
  theme: ReturnType<typeof useTheme>['theme']
}) {
  return (
    <View style={s.statCell}>
      <Text style={[s.statValue, { color: theme.accent.primary }]}>
        {value}
      </Text>
      <Text style={[s.statLabel, { color: theme.text.muted }]}>
        {label}
      </Text>
    </View>
  )
}

function AchievementCell({
  emoji,
  title,
  desc,
  isUnlocked,
  unlockedAt,
  theme,
  t,
}: {
  emoji: string
  title: string
  desc: string
  isUnlocked: boolean
  unlockedAt: number | null
  theme: ReturnType<typeof useTheme>['theme']
  t: (key: string) => string
}) {
  const dateStr = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString()
    : null

  return (
    <View
      style={[
        s.achievementCell,
        {
          backgroundColor: isUnlocked
            ? theme.bg.primary
            : theme.bg.primary,
          borderColor: isUnlocked ? theme.accent.premium + '44' : theme.border.subtle,
          opacity: isUnlocked ? 1 : 0.45,
        },
      ]}
    >
      {isUnlocked ? (
        <Text style={s.achievementEmoji}>{emoji}</Text>
      ) : (
        <View
          style={[s.lockedIcon, { backgroundColor: theme.bg.elevated }]}
        >
          <Ionicons name="lock-closed" size={20} color={theme.text.muted} />
        </View>
      )}
      <Text
        style={[
          s.achievementTitle,
          { color: isUnlocked ? theme.text.primary : theme.text.muted },
        ]}
        numberOfLines={1}
      >
        {isUnlocked ? title : t('achievements.locked')}
      </Text>
      {isUnlocked && (
        <Text style={[s.achievementDesc, { color: theme.text.muted }]} numberOfLines={2}>
          {dateStr ?? desc}
        </Text>
      )}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bodyBold,
  },

  closeBtn: {
    padding: spacing.xs,
  },

  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },

  tabLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyMedium,
  },

  scroll: {
    maxHeight: 420,
  },

  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  emptyText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },

  playerRow: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },

  playerRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  playerRowName: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
    flex: 1,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },

  statValue: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.mono,
  },

  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    textAlign: 'center',
  },

  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  achievementCell: {
    width: '47%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 110,
    justifyContent: 'center',
  },

  achievementEmoji: {
    fontSize: 32,
  },

  lockedIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  achievementTitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyBold,
    textAlign: 'center',
  },

  achievementDesc: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    textAlign: 'center',
  },
})
