import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// SavePresetModal — name your preset + pick a quick emoji icon
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_EMOJIS = ['🎮', '🎯', '🔥', '⭐', '🏆', '🎲', '💀', '👑']
const MAX_NAME_LEN = 24

interface SavePresetModalProps {
  visible: boolean
  onClose: () => void
  onSave: (name: string, emoji?: string) => void
  defaultName: string
  isAtMax: boolean
}

export function SavePresetModal({
  visible,
  onClose,
  onSave,
  defaultName,
  isAtMax,
}: SavePresetModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [name, setName] = useState(defaultName)
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined)

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setName(defaultName)
      setSelectedEmoji(undefined)
    }
  }, [visible, defaultName])

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed || isAtMax) return
    onSave(trimmed, selectedEmoji)
  }

  return (
    <Modal visible={visible} position="center" onClose={onClose}>
      <Text
        style={[
          styles.title,
          { color: theme.text.primary, fontFamily: fontFamily.displayBold },
        ]}
      >
        {t('presets.saveTitle')}
      </Text>

      {/* Name input */}
      <TextInput
        value={name}
        onChangeText={(text) => setName(text.slice(0, MAX_NAME_LEN))}
        style={[
          styles.input,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.default,
            color: theme.text.primary,
            fontFamily: fontFamily.body,
          },
        ]}
        placeholderTextColor={theme.text.muted}
        maxLength={MAX_NAME_LEN}
        returnKeyType="done"
        autoFocus
      />

      {/* Quick emoji row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emojiRow}
      >
        {QUICK_EMOJIS.map((emoji) => {
          const isSelected = emoji === selectedEmoji
          return (
            <TouchableOpacity
              key={emoji}
              onPress={() => setSelectedEmoji(isSelected ? undefined : emoji)}
              style={[
                styles.emojiBtn,
                isSelected && {
                  backgroundColor: theme.accent.primary + '33',
                  borderColor: theme.border.focus,
                  borderWidth: 2,
                },
              ]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Max reached warning */}
      {isAtMax && (
        <Text
          style={[
            styles.maxText,
            { color: theme.status.warning, fontFamily: fontFamily.body },
          ]}
        >
          {t('presets.maxReached')}
        </Text>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button variant="ghost" size="sm" onPress={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onPress={handleSave}
          disabled={!name.trim() || isAtMax}
        >
          {t('common.confirm')}
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
  input: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  emojiRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  emojiText: {
    fontSize: 24,
  },
  maxText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
})
