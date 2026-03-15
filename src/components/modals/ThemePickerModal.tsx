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
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useHaptics } from '@/hooks/useHaptics'
import { Modal } from '@/components/ui/Modal'

// ─────────────────────────────────────────────────────────────────────────────
// THEME PICKER MODAL — 7 themes in a 3+2+2 grid
// Row 1: Dark (free) · Light (free) · Neon (free)
// Row 2: Candy (free) · Party (free)
// Row 3: Ember (PRO) · Aurora (PRO)
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
  { id: 'ember',  labelKey: 'settings.themeEmber',  isPremium: true  },
  { id: 'aurora', labelKey: 'settings.themeAurora', isPremium: true  },
]

// Row 1: free trio  |  Row 2: free pair  |  Row 3: PRO pair
const ROW_1 = THEME_DEFS.slice(0, 3)
const ROW_2 = THEME_DEFS.slice(3, 5)
const ROW_3 = THEME_DEFS.slice(5, 7)

export function ThemePickerModal({
  visible,
  onClose,
  onPaywall,
}: ThemePickerModalProps) {
  const { theme, themeId, setTheme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const isPro = useSubscriptionStore((s) => s.isPro)

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

  const renderRow = (row: typeof THEME_DEFS) =>
    row.map(({ id, labelKey, isPremium }) => {
      const themeData = THEMES[id]
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

  return (
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

        {/* Row 2: Candy · Party */}
        <View style={styles.swatchRow}>
          {renderRow(ROW_2)}
        </View>

        {/* Row 3: Ember · Aurora (PRO) */}
        <View style={styles.swatchRow}>
          {renderRow(ROW_3)}
        </View>
      </View>
    </Modal>
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
})
