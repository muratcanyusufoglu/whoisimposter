import { useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  ListRenderItemInfo,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { GAME_MODES } from '@/data/games'
import { GameModeDefinition } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// GAMES SHOWCASE SCREEN — Step 4 of 4
// Horizontal FlatList peek of 5 game cards + "And more" card.
// On "Let's Play!" → completeOnboarding() → navigate to /(main)/home.
// ─────────────────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - spacing.md // peek = 12px
const STAGGER_SPRING = { damping: 20, stiffness: 200 }

// Show first 5 game modes in showcase
const SHOWCASE_MODES = GAME_MODES.slice(0, 5)
const MORE_COUNT = GAME_MODES.length - SHOWCASE_MODES.length

type ShowcaseItem = GameModeDefinition | { id: '__more__'; count: number }

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  ...SHOWCASE_MODES,
  { id: '__more__', count: MORE_COUNT },
]

export default function GamesShowcaseScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding)

  // ── Entrance animations ────────────────────────────────────────────────────
  const op0 = useSharedValue(0)
  const ty0 = useSharedValue(20)
  const op1 = useSharedValue(0)
  const ty1 = useSharedValue(20)
  const op2 = useSharedValue(0)
  const ty2 = useSharedValue(20)

  useState(() => {
    op0.value = withSpring(1, STAGGER_SPRING)
    ty0.value = withSpring(0, STAGGER_SPRING)
    op1.value = withDelay(120, withTiming(1, { duration: 400 }))
    ty1.value = withDelay(120, withSpring(0, STAGGER_SPRING))
    op2.value = withDelay(350, withTiming(1, { duration: 350 }))
    ty2.value = withDelay(350, withSpring(0, STAGGER_SPRING))
  })

  const style0 = useAnimatedStyle(() => ({
    opacity: op0.value,
    transform: [{ translateY: ty0.value }],
  }))
  const style1 = useAnimatedStyle(() => ({
    opacity: op1.value,
    transform: [{ translateY: ty1.value }],
  }))
  const style2 = useAnimatedStyle(() => ({
    opacity: op2.value,
    transform: [{ translateY: ty2.value }],
  }))

  // ── Complete onboarding ────────────────────────────────────────────────────
  const handleStart = () => {
    haptics.success()
    completeOnboarding()
    // Modals (F8) will be triggered from the home screen on first visit.
    // For now, navigate directly to home.
    router.replace('/(main)/home')
  }

  // ── Render item ────────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: ListRenderItemInfo<ShowcaseItem>) => {
    if (item.id === '__more__') {
      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.bg.elevated,
              borderColor: theme.border.default,
              justifyContent: 'center',
              alignItems: 'center',
              gap: spacing.md,
            },
          ]}
        >
          <Text style={styles.moreEmoji}>✨</Text>
          <Text
            style={[
              styles.moreLine,
              { color: theme.text.primary, fontFamily: fontFamily.displayBold },
            ]}
          >
            {t('onboarding.showcase.more', { count: (item as { count: number }).count })}
          </Text>
          <Text
            style={[
              styles.moreHint,
              { color: theme.text.muted, fontFamily: fontFamily.body },
            ]}
          >
            🔓 Unlock with PRO
          </Text>
        </View>
      )
    }

    const mode = item as GameModeDefinition

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        {/* Emoji */}
        <Text style={styles.cardEmoji}>{mode.emoji}</Text>

        {/* Name */}
        <Text
          style={[
            styles.cardName,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
          numberOfLines={2}
        >
          {t(mode.nameKey)}
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.cardDesc,
            { color: theme.text.secondary, fontFamily: fontFamily.body },
          ]}
          numberOfLines={2}
        >
          {t(mode.descriptionKey)}
        </Text>

        {/* Player count badge */}
        <View
          style={[
            styles.playerBadge,
            { backgroundColor: theme.bg.elevated, borderColor: theme.border.default },
          ]}
        >
          <Text
            style={[
              styles.playerBadgeText,
              { color: theme.text.secondary, fontFamily: fontFamily.bodyMedium },
            ]}
          >
            👥 {mode.minPlayers}–{mode.maxPlayers}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top', 'bottom']}
    >
      {/* Title */}
      <Animated.View style={[styles.titleWrap, style0]}>
        <Text
          style={[
            styles.title,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
        >
          {t('onboarding.showcase.title')}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.text.secondary, fontFamily: fontFamily.body },
          ]}
        >
          {t('onboarding.welcome.benefit1')}
        </Text>
      </Animated.View>

      {/* Horizontal card list */}
      <Animated.View style={[styles.listWrap, style1]}>
        <FlatList<ShowcaseItem>
          data={SHOWCASE_ITEMS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + spacing.md}
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
        />
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <ProgressDots total={4} current={3} />
        <Animated.View style={[styles.ctaWrap, style2]}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleStart}
            accessibilityLabel={t('onboarding.showcase.cta')}
          >
            {t('onboarding.showcase.cta')}
          </Button>
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
  titleWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardEmoji: {
    fontSize: fontSize['5xl'],
  },
  cardName: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    lineHeight: fontSize['2xl'] * 1.2,
  },
  cardDesc: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    flex: 1,
  },
  playerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  playerBadgeText: {
    fontSize: fontSize.sm,
  },
  moreEmoji: {
    fontSize: 48,
  },
  moreLine: {
    fontSize: fontSize.xl,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  moreHint: {
    fontSize: fontSize.sm,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
  },
  ctaWrap: {
    width: '100%',
  },
})
