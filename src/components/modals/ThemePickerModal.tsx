import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { AppTheme, ThemeId } from '@/theme/types'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { THEMES } from '@/theme'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Modal } from '@/components/ui/Modal'
import { AccentColorPickerModal } from '@/components/modals/AccentColorPickerModal'

// ─────────────────────────────────────────────────────────────────────────────
// THEME PICKER MODAL — 9 themes in a 3×3 grid + Custom+ row
// Row 1: Dark (free) · Light (free) · Neon (free)
// Row 2: Candy (free) · Party (free) · Sunset (free)
// Row 3: Golden (free) · Ember (PRO) · Aurora (PRO)
// Row 4: Custom + (full-width pill)
// ─────────────────────────────────────────────────────────────────────────────

interface ThemePickerModalProps {
  visible: boolean
  onClose: () => void
  onPaywall?: () => void
}

const THEME_DEFS: { id: ThemeId; labelKey: string; isPremium: boolean }[] = [
  { id: 'dark',   labelKey: 'settings.themeDark',   isPremium: false },
  { id: 'light',  labelKey: 'settings.themeLight',  isPremium: false },
  { id: 'neon',   labelKey: 'settings.themeNeon',   isPremium: false },
  { id: 'candy',  labelKey: 'settings.themeCandy',  isPremium: false },
  { id: 'party',  labelKey: 'settings.themeParty',  isPremium: false },
  { id: 'sunset', labelKey: 'settings.themeSunset', isPremium: false },
  { id: 'golden', labelKey: 'settings.themeGolden', isPremium: false },
  { id: 'ember',  labelKey: 'settings.themeEmber',  isPremium: true  },
  { id: 'aurora', labelKey: 'settings.themeAurora', isPremium: true  },
]

// Perfect 3×3 grid
const ROW_1 = THEME_DEFS.slice(0, 3)
const ROW_2 = THEME_DEFS.slice(3, 6)
const ROW_3 = THEME_DEFS.slice(6, 9)

export function ThemePickerModal({
  visible,
  onClose,
  onPaywall,
}: ThemePickerModalProps) {
  const { theme, themeId, setTheme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const isPro = useSubscriptionStore((s) => s.isPro)
  const customAccentColor = useSettingsStore((s) => s.customAccentColor)
  const customThemeBase = useSettingsStore((s) => s.customThemeBase)
  const setCustomAccentColor = useSettingsStore((s) => s.setCustomAccentColor)
  const setCustomThemeBase = useSettingsStore((s) => s.setCustomThemeBase)

  const [accentPickerVisible, setAccentPickerVisible] = useState(false)

  const handleSelect = (id: ThemeId, isPremium: boolean) => {
    if (isPremium && !isPro) {
      haptics.warning()
      onClose()
      onPaywall?.()
      return
    }
    haptics.selection()
    setTheme(id)
    setTimeout(onClose, 300)
  }

  const handleCustomPress = () => {
    haptics.selection()
    setAccentPickerVisible(true)
  }

  const handleAccentApply = (accent: string, base: Exclude<ThemeId, 'custom'>) => {
    setCustomAccentColor(accent)
    setCustomThemeBase(base)
    setTheme('custom')
    setAccentPickerVisible(false)
    setTimeout(onClose, 300)
  }

  const renderRow = (row: typeof THEME_DEFS) =>
    row.map(({ id, labelKey, isPremium }) => {
      const themeData = THEMES[id as Exclude<ThemeId, 'custom'>]
      const isSelected = themeId === id
      const locked = isPremium && !isPro

      return (
        <ThemeSwatch
          key={id}
          id={id}
          label={t(labelKey)}
          themeData={themeData}
          selected={isSelected}
          locked={locked}
          activeTheme={theme}
          onPress={() => handleSelect(id, isPremium)}
        />
      )
    })

  const isCustomSelected = themeId === 'custom'

  return (
    <>
      <Modal visible={visible} position="center" onClose={onClose}>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: theme.text.primary, fontFamily: fontFamily.displayBold },
            ]}
          >
            {t('settings.theme')}
          </Text>

          {/* Row 1: Dark · Light · Neon */}
          <View style={styles.swatchRow}>
            {renderRow(ROW_1)}
          </View>

          {/* Row 2: Candy · Party · Sunset */}
          <View style={styles.swatchRow}>
            {renderRow(ROW_2)}
          </View>

          {/* Row 3: Golden · Ember (PRO) · Aurora (PRO) */}
          <View style={styles.swatchRow}>
            {renderRow(ROW_3)}
          </View>

          {/* Row 4: Custom + full-width pill */}
          <TouchableOpacity
            onPress={handleCustomPress}
            style={[
              styles.customPill,
              {
                backgroundColor: theme.bg.elevated,
                borderColor: isCustomSelected ? theme.accent.primary : theme.border.default,
                borderWidth: isCustomSelected ? 2 : 1,
              },
            ]}
            accessibilityLabel={t('customTheme.customPlus')}
            accessibilityRole="button"
          >
            {/* Accent preview circle */}
            <View
              style={[
                styles.accentCircle,
                { backgroundColor: customAccentColor },
              ]}
            />
            <Text
              style={[
                styles.customPillLabel,
                {
                  color: isCustomSelected ? theme.accent.primary : theme.text.secondary,
                  fontFamily: isCustomSelected ? fontFamily.bodyBold : fontFamily.bodyMedium,
                },
              ]}
            >
              {t('customTheme.customPlus')}
            </Text>
            {isCustomSelected && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.accent.primary}
                style={styles.customCheck}
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      <AccentColorPickerModal
        visible={accentPickerVisible}
        onClose={() => setAccentPickerVisible(false)}
        currentAccent={customAccentColor}
        currentBase={customThemeBase}
        onApply={handleAccentApply}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SWATCH
