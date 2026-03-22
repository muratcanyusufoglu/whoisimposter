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
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabletFrame } from '@/components/layout/TabletFrame'
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
import { GameImage } from '@/components/game/GameImage'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { DiscountPaywallModal } from '@/components/modals/DiscountPaywallModal'
import { HowToPlayModal } from '@/components/modals/HowToPlayModal'
import { EmojiPickerModal } from '@/components/modals/EmojiPickerModal'
import { SavePresetModal } from '@/components/modals/SavePresetModal'
import { GameConfig, GameModeId, Player } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// GAME SETUP SCREEN — F10
// 4 sections: Players · Categories (if applicable) · Game Mode · Advanced
// On START GAME: builds GameConfig → initGame() → navigate to reveal
// ─────────────────────────────────────────────────────────────────────────────

/** Free users can start this many games per calendar day. Premium = unlimited. */
const DAILY_FREE_LIMIT = 5
const CARD_GAP = spacing.sm
const TABLET_BREAKPOINT = 768

/** Number of category columns: 3 on tablet, 2 on phone. */
function numCols(screenWidth: number): number {
  return screenWidth >= TABLET_BREAKPOINT ? 3 : 2
}

/** Compute category card width for the given number of columns. */
function computeCardWidth(screenWidth: number): number {
  const cols = numCols(screenWidth)
  return (screenWidth - spacing.lg * 2 - CARD_GAP * (cols - 1)) / cols
}

const TIMER_OPTIONS: Array<0 | 15 | 30 | 45 | 60 | 90> = [0, 15, 30, 45, 60, 90]
const ROUND_OPTIONS: Array<1 | 2 | 3 | 5> = [1, 2, 3, 5]
const SPRING = { damping: 18, stiffness: 220 }

