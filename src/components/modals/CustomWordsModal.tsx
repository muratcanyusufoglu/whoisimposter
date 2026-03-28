import { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { useSettingsStore } from '@/store/settingsStore'
import { useHaptics } from '@/hooks/useHaptics'

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM WORDS MODAL
// Allows Pro users to manage their custom word list.
// Min 5 words required to use the category.
// ─────────────────────────────────────────────────────────────────────────────

const MIN_WORDS = 5

interface CustomWordsModalProps {
  visible: boolean
  onClose: () => void
}

export function CustomWordsModal({ visible, onClose }: CustomWordsModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const haptics = useHaptics()
  const savedWords = useSettingsStore((s) => s.customWords)
  const setCustomWords = useSettingsStore((s) => s.setCustomWords)

  const [words, setWords] = useState<string[]>(savedWords)
  const [input, setInput] = useState('')
  const [internalVisible, setInternalVisible] = useState(false)
  const inputRef = useRef<TextInput>(null)

  // ── Slide-up animation ───────────────────────────────────────────────────
  const translateY = useSharedValue(600)
  const backdropOpacity = useSharedValue(0)

  useState(() => {
    // sync local state when modal opens
  })

  const open = () => {
    setWords(savedWords)
    setInput('')
    setInternalVisible(true)
    translateY.value = withSpring(0, { damping: 22, stiffness: 200 })
    backdropOpacity.value = withTiming(1, { duration: 280 })
  }

  const close = () => {
    translateY.value = withTiming(
      600,
      { duration: 240, easing: Easing.in(Easing.quad) },
      (finished) => { if (finished) runOnJS(setInternalVisible)(false) },
    )
    backdropOpacity.value = withTiming(0, { duration: 240 })
  }

  // Track visible changes
  const prevVisible = useRef(false)
  if (visible !== prevVisible.current) {
    prevVisible.current = visible
    if (visible) open()
    else close()
  }

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (words.map((w) => w.toLowerCase()).includes(trimmed.toLowerCase())) {
      setInput('')
      return
    }
    haptics.light()
    setWords((prev) => [...prev, trimmed])
    setInput('')
    inputRef.current?.focus()
  }

  const handleDelete = (index: number) => {
    haptics.light()
    setWords((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    haptics.medium()
    setCustomWords(words)
    onClose()
  }

  const handleClose = () => {
    // Discard unsaved changes
    onClose()
  }

  const canSave = words.length >= MIN_WORDS

  return (
    <RNModal
      visible={internalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { backgroundColor: theme.bg.overlay }, backdropStyle]}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.kvContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
            slideStyle,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
            <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
              <Text style={[styles.headerBtnText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: theme.text.primary, fontFamily: fontFamily.bodyBold }]}>
              {t('customWords.title')}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              style={styles.headerBtn}
            >
              <Text
                style={[
                  styles.headerBtnText,
                  {
                    color: canSave ? theme.accent.primary : theme.text.muted,
                    fontFamily: fontFamily.bodyBold,
                  },
                ]}
              >
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Word count indicator */}
          <View style={[styles.countRow, { backgroundColor: theme.bg.elevated }]}>
            <Text style={[styles.countText, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
              {words.length === 0
                ? t('customWords.emptyHint', { min: MIN_WORDS })
                : t('customWords.wordCount', { count: words.length })}
            </Text>
            {!canSave && words.length > 0 && (
              <Text style={[styles.countWarn, { color: theme.status.warning, fontFamily: fontFamily.body }]}>
                {t('customWords.needMore', { count: MIN_WORDS - words.length })}
              </Text>
            )}
          </View>

          {/* Word list */}
          <FlatList
            data={words}
            keyExtractor={(_, i) => String(i)}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <View style={[styles.wordRow, { borderBottomColor: theme.border.subtle }]}>
                <Text style={[styles.wordText, { color: theme.text.primary, fontFamily: fontFamily.bodyMedium }]}>
                  {item}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(index)} hitSlop={12}>
                  <Ionicons name="close-circle" size={20} color={theme.text.muted} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>✏️</Text>
                <Text style={[styles.emptyText, { color: theme.text.muted, fontFamily: fontFamily.body }]}>
                  {t('customWords.empty')}
                </Text>
              </View>
            }
          />

          {/* Input row */}
          <View style={[styles.inputRow, { borderTopColor: theme.border.subtle, backgroundColor: theme.bg.surface }]}>
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              placeholder={t('customWords.placeholder')}
              placeholderTextColor={theme.text.muted}
              style={[
                styles.input,
                {
                  color: theme.text.primary,
                  backgroundColor: theme.bg.elevated,
                  borderColor: theme.border.default,
                  fontFamily: fontFamily.body,
                },
              ]}
              maxLength={40}
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!input.trim()}
              style={[
                styles.addBtn,
                { backgroundColor: input.trim() ? theme.accent.primary : theme.bg.elevated },
              ]}
            >
              <Ionicons
                name="add"
                size={22}
                color={input.trim() ? theme.text.onPrimary : theme.text.muted}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  kvContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerBtn: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: fontSize.md,
  },
  headerBtnText: {
    fontSize: fontSize.md,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  countText: {
    fontSize: fontSize.sm,
  },
  countWarn: {
    fontSize: fontSize.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexGrow: 1,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