// ─────────────────────────────────────────────────────────────────────────────

function ThemeSwatch({
  id,
  label,
  themeData,
  selected,
  locked,
  activeTheme,
  onPress,
}: {
  id: ThemeId
  label: string
  themeData: AppTheme
  selected: boolean
  locked: boolean
  activeTheme: AppTheme
  onPress: () => void
}) {
  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 300 })
    })
    onPress()
  }

  return (
    <Animated.View style={[styles.swatchWrap, animStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.swatch,
          {
            backgroundColor: themeData.bg.primary,
            borderColor: selected
              ? activeTheme.accent.primary
              : activeTheme.border.default,
            borderWidth: selected ? 2 : 1,
          },
        ]}
        accessibilityLabel={label}
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled: locked }}
        activeOpacity={0.8}
      >
        {/* Mini preview — card strip + two accent bars */}
        <View style={styles.preview}>
          {/* Header bar (accent stripe) */}
          <View
            style={[
              styles.previewHeader,
              { backgroundColor: themeData.accent.primary + '55' },
            ]}
          />
          {/* Card body */}
          <View
            style={[
              styles.previewCard,
              { backgroundColor: themeData.bg.surface },
            ]}
          />
          {/* Accent dot */}
          <View
            style={[
              styles.accentDot,
              { backgroundColor: themeData.accent.primary },
            ]}
          />
          {/* Secondary dot */}
          <View
            style={[
              styles.secondaryDot,
              { backgroundColor: themeData.accent.secondary + 'CC' },
            ]}
          />
        </View>

        {/* Lock overlay (PRO themes for non-pro users) */}
        {locked && (
          <View
            style={[
              styles.overlay,
              { backgroundColor: 'rgba(0,0,0,0.60)' },
            ]}
          >
            <View style={[styles.lockBg, { backgroundColor: activeTheme.accent.premium + '33' }]}>
              <Ionicons name="lock-closed" size={16} color={activeTheme.accent.premium} />
            </View>
          </View>
        )}

        {/* Selected checkmark */}
        {selected && !locked && (
          <View
            style={[
              styles.checkBadge,
              { backgroundColor: activeTheme.accent.primary },
            ]}
          >
            <Ionicons name="checkmark" size={11} color={activeTheme.text.onPrimary} />
          </View>
        )}

        <Text
          style={[
            styles.swatchLabel,
            { color: themeData.text.primary, fontFamily: fontFamily.bodyMedium },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatchWrap: {
    flex: 1,
  },
  swatch: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    aspectRatio: 0.72,
    padding: spacing.xs + 2,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  previewHeader: {
    width: '85%',
    height: 6,
    borderRadius: radius.xs,
  },
  previewCard: {
    width: '85%',
    height: '38%',
    borderRadius: radius.sm,
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  secondaryDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBg: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
  },
  // ── Custom pill ────────────────────────────────────────────────────────────
  customPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
  },
  accentCircle: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
  },
  customPillLabel: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  customCheck: {
    marginLeft: spacing.xs,
  },
})
