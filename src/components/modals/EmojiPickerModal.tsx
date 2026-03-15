import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { Modal } from '@/components/ui/Modal'
import { EMOJI_CATEGORIES } from '@/data/emojiPicker'

// ─────────────────────────────────────────────────────────────────────────────
// EmojiPickerModal — Category tabs + emoji grid for player avatar selection
// ─────────────────────────────────────────────────────────────────────────────

interface EmojiPickerModalProps {
  visible: boolean
  currentEmoji?: string
  onSelect: (emoji: string | undefined) => void
  onClose: () => void
}

const EMOJI_CELL_SIZE = 40
const NUM_COLUMNS = 8

export function EmojiPickerModal({
  visible,
  currentEmoji,
  onSelect,
  onClose,
}: EmojiPickerModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [activeCategoryId, setActiveCategoryId] = useState(EMOJI_CATEGORIES[0].id)

  const gridOpacity = useSharedValue(1)
  const gridStyle = useAnimatedStyle(() => ({ opacity: gridOpacity.value }))

  const activeCategory = EMOJI_CATEGORIES.find((c) => c.id === activeCategoryId) ?? EMOJI_CATEGORIES[0]

  const handleCategoryPress = (id: string) => {
    if (id === activeCategoryId) return
    gridOpacity.value = withTiming(0, { duration: 80 }, () => {
      gridOpacity.value = withTiming(1, { duration: 150 })
    })
    setActiveCategoryId(id)
  }

  const handleEmojiPress = (emoji: string) => {
    onSelect(emoji)
    onClose()
  }

  const handleReset = () => {
    onSelect(undefined)
    onClose()
  }

  return (
    <Modal visible={visible} position="bottom" onClose={onClose}>
      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: theme.text.primary, fontFamily: fontFamily.displayBold },
        ]}
      >
        {t('emojiPicker.title')}
      </Text>

      {/* Category tab strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabStrip}
        contentContainerStyle={styles.tabStripContent}
      >
        {EMOJI_CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategoryId
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategoryPress(cat.id)}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.accent.primary : theme.bg.surface,
                  borderColor: isActive ? theme.accent.primary : theme.border.subtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? theme.text.onPrimary : theme.text.secondary,
                    fontFamily: isActive ? fontFamily.bodyBold : fontFamily.body,
                  },
                ]}
              >
                {t(cat.labelKey)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Emoji grid */}
      <Animated.View style={[styles.gridWrapper, gridStyle]}>
        <FlatList
          data={activeCategory.emojis}
          keyExtractor={(item) => item}
          numColumns={NUM_COLUMNS}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isSelected = item === currentEmoji
            return (
              <TouchableOpacity
                onPress={() => handleEmojiPress(item)}
                style={[
                  styles.emojiCell,
                  isSelected && {
                    borderColor: theme.border.focus,
                    borderWidth: 2,
                    borderRadius: radius.sm,
                    backgroundColor: theme.accent.primary + '22',
                  },
                ]}
              >
                <Text style={styles.emoji}>{item}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </Animated.View>

      {/* Reset button */}
      <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
        <Text
          style={[
            styles.resetText,
            { color: theme.text.muted, fontFamily: fontFamily.body },
          ]}
        >
          {t('emojiPicker.reset')}
        </Text>
      </TouchableOpacity>
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
  tabStrip: {
    marginBottom: spacing.md,
  },
  tabStripContent: {
    gap: spacing.xs,
    paddingHorizontal: 2,
  },
  tab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tabText: {
    fontSize: fontSize.xs,
  },
  gridWrapper: {
    marginBottom: spacing.md,
  },
  emojiCell: {
    width: EMOJI_CELL_SIZE,
    height: EMOJI_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resetText: {
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
})
