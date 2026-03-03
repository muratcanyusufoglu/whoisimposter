import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { ChevronRight, Crown } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { ThemePickerModal } from '@/components/modals/ThemePickerModal'
import { Divider } from '@/components/ui/Divider'

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS SCREEN — F14 stub (full implementation in F14)
// Theme picker, language, toggles, upgrade CTA, legal links
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { damping: 20, stiffness: 200 }

export default function SettingsScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled)
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled)
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled)
  const isPro = useSubscriptionStore((s) => s.isPro)

  const [paywallVisible, setPaywallVisible] = useState(false)
  const [themePickerVisible, setThemePickerVisible] = useState(false)

  // ── Entrance animations ────────────────────────────────────────────────────
  const op = useSharedValue(0)
  const ty = useSharedValue(12)

  useState(() => {
    op.value = withSpring(1, SPRING)
    ty.value = withSpring(0, SPRING)
  })

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }))

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <Animated.View style={[styles.header, fadeStyle]}>
        <Text
          style={[
            styles.title,
            { color: theme.text.primary, fontFamily: fontFamily.displayBold },
          ]}
        >
          {t('settings.title')}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        style={fadeStyle}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Upgrade to PRO (if not pro) ──────────────────────────────────── */}
        {!isPro && (
          <TouchableOpacity
            onPress={() => {
              haptics.medium()
              setPaywallVisible(true)
            }}
            style={[
              styles.upgradeCard,
              { backgroundColor: theme.accent.primary },
            ]}
            accessibilityRole="button"
          >
            <Crown size={22} color={theme.text.onPrimary} />
            <Text
              style={[
                styles.upgradeText,
                { color: theme.text.onPrimary, fontFamily: fontFamily.bodyBold },
              ]}
            >
              {t('settings.upgrade')}
            </Text>
            <ChevronRight size={20} color={theme.text.onPrimary} style={styles.upgradeChevron} />
          </TouchableOpacity>
        )}

        {/* ── Appearance ────────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.theme')}
            onPress={() => {
              haptics.selection()
              setThemePickerVisible(true)
            }}
            theme={theme}
          />
        </View>

        {/* ── Preferences ───────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <View style={styles.toggleRow}>
            <Text
              style={[
                styles.rowLabel,
                { color: theme.text.primary, fontFamily: fontFamily.body },
              ]}
            >
              {t('settings.sound')}
            </Text>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => {
                haptics.selection()
                setSoundEnabled(val)
              }}
              trackColor={{ false: theme.border.default, true: theme.accent.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : soundEnabled ? theme.accent.primary : '#f4f3f4'}
            />
          </View>
          <Divider />
          <View style={styles.toggleRow}>
            <Text
              style={[
                styles.rowLabel,
                { color: theme.text.primary, fontFamily: fontFamily.body },
              ]}
            >
              {t('settings.haptics')}
            </Text>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                haptics.selection()
                setHapticsEnabled(val)
              }}
              trackColor={{ false: theme.border.default, true: theme.accent.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : hapticsEnabled ? theme.accent.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* ── Support ───────────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.rate')}
            onPress={() => haptics.selection()}
            theme={theme}
          />
          <Divider />
          <SettingsRow
            label={t('settings.restore')}
            onPress={() => haptics.selection()}
            theme={theme}
          />
        </View>

        {/* ── Legal ─────────────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.privacy')}
            onPress={() => haptics.light()}
            theme={theme}
          />
          <Divider />
          <SettingsRow
            label={t('settings.terms')}
            onPress={() => haptics.light()}
            theme={theme}
          />
        </View>

        {/* Version */}
        <Text
          style={[
            styles.version,
            { color: theme.text.muted, fontFamily: fontFamily.body },
          ]}
        >
          {t('settings.version', { version: '1.0.0' })}
        </Text>
      </Animated.ScrollView>

      {/* Modals */}
      <ThemePickerModal
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
        onPaywall={() => {
          setThemePickerVisible(false)
          setPaywallVisible(true)
        }}
      />
      {paywallVisible && (
        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
        />
      )}
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS ROW
// ─────────────────────────────────────────────────────────────────────────────

function SettingsRow({
  label,
  onPress,
  theme,
}: {
  label: string
  onPress: () => void
  theme: ReturnType<typeof useTheme>['theme']
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingsRow}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.rowLabel,
          { color: theme.text.primary, fontFamily: fontFamily.body },
        ]}
      >
        {label}
      </Text>
      <ChevronRight size={18} color={theme.text.muted} />
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['3xl'],
    letterSpacing: -0.8,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  upgradeText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  upgradeChevron: {
    marginLeft: 'auto',
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  rowLabel: {
    fontSize: fontSize.md,
  },
  version: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