export default function SetupScreen() {
  const { width: screenWidth } = useWindowDimensions()
  const CARD_WIDTH = computeCardWidth(screenWidth)
  const NUM_COLS = numCols(screenWidth)
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  // Route params
  const { modeId, presetId } = useLocalSearchParams<{ modeId: string; presetId?: string }>()
  const mode = GAME_MODES.find((m) => m.id === modeId) ?? GAME_MODES[0]

  // Stores
  const language = useSettingsStore((s) => s.language)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled)
  const lastPlayerNames = useSettingsStore((s) => s.lastPlayerNames)
  const lastCategories = useSettingsStore((s) => s.lastCategories)
  const lastPlayerEmojis = useSettingsStore((s) => s.lastPlayerEmojis)
  const saveLastSetup = useSettingsStore((s) => s.saveLastSetup)
  const setPlayerEmoji = useSettingsStore((s) => s.setPlayerEmoji)
  const gamePresets = useSettingsStore((s) => s.gamePresets)
  const savePreset = useSettingsStore((s) => s.savePreset)
  const isPro = useSubscriptionStore((s) => s.isPro)
  const dailyGamesCount = useSettingsStore((s) => s.dailyGamesCount)
  const dailyGamesDate = useSettingsStore((s) => s.dailyGamesDate)
  const incrementDailyGames = useSettingsStore((s) => s.incrementDailyGames)
  const initGame = useGameStore((s) => s.initGame)

  // Resolve preset (if navigated from home with a presetId)
  const matchedPreset = presetId ? gamePresets.find((p) => p.id === presetId) : undefined

  // ── Local state ────────────────────────────────────────────────────────────
  const [players, setPlayers] = useState<Player[]>(() => {
    // If preset provided, use preset player names (presets don't carry emojis — use lastPlayerEmojis for those)
    if (matchedPreset && matchedPreset.playerNames.length >= 3) {
      return matchedPreset.playerNames.map((name, i) => ({
        ...playerManager.createPlayer(name, i),
        emoji: lastPlayerEmojis[name],
      }))
    }
    // Restore last player names + their emojis on mount (F10.6)
    return lastPlayerNames.length >= 3
      ? lastPlayerNames.map((name, i) => ({
          ...playerManager.createPlayer(name, i),
          emoji: lastPlayerEmojis[name],
        }))
      : []
  })
  const [nameInput, setNameInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (matchedPreset && matchedPreset.categories.length > 0) return matchedPreset.categories
    return lastCategories.length > 0 ? lastCategories : ['food']
  })

  const [impostersCount, setImpostersCount] = useState<1 | 2>(matchedPreset?.impostersCount ?? 1)
  const [timerSeconds, setTimerSeconds] = useState<0 | 15 | 30 | 45 | 60 | 90>(matchedPreset?.timerSeconds ?? 0)
  const [roundCount, setRoundCount] = useState<1 | 2 | 3 | 5>(matchedPreset?.roundCount ?? 1)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [paywallVisible, setPaywallVisible] = useState(false)
  const [paywallReason, setPaywallReason] = useState<'premium' | 'dailyLimit'>('premium')
  const [discountPaywallVisible, setDiscountPaywallVisible] = useState(false)
  const [howToPlayVisible, setHowToPlayVisible] = useState(false)

  // Emoji picker state
  const [emojiTarget, setEmojiTarget] = useState<string | null>(null)
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false)

  // Save preset modal state
  const [savePresetVisible, setSavePresetVisible] = useState(false)
  const atPresetMax = gamePresets.length >= 10

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

  const handleAvatarPress = useCallback((playerId: string) => {
    setEmojiTarget(playerId)
    setEmojiPickerVisible(true)
  }, [])

  const handleEmojiSelect = useCallback(
    (emoji: string | undefined) => {
      if (!emojiTarget) return
      setPlayers((prev) => {
        const updated = prev.map((p) => (p.id === emojiTarget ? { ...p, emoji } : p))
        // Immediately persist so avatars survive navigation back without starting a game
        const target = updated.find((p) => p.id === emojiTarget)
        if (target) setPlayerEmoji(target.name, emoji)
        return updated
      })
      setEmojiTarget(null)
    },
    [emojiTarget, setPlayerEmoji],
  )

  const handleSavePreset = useCallback(
    (name: string, presetEmoji?: string) => {
      savePreset({
        name,
        modeId: mode.id as GameModeId,
        playerNames: players.map((p) => p.name),
        categories: selectedCategories,
        impostersCount,
        timerSeconds,
        roundCount,
        emoji: presetEmoji,
      })
      haptics.medium()
    },
    [savePreset, mode.id, players, selectedCategories, impostersCount, timerSeconds, haptics],
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
      setPaywallReason('premium')
      setPaywallVisible(true)
      return
    }

    // Daily free-user limit: max DAILY_FREE_LIMIT games per calendar day
    if (!isPro) {
      const d = new Date()
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const todayCount = dailyGamesDate === today ? dailyGamesCount : 0
      if (todayCount >= DAILY_FREE_LIMIT) {
        haptics.light()
        setPaywallReason('dailyLimit')
        setPaywallVisible(true)
        return
      }
    }

    haptics.medium()

    // Record daily game start BEFORE routing (prevents double-tap races)
    incrementDailyGames()

    // Persist last setup (F10.6) — includes emoji map so avatars survive re-opens
    const emojiMap: Record<string, string> = {}
    players.forEach((p) => { if (p.emoji) emojiMap[p.name] = p.emoji })
    saveLastSetup(
      players.map((p) => p.name),
      selectedCategories,
      emojiMap,
    )

    const config: GameConfig = {
      mode: mode.id as GameModeId,
      players,
      selectedCategories,
      impostersCount,
      timerSeconds,
      roundCount,
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
    dailyGamesCount,
    dailyGamesDate,
    incrementDailyGames,
    impostersCount,
    timerSeconds,
    roundCount,
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
      <TabletFrame>
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
          <GameImage id={mode.id} size={28} />
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

        {/* How to play button */}
        <TouchableOpacity
          onPress={() => setHowToPlayVisible(true)}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t('howToPlay.title')}
        >
          <Ionicons name="help" size={20} color={theme.text.primary} />
        </TouchableOpacity>
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
                  onAvatarPress={() => handleAvatarPress(player.id)}
                />
              ))}
            </View>
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
              {/* Imposters count — only relevant for the imposter game */}
              {mode.id === 'imposter' && (
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
              )}

              {/* Timer — horizontal scroll so all options fit on any screen size */}
              {mode.hasTimer && (
                <AdvancedRow label={t('setup.timer')}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                  >
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
                  </ScrollView>
                </AdvancedRow>
              )}

              {/* Round count — only for modes with hasRounds */}
              {mode.hasRounds && (
                <AdvancedRow label={t('setup.rounds')}>
                  <View style={styles.chipRow}>
                    {ROUND_OPTIONS.map((n) => (
                      <ChipOption
                        key={n}
                        label={String(n)}
                        selected={roundCount === n}
                        onPress={() => {
                          haptics.selection()
                          setRoundCount(n)
                        }}
                        theme={theme}
                      />
                    ))}
                  </View>
                </AdvancedRow>
              )}
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

              {/* 2-column grid (3 on tablet) */}
              <View style={[styles.categoryGrid, NUM_COLS === 3 && styles.categoryGrid3col]}>
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

          {/* Save as Preset button */}
          <TouchableOpacity
            onPress={() => setSavePresetVisible(true)}
            style={[
              styles.savePresetBtn,
              {
                borderColor: theme.border.default,
              },
            ]}
            accessibilityRole="button"
          >
            <Ionicons name="bookmark-outline" size={16} color={theme.text.muted} />
            <Text
              style={[
                styles.savePresetText,
                { color: theme.text.muted, fontFamily: fontFamily.body },
              ]}
            >
              {t('presets.saveButton')}
            </Text>
          </TouchableOpacity>

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

      {/* F16.6 — Pro gate paywall: premium games or daily limit reached */}
      <PaywallModal
        visible={paywallVisible}
        reason={paywallReason}
        onClose={() => setPaywallVisible(false)}
        onDismiss={() => setDiscountPaywallVisible(true)}
      />

      {/* Discount paywall — shown when user dismisses main paywall */}
      <DiscountPaywallModal
        visible={discountPaywallVisible}
        onClose={() => setDiscountPaywallVisible(false)}
      />

      {/* How to play instructions */}
      <HowToPlayModal
        visible={howToPlayVisible}
        onClose={() => setHowToPlayVisible(false)}
        mode={mode}
      />

      {/* Emoji picker for player avatars */}
      <EmojiPickerModal
        visible={emojiPickerVisible}
        currentEmoji={players.find((p) => p.id === emojiTarget)?.emoji}
        onSelect={handleEmojiSelect}
        onClose={() => {
          setEmojiPickerVisible(false)
          setEmojiTarget(null)
        }}
      />

      {/* Save preset modal */}
      <SavePresetModal
        visible={savePresetVisible}
        onClose={() => setSavePresetVisible(false)}
        onSave={(name, emoji) => {
          handleSavePreset(name, emoji)
          setSavePresetVisible(false)
        }}
        defaultName={`${t(mode.nameKey)} ${players.length}p`}
        isAtMax={atPresetMax}
      />
      </TabletFrame>
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
  categoryGrid3col: {
    // Tablet: tighter gap between 3 columns looks cleaner
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
  savePresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  savePresetText: {
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
