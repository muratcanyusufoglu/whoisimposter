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
// THEME PICKER MODAL
// 3 swatches: Dark (free), Light (free), Neon (free).
// ─────────────────────────────────────────────────────────────────────────────

interface ThemePickerModalProps {
  visible: boolean
  onClose: () => void
  onPaywall?: () => void
}

const THEME_DEFS: { id: ThemeId; labelKey: string; isPremium: boolean }[] = [
  { id: 'dark', labelKey: 'settings.themeDark', isPremium: false },
  { id: 'light', labelKey: 'settings.themeLight', isPremium: false },
  { id: 'neon', labelKey: 'settings.themeNeon', isPremium: false },
]

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

        <View style={styles.swatches}>
          {THEME_DEFS.map(({ id, labelKey, isPremium }) => {
            const t_data = THEMES[id]
            const isSelected = themeId === id
            const locked = isPremium && !isPro

            return (
              <ThemeSwatch
                key={id}
                id={id}
                label={t(labelKey)}
                themeData={t_data}
                selected={isSelected}
                locked={locked}
                activeTheme={theme}
                onPress={() => handleSelect(id, isPremium)}
              />
            )
          })}
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
    <Animated.View style={animStyle}>
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
        {/* Mini preview */}
        <View style={styles.preview}>
          {/* Simulated card strip */}
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
        </View>

        {/* Lock / Check overlay */}
        {locked && (
          <View
            style={[
              styles.overlay,
              { backgroundColor: 'rgba(0,0,0,0.55)' },
            ]}
          >
            <Ionicons name="lock-closed" size={20} color="#fff" />
          </View>
        )}
        {selected && !locked && (
          <View
            style={[
              styles.checkBadge,
              { backgroundColor: activeTheme.accent.primary },
            ]}
          >
            <Ionicons name="checkmark" size={12} color={activeTheme.text.onPrimary} />
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
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatch: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    aspectRatio: 0.75,
    padding: spacing.sm,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewCard: {
    width: '80%',
    height: '35%',
    borderRadius: radius.sm,
  },
  accentDot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
})
