import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, fontSize, fontFamily, radius, spacing } from '@/theme'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  clearable?: boolean
  onClear?: () => void
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
}

/**
 * Themed text input with optional label, error message, and clear button.
 */
export function Input({
  label,
  error,
  clearable = false,
  onClear,
  containerStyle,
  inputStyle,
  value,
  onChangeText,
  ...rest
}: InputProps) {
  const { theme } = useTheme()
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? theme.status.error
    : focused
    ? theme.border.focus
    : theme.border.default

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: theme.text.secondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.bg.surface,
            borderColor,
            borderWidth: focused ? 2 : 1,
            borderRadius: radius.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text.primary,
              fontFamily: fontFamily.body,
              fontSize: fontSize.md,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={theme.text.muted}
          selectionColor={theme.accent.primary}
          {...rest}
        />

        {clearable && value && value.length > 0 ? (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            style={styles.clearButton}
            accessibilityLabel="Clear input"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={16} color={theme.text.muted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.error, { color: theme.status.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyMedium,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: spacing.md,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    marginTop: 2,
  },
})
