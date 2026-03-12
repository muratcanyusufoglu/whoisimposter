import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as StoreReview from 'expo-store-review'
import Constants from 'expo-constants'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { ThemePickerModal } from '@/components/modals/ThemePickerModal'
import { StatsModal } from '@/components/modals/StatsModal'
import { Divider } from '@/components/ui/Divider'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PRIVACY_URL = 'https://whosimposter.party/privacy'
const TERMS_URL   = 'https://whosimposter.party/terms'

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
]

const SPRING = { damping: 20, stiffness: 200 }

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0'

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()

  const language          = useSettingsStore((s) => s.language)
  const soundEnabled      = useSettingsStore((s) => s.soundEnabled)
  const hapticsEnabled    = useSettingsStore((s) => s.hapticsEnabled)
  const setLanguage       = useSettingsStore((s) => s.setLanguage)
  const setSoundEnabled   = useSettingsStore((s) => s.setSoundEnabled)
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled)
  const isPro             = useSubscriptionStore((s) => s.isPro)
  const setProOverride    = useSubscriptionStore((s) => s._setProOverride)

  const [paywallVisible, setPaywallVisible]       = useState(false)
  const [themePickerVisible, setThemePickerVisible] = useState(false)
  const [langPickerVisible, setLangPickerVisible]   = useState(false)
  const [statsVisible, setStatsVisible]             = useState(false)

  // ─── Entrance animation ───────────────────────────────────────────────────
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

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleRateApp = async () => {
    haptics.selection()
    const available = await StoreReview.isAvailableAsync()
    if (available) {
      await StoreReview.requestReview()
    }
  }

  const handleOpenURL = (url: string) => {
    haptics.light()
    Linking.openURL(url).catch(() => {})
  }

  const currentLangLabel =
    LANGUAGES.find((l) => l.code === language)?.label ?? 'English'

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[s.safeArea, { backgroundColor: theme.bg.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <Animated.View style={[s.header, fadeStyle]}>
        <Text style={[s.title, { color: theme.text.primary }]}>
          {t('settings.title')}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        style={fadeStyle}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Upgrade to PRO ── */}
        {!isPro && (
          <TouchableOpacity
            onPress={() => { haptics.medium(); setPaywallVisible(true) }}
            style={[s.upgradeCard, { backgroundColor: theme.accent.primary }]}
            accessibilityRole="button"
          >
            <Ionicons name="trophy" size={22} color={theme.text.onPrimary} />
            <Text style={[s.upgradeText, { color: theme.text.onPrimary }]}>
              {t('settings.upgrade')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text.onPrimary} />
          </TouchableOpacity>
        )}

        {/* ── Stats & Achievements ── */}
        <View style={[s.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.stats')}
            onPress={() => { haptics.selection(); setStatsVisible(true) }}
            theme={theme}
          />
        </View>

        {/* ── Appearance ── */}
        <View style={[s.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.theme')}
            onPress={() => { haptics.selection(); setThemePickerVisible(true) }}
            theme={theme}
          />
          <Divider />
          <SettingsRow
            label={t('settings.language')}
            value={currentLangLabel}
            onPress={() => { haptics.selection(); setLangPickerVisible(true) }}
            theme={theme}
          />
        </View>

        {/* ── Preferences ── */}
        <View style={[s.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <View style={s.toggleRow}>
            <Text style={[s.rowLabel, { color: theme.text.primary }]}>
              {t('settings.sound')}
            </Text>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => { haptics.selection(); setSoundEnabled(val) }}
              trackColor={{ false: theme.border.default, true: theme.accent.primary }}
              thumbColor={
                Platform.OS === 'ios' ? '#fff'
                : soundEnabled ? theme.accent.primary : '#f4f3f4'
              }
            />
          </View>
          <Divider />
          <View style={s.toggleRow}>
            <Text style={[s.rowLabel, { color: theme.text.primary }]}>
              {t('settings.haptics')}
            </Text>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => { haptics.selection(); setHapticsEnabled(val) }}
              trackColor={{ false: theme.border.default, true: theme.accent.primary }}
              thumbColor={
                Platform.OS === 'ios' ? '#fff'
                : hapticsEnabled ? theme.accent.primary : '#f4f3f4'
              }
            />
          </View>
        </View>

        {/* ── Support ── */}
        <View style={[s.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.rate')}
            onPress={handleRateApp}
            theme={theme}
          />
          {!isPro && (
            <>
              <Divider />
              <SettingsRow
                label={t('settings.restore')}
                onPress={() => haptics.selection()}
                theme={theme}
              />
            </>
          )}
        </View>

        {/* ── Legal ── */}
        <View style={[s.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <SettingsRow
            label={t('settings.privacy')}
            onPress={() => handleOpenURL(PRIVACY_URL)}
            theme={theme}
          />
          <Divider />
          <SettingsRow
            label={t('settings.terms')}
            onPress={() => handleOpenURL(TERMS_URL)}
            theme={theme}
          />
        </View>

        {/* ── DEV: Mock PRO ── */}
        <View style={[s.section, { backgroundColor: theme.bg.surface, borderColor: theme.accent.secondary + '55' }]}>
          <View style={s.toggleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[s.rowLabel, { color: theme.accent.secondary, fontFamily: fontFamily.bodyBold }]}>
                🛠 PRO Mock
              </Text>
              <Text style={[s.rowLabel, { color: theme.text.muted, fontSize: 12, fontFamily: fontFamily.body }]}>
                Dev only — simulates purchase
              </Text>
            </View>
            <Switch
              value={isPro}
              onValueChange={(val) => { haptics.selection(); setProOverride(val) }}
              trackColor={{ false: theme.border.default, true: theme.accent.secondary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : isPro ? theme.accent.secondary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Version */}
        <Text style={[s.version, { color: theme.text.muted }]}>
          {t('settings.version', { version: APP_VERSION })}
        </Text>
      </Animated.ScrollView>

      {/* ── Modals ── */}
      <ThemePickerModal
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
        onPaywall={() => { setThemePickerVisible(false); setPaywallVisible(true) }}
      />

      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      <StatsModal visible={statsVisible} onClose={() => setStatsVisible(false)} />

      {/* Language Picker */}
      <LanguagePickerModal
        visible={langPickerVisible}
        currentCode={language}
        onSelect={(code) => {
          haptics.selection()
          setLanguage(code)
          setLangPickerVisible(false)
        }}
        onClose={() => setLangPickerVisible(false)}
      />
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function LanguagePickerModal({
  visible,
  currentCode,
  onSelect,
  onClose,
}: {
  visible: boolean
  currentCode: string
  onSelect: (code: string) => void
  onClose: () => void
}) {
  const { theme } = useTheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[lp.backdrop, { backgroundColor: theme.bg.overlay }]}>
        <Pressable style={lp.backdropPress} onPress={onClose} />
        <View style={[lp.sheet, { backgroundColor: theme.bg.surface }]}>
          {/* Handle */}
          <View style={[lp.handle, { backgroundColor: theme.border.default }]} />

          {/* Header */}
          <View style={lp.sheetHeader}>
            <Text style={[lp.sheetTitle, { color: theme.text.primary }]}>
              Language
            </Text>
            <Pressable onPress={onClose} style={lp.closeBtn}>
              <Ionicons name="close" size={20} color={theme.text.muted} />
            </Pressable>
          </View>

          {/* Language list */}
          {LANGUAGES.map((lang, idx) => {
            const isSelected = lang.code === currentCode
            return (
              <View key={lang.code}>
                {idx > 0 && <View style={[lp.rowDivider, { backgroundColor: theme.border.subtle }]} />}
                <Pressable
                  onPress={() => onSelect(lang.code)}
                  style={lp.langRow}
                >
                  <Text style={lp.flag}>{lang.flag}</Text>
                  <Text style={[
                    lp.langLabel,
                    {
                      color: isSelected ? theme.accent.primary : theme.text.primary,
                      fontFamily: isSelected ? fontFamily.bodyBold : fontFamily.body,
                    },
                  ]}>
                    {lang.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={theme.accent.primary} />
                  )}
                </Pressable>
              </View>
            )
          })}

          <View style={lp.bottomPad} />
        </View>
      </View>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS ROW
// ─────────────────────────────────────────────────────────────────────────────

function SettingsRow({
  label,
  value,
  onPress,
  theme,
}: {
  label: string
  value?: string
  onPress: () => void
  theme: ReturnType<typeof useTheme>['theme']
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.settingsRow}
      accessibilityRole="button"
    >
      <Text style={[s.rowLabel, { color: theme.text.primary }]}>{label}</Text>
      <View style={s.rowRight}>
        {value ? (
          <Text style={[s.rowValue, { color: theme.text.muted }]}>{value}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={theme.text.muted} />
      </View>
    </TouchableOpacity>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  title: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.displayBold,
    letterSpacing: -0.8,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
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
    fontFamily: fontFamily.bodyBold,
    flex: 1,
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

  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  rowValue: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
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
    fontFamily: fontFamily.body,
  },

  version: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})

const lp = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdropPress: {
    flex: 1,
  },

  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '70%',
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  sheetTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bodyBold,
  },

  closeBtn: {
    padding: spacing.xs,
  },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  flag: {
    fontSize: fontSize.xl,
  },

  langLabel: {
    flex: 1,
    fontSize: fontSize.md,
  },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.xl + spacing.md,
  },

  bottomPad: {
    height: spacing.xl,
  },
})
