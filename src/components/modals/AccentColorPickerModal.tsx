import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { ThemeId } from '@/theme/types'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// AccentColorPickerModal — Pick a base theme + 1 of 16 accent colors
// Internal state while browsing; written to store only on Apply.
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_COLORS: string[] = [
  '#FF4757', '#FF9F43', '#FFD700', '#C8FF47',
  '#47FF8B', '#00D2D3', '#54A0FF', '#7B61FF',
  '#CD84F1', '#FF7EB3', '#E8FF47', '#48DBFB',
  '#FF6348', '#FFEAA7', '#A29BFE', '#00B894',
]

type BaseId = Exclude<ThemeId, 'custom'>
const BASE_OPTIONS: { id: BaseId; labelKey: string }[] = [
  { id: 'dark',  labelKey: 'settings.themeDark'  },
  { id: 'light', labelKey: 'settings.themeLight' },
  { id: 'candy', labelKey: 'settings.themeCandy' },
]

interface AccentColorPickerModalProps {
  visible: boolean
  onClose: () => void
  currentAccent: string
  currentBase: BaseId
  onApply: (accent: string, base: BaseId) => void
}

export function AccentColorPickerModal({
  visible,
  onClose,
  currentAccent,
  currentBase,
  onApply,
}: AccentColorPickerModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const [localAccent, setLocalAccent] = useState(currentAccent)
  const [localBase, setLocalBase] = useState<BaseId>(currentBase)

  // Reset local state whenever modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalAccent(currentAccent)
      setLocalBase(currentBase)
    }
  }, [visible, currentAccent, currentBase])

  const handleApply = () => {
    onApply(localAccent, localBase)
    onClose()
  }

  return (
    <Modal visible={visible} position="bottom" onClose={onClose}>
      <Text
        style={[
          styles.title,
          { color: theme.text.primary, fontFamily: fontFamily.displayBold },
        ]}
      >
        {t('customTheme.label')}
      </Text>

      {/* ── Live preview strip ─────────────────────────────────────────── */}
      <View
        style={[
          styles.previewStrip,
          { backgroundColor: localAccent, borderRadius: radius.md },
        ]}
      >
        <Text
          style={[
            styles.previewAa,
            { color: '#000000', fontFamily: fontFamily.displayBold },
          ]}
        >
          Aa
        </Text>
      </View>

      {/* ── Base theme pills ───────────────────────────────────────────── */}
      <Text
        style={[
          styles.sectionLabel,
          { color: theme.text.secondary, fontFamily: fontFamily.bodyMedium },
        ]}
      >
        {t('customTheme.pickBase')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.basePillRow}
      >
        {BASE_OPTIONS.map(({ id, labelKey }) => {
          const isSelected = localBase === id
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setLocalBase(id)}
              style={[
                styles.basePill,
                {
                  backgroundColor: isSelected ? theme.accent.primary : theme.bg.elevated,
                  borderColor: isSelected ? theme.accent.primary : theme.border.default,
                },
              ]}
            >
              <Text
                style={[
                  styles.basePillLabel,
                  {
                    color: isSelected ? theme.text.onPrimary : theme.text.secondary,
                    fontFamily: isSelected ? fontFamily.bodyBold : fontFamily.body,
                  },
                ]}
              >
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── Accent swatches (4×4 grid) ────────────────────────────────── */}
      <Text
        style={[
          styles.sectionLabel,
          { color: theme.text.secondary, fontFamily: fontFamily.bodyMedium },
        ]}
      >
        {t('customTheme.pickAccent')}
      </Text>
      <View style={styles.swatchGrid}>
        {ACCENT_COLORS.map((color) => {
          const isSelected = localAccent === color
          return (
            <TouchableOpacity
              key={color}
              onPress={() => setLocalAccent(color)}
              style={[
                styles.swatch,
                { backgroundColor: color },
                isSelected && {
                  borderWidth: 3,
                  borderColor: theme.text.primary,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#000000"
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <Button variant="ghost" size="sm" onPress={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" size="sm" onPress={handleApply}>
          {t('customTheme.apply')}
        </Button>
      </View>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  previewStrip: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  previewAa: {
    fontSize: fontSize.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  basePillRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  basePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  basePillLabel: {
    fontSize: fontSize.sm,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
})
