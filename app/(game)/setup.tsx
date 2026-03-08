import { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import { GAME_MODES } from '@/data/games'
import { CATEGORIES } from '@/data/categories'
import { playerManager } from '@/logic/playerManager'
import { PlayerChip } from '@/components/game/PlayerChip'
import { CategoryCard } from '@/components/game/CategoryCard'
import { Button } from '@/components/ui/Button'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { GameConfig, GameModeId, Player } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// GAME SETUP SCREEN — F10
// 4 sections: Players · Categories (if applicable) · Game Mode · Advanced
// On START GAME: builds GameConfig → initGame() → navigate to reveal
// ─────────────────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width
// 2-column grid with padding on both sides and gap between
const CARD_GAP = spacing.sm
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2

const TIMER_OPTIONS: Array<0 | 10 | 15 | 30> = [0, 10, 15, 30]
const SPRING = { damping: 18, stiffness: 220 }

export default function SetupScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // Route params
  const { modeId } = useLocalSearchParams<{ modeId: string }>()
  const mode = GAME_MODES.find((m) => m.id === modeId) ?? GAME_MODES[0]

  // Stores
  const language = useSettingsStore((s) => s.language)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled)
  const lastPlayerNames = useSettingsStore((s) => s.lastPlayerNames)
  const lastCategories = useSettingsStore((s) => s.lastCategories)
  const saveLastSetup = useSettingsStore((s) => s.saveLastSetup)
  const isPro = useSubscriptionStore((s) => s.isPro)
  const initGame = useGameStore((s) => s.initGame)

  // ── Local state ────────────────────────────────────────────────────────────
  const [players, setPlayers] = useState<Player[]>(() =>
    // Restore last player names on mount (F10.6)
    lastPlayerNames.length >= 3
      ? lastPlayerNames.map((name, i) => playerManager.createPlayer(name, i))
      : [],
  )
  const [nameInput, setNameInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    // Restore last categories (F10.6)
    lastCategories.length > 0 ? lastCategories : ['food'],
  )

  const [impostersCount, setImpostersCount] = useState<1 | 2>(1)
  const [timerSeconds, setTimerSeconds] = useState<0 | 10 | 15 | 30>(0)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [paywallVisible, setPaywallVisible] = useState(false)

  const inputRef = useRef<TextInput>(null)

  // ── Validation ─────────────────────────────────────────────────────────────
  const hasEnoughPlayers = players.length >= mode.minPlayers
  const hasCategories = !mode.hasCategories || selectedCategories.length > 0
  const canStart = hasEnoughPlayers && hasCategories

  // ── Player handlers ────────────────────────────────────────────────────────
  const handleAddPlayer = useCallback(() => {
    const trimmed = nameInput.trim()

    if (!trimmed) {
      setInputError(t('setup.emptyName'))
      return
    }
    if (players.length >= 15) {
      setInputError(t('setup.maxPlayersWarning', { count: 15 }))
      return
    }
    const isDuplicate = players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
    )
    if (isDuplicate) {
      setInputError(t('setup.duplicateName'))
      return
    }

    haptics.selection()
    setInputError(null)
    setPlayers((prev) => [...prev, playerManager.createPlayer(trimmed, prev.length)])
    setNameInput('')
    inputRef.current?.focus()
  }, [nameInput, players, t, haptics])

  const handleRemovePlayer = useCallback(
    (playerId: string) => {
      haptics.light()
      setPlayers((prev) => prev.filter((p) => p.id !== playerId))
    },
    [haptics],
  )

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleCategoryPress = useCallback(
    (catId: string, isPremium: boolean) => {
      if (isPremium && !isPro) {
        haptics.light()
        setPaywallVisible(true)
        return
      }
      haptics.selection()
      setSelectedCategories((prev) =>
        prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
      )
    },
    [isPro, haptics],
  )

  const handleSelectAll = useCallback(() => {
    haptics.selection()
    const freeIds = CATEGORIES.filter((c) => !c.isPremium).map((c) => c.id)
    const allFreeSelected = freeIds.every((id) => selectedCategories.includes(id))

    if (allFreeSelected) {
      // Deselect all (but keep at least one if not Pro)
      setSelectedCategories([])
    } else {
      const allIds = isPro ? CATEGORIES.map((c) => c.id) : freeIds
      setSelectedCategories(allIds)
    }
  }, [selectedCategories, isPro, haptics])

  // ── Start game ─────────────────────────────────────────────────────────────
  const handleStartGame = useCallback(() => {
    if (!canStart) return

    // F16.6 — Secondary Pro gate: block premium games without subscription
    if (mode.isPremium && !isPro) {
      haptics.light()
      setPaywallVisible(true)
      return
    }

    haptics.medium()

    // Persist last setup (F10.6)
    saveLastSetup(
      players.map((p) => p.name),
      selectedCategories,
    )

    const config: GameConfig = {
      mode: mode.id as GameModeId,
      players,
      selectedCategories,
      impostersCount,
      timerSeconds,
      soundEnabled,
      hapticsEnabled,
      locale: language,
    }

    initGame(config)
    // Route to the appropriate game screen based on mode
    switch (mode.id) {
      case 'imposter':
        router.replace('/(game)/reveal' as never)
        break
      case 'heads-up':
      case 'charades':
        router.replace('/(game)/heads-up' as never)
        break
      case 'word-chain':
        router.replace('/(game)/word-chain' as never)
        break
      case 'trivia-bet':
        router.replace('/(game)/trivia-bet' as never)
        break
      case 'two-truths':
        router.replace('/(game)/two-truths' as never)
        break
      // Prompt-based free + paranoia games
      case 'truth-dare':
      case 'never-have-i-ever':
      case 'most-likely-to':
      case 'hot-takes':
      case 'would-you-rather':
      case 'paranoia':
      default:
        router.replace('/(game)/prompt-game' as never)
        break
    }
  }, [
    canStart,
    haptics,
    saveLastSetup,
    players,
    selectedCategories,
    mode.id,
    mode.isPremium,
    isPro,
    impostersCount,
    timerSeconds,
    soundEnabled,
    hapticsEnabled,
    language,
    initGame,
  ])

  // ── Section button animation ───────────────────────────────────────────────
  const advScale = useSharedValue(1)
  const advStyle = useAnimatedStyle(() => ({ transform: [{ scale: advScale.value }] }))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.headerEmoji}>{mode.emoji}</Text>
          <Text
            style={[
              styles.headerText,
              { color: theme.text.primary, fontFamily: fontFamily.displayBold },
            ]}
            numberOfLines={1}
          >
            {t(mode.nameKey)}
          </Text>
        </View>

        {/* Spacer to balance back button */}
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── PLAYERS SECTION ────────────────────────────────────────────── */}
          <SectionHeader
            title={t('setup.players')}
            count={players.length}
            theme={theme}
          />

          {/* Input row */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={nameInput}
              onChangeText={(text) => {
                setNameInput(text)
                if (inputError) setInputError(null)
              }}
              placeholder={t('setup.addPlayer')}
              placeholderTextColor={theme.text.muted}
              returnKeyType="done"
              onSubmitEditing={handleAddPlayer}
              style={[
                styles.input,
                {
                  backgroundColor: theme.bg.surface,
                  borderColor: inputError ? theme.status.error : theme.border.subtle,
                  color: theme.text.primary,
                  fontFamily: fontFamily.body,
                },
              ]}
              accessibilityLabel={t('setup.addPlayer')}
            />
            <TouchableOpacity
              onPress={handleAddPlayer}
              style={[
                styles.addBtn,
                {
                  backgroundColor: theme.accent.primary,
                  opacity: nameInput.trim() ? 1 : 0.5,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('setup.addPlayerCta')}
            >
              <Ionicons name="add" size={22} color={theme.text.onPrimary} />
            </TouchableOpacity>
          </View>

          {/* Input validation error */}
          {inputError && (
            <Text
              style={[
                styles.errorText,
                { color: theme.status.error, fontFamily: fontFamily.body },
              ]}
            >
              {inputError}
            </Text>
          )}

          {/* Not enough players warning */}
          {players.length > 0 && players.length < mode.minPlayers && (
            <Text
              style={[
                styles.warningText,
                { color: theme.text.muted, fontFamily: fontFamily.body },
              ]}
            >
              {t('setup.minPlayersWarning', { count: mode.minPlayers })}
            </Text>
          )}

          {/* Player chips */}
          {players.length > 0 && (
            <View style={styles.chipsWrap}>
              {players.map((player) => (
                <PlayerChip
                  key={player.id}
                  player={player}
                  onRemove={() => handleRemovePlayer(player.id)}
                  canRemove={players.length > mode.minPlayers}
                />
              ))}
            </View>
          )}

          {/* ── CATEGORIES SECTION ─────────────────────────────────────────── */}
          {mode.hasCategories && (
            <>
              <View style={styles.categoriesHeader}>
                <SectionHeader
                  title={t('setup.categories')}
                  theme={theme}
                />
                {/* All chip */}
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={[
                    styles.allChip,
                    {
                      backgroundColor: theme.bg.elevated,
                      borderColor: theme.border.default,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.allChipText,
                      { color: theme.text.secondary, fontFamily: fontFamily.bodyMedium },
                    ]}
                  >
                    {t('setup.selectAll')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* No category warning */}
              {selectedCategories.length === 0 && (
                <Text
                  style={[
                    styles.warningText,
                    { color: theme.text.muted, fontFamily: fontFamily.body },
                  ]}
                >
                  {t('setup.noCategoriesWarning')}
                </Text>
              )}

              {/* 2-column grid */}
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    selected={selectedCategories.includes(cat.id)}
                    isPro={isPro}
                    onPress={() => handleCategoryPress(cat.id, cat.isPremium)}
                    cardWidth={CARD_WIDTH}
                    locale={language}
                  />
                ))}
              </View>
            </>
          )}

          {/* ── ADVANCED SETTINGS ─────────────────────────────────────────── */}
          <Animated.View style={advStyle}>
            <TouchableOpacity
              onPress={() => {
                haptics.selection()
                advScale.value = withSpring(0.97, SPRING)
                setTimeout(() => {
                  advScale.value = withSpring(1, SPRING)
                }, 80)
                setAdvancedOpen((v) => !v)
              }}
              style={[
                styles.advancedToggle,
                {
                  backgroundColor: theme.bg.surface,
                  borderColor: theme.border.subtle,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.advancedToggleText,
                  { color: theme.text.secondary, fontFamily: fontFamily.bodyMedium },
                ]}
              >
                {t('setup.advanced')}
              </Text>
              {advancedOpen ? (
                <Ionicons name="chevron-up" size={18} color={theme.text.muted} />
              ) : (
                <Ionicons name="chevron-down" size={18} color={theme.text.muted} />
              )}
            </TouchableOpacity>
          </Animated.View>

          {advancedOpen && (
            <View
              style={[
                styles.advancedContent,
                {
                  backgroundColor: theme.bg.surface,
                  borderColor: theme.border.subtle,
                },
              ]}
            >
              {/* Imposters count */}
              <AdvancedRow label={t('setup.imposters')}>
                <View style={styles.chipRow}>
                  {([1, 2] as const).map((n) => (
                    <ChipOption
                      key={n}
                      label={String(n)}
                      selected={impostersCount === n}
                      disabled={n === 2 && !isPro}
                      onPress={() => {
                        if (n === 2 && !isPro) return
                        haptics.selection()
                        setImpostersCount(n)
                      }}
                      theme={theme}
                    />
                  ))}
                </View>
              </AdvancedRow>

              {/* Timer */}
              {mode.hasTimer && (
                <AdvancedRow label={t('setup.timer')}>
                  <View style={styles.chipRow}>
                    {TIMER_OPTIONS.map((sec) => (
                      <ChipOption
                        key={sec}
                        label={sec === 0 ? t('setup.timerOff') : `${sec}s`}
                        selected={timerSeconds === sec}
                        onPress={() => {
                          haptics.selection()
                          setTimerSeconds(sec)
                        }}
                        theme={theme}
                      />
                    ))}
                  </View>
                </AdvancedRow>
              )}
            </View>
          )}

          {/* Bottom spacer for CTA */}
          <View style={styles.ctaSpacer} />
        </ScrollView>

        {/* ── START GAME CTA (sticky bottom) ─────────────────────────────── */}
        <View
          style={[
            styles.ctaContainer,
            {
              backgroundColor: theme.bg.primary,
              borderTopColor: theme.border.subtle,
            },
          ]}
        >
          <Button
            variant="primary"
            size="lg"
            disabled={!canStart}
            onPress={handleStartGame}
            accessibilityLabel={t('setup.startGame')}
          >
            {t('setup.startGame')}
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* F16.6 — Pro gate paywall for premium games */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  theme,
}: {
  title: string
  count?: number
  theme: ReturnType<typeof useTheme>['theme']
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text.primary, fontFamily: fontFamily.displayBold },
        ]}
      >
        {title}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            styles.sectionCount,
            { color: theme.text.muted, fontFamily: fontFamily.body },
          ]}
        >
          {count}/15
        </Text>
      )}
    </View>
  )
}

function AdvancedRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  return (
    <View style={styles.advancedRow}>
      <Text
        style={[
          styles.advancedLabel,
          { color: theme.text.secondary, fontFamily: fontFamily.body },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  )
}

function ChipOption({
  label,
  selected,
  disabled = false,
  onPress,
  theme,
}: {
  label: string
  selected: boolean
  disabled?: boolean
  onPress: () => void
  theme: ReturnType<typeof useTheme>['theme']
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chipOption,
        {
          backgroundColor: selected ? theme.accent.primary : theme.bg.elevated,
          borderColor: selected ? theme.accent.primary : theme.border.default,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      <Text
        style={[
          styles.chipOptionText,
          {
            color: selected ? theme.text.onPrimary : theme.text.secondary,
            fontFamily: selected ? fontFamily.bodyBold : fontFamily.body,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerText: {
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
  },
  sectionCount: {
    fontSize: fontSize.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.sm,
    marginTop: -spacing.xs,
  },
  warningText: {
    fontSize: fontSize.sm,
    marginTop: -spacing.xs,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  allChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  allChipText: {
    fontSize: fontSize.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  advancedToggleText: {
    fontSize: fontSize.md,
  },
  advancedContent: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  advancedLabel: {
    fontSize: fontSize.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chipOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipOptionText: {
    fontSize: fontSize.sm,
  },
  ctaSpacer: {
    height: spacing.xl,
  },
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.md : spacing.sm,
    borderTopWidth: 1,
  },
})
