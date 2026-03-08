import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useGameStore } from '@/store/gameStore'
import { useHaptics } from '@/hooks/useHaptics'
import { GAME_MODES } from '@/data/games'
import { GameModeCard } from '@/components/game/GameModeCard'
import { RatingModal } from '@/components/modals/RatingModal'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { GameModeDefinition } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN — Party game list + F8.3 modal sequence
// ─────────────────────────────────────────────────────────────────────────────

// F8.3 sequence timings
const RATING_DELAY_MS = 1500
const PAYWALL_AFTER_RATING_MS = 500

const SPRING = { damping: 20, stiffness: 200 }

export default function HomeScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const ratingState = useSettingsStore((s) => s.ratingState)
  const paywallSeenCount = useSettingsStore((s) => s.paywallSeenCount)
  const isPro = useSubscriptionStore((s) => s.isPro)
  const roundPhase = useGameStore((s) => s.roundPhase)

  const [ratingVisible, setRatingVisible] = useState(false)
  const [paywallVisible, setPaywallVisible] = useState(false)

  // Guard so sequence only fires once per mount
  const sequenceFiredRef = useRef(false)

  // ── F8.3 Modal sequence ────────────────────────────────────────────────────
  useEffect(() => {
    if (sequenceFiredRef.current || isPro) return
    sequenceFiredRef.current = true

    const shouldShowRating = ratingState === 'unseen'
    const shouldShowPaywall = paywallSeenCount === 0

    if (shouldShowRating) {
      const timer = setTimeout(() => setRatingVisible(true), RATING_DELAY_MS)
      return () => clearTimeout(timer)
    }

    if (shouldShowPaywall) {
      const timer = setTimeout(() => setPaywallVisible(true), RATING_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleRatingClose = () => {
    setRatingVisible(false)
    // After rating, show paywall if never seen before
    if (paywallSeenCount === 0 && !isPro) {
      setTimeout(() => setPaywallVisible(true), PAYWALL_AFTER_RATING_MS)
    }
  }

  // ── Entrance animations ────────────────────────────────────────────────────
  const op0 = useSharedValue(0)
  const ty0 = useSharedValue(16)
  const op1 = useSharedValue(0)
  const ty1 = useSharedValue(16)

  // Trigger synchronously on first render (pattern used throughout this project)
  useState(() => {
    op0.value = withSpring(1, SPRING)
    ty0.value = withSpring(0, SPRING)
    op1.value = withDelay(150, withTiming(1, { duration: 350 }))
    ty1.value = withDelay(150, withSpring(0, SPRING))
  })

  const headerStyle = useAnimatedStyle(() => ({
    opacity: op0.value,
    transform: [{ translateY: ty0.value }],
  }))
  const listStyle = useAnimatedStyle(() => ({
    opacity: op1.value,
    transform: [{ translateY: ty1.value }],
  }))

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleModePress = (mode: GameModeDefinition, locked: boolean) => {
    if (locked) {
      setPaywallVisible(true)
      return
    }
    // F10 will create /(game)/setup — navigate with modeId param
    router.push({ pathname: '/(game)/setup', params: { modeId: mode.id } } as never)
  }

  const hasActiveGame = roundPhase !== 'idle'

  // ── Render item ────────────────────────────────────────────────────────────
  const renderItem = ({ item }: ListRenderItemInfo<GameModeDefinition>) => {
    const locked = item.isPremium && !isPro
    return (
      <GameModeCard
        mode={item}
        locked={locked}
        onPress={() => handleModePress(item, locked)}
      />
    )
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top']}
    >
      {/* F19.1 Animated background */}
      <AnimatedBackground />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Text
          style={[
            styles.title,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
        >
          {t('home.title')}
        </Text>
      </Animated.View>

      {/* Quick Resume chip */}
      {hasActiveGame && (
        <Animated.View style={[styles.resumeWrap, headerStyle]}>
          <TouchableOpacity
            onPress={() => {
              haptics.selection()
              router.push('/(game)/play' as never)
            }}
            style={[
              styles.resumeChip,
              {
                backgroundColor: theme.bg.elevated,
                borderColor: theme.accent.primary,
              },
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.resumeText,
                { color: theme.accent.primary, fontFamily: fontFamily.bodyMedium },
              ]}
            >
              {t('home.quickResume')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Game mode list */}
      <Animated.View style={[styles.listWrap, listStyle]}>
        <FlatList<GameModeDefinition>
          data={GAME_MODES}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Animated.View>

      {/* ── Modals (F8.3 sequence) ──────────────────────────────────────────── */}
      <RatingModal visible={ratingVisible} onClose={handleRatingClose} />
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.8,
  },
  resumeWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resumeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  resumeText: {
    fontSize: fontSize.sm,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    paddingTop: spacing.xs,
  },
  separator: {
    height: spacing.sm,
  },
})
