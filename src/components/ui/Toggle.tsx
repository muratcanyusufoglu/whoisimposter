import React from 'react'
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native'
import { useTheme, fontSize, fontFamily, spacing } from '@/theme'

interface ToggleProps {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
  description?: string
  disabled?: boolean
  style?: ViewStyle
}

/**
 * Themed toggle switch with label and optional description.
 * Used for sound/haptics settings and advanced game options.
 */
export function Toggle({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  style,
}: ToggleProps) {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: theme.text.primary }]}>
          {label}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: theme.text.secondary }]}>
            {description}
          </Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.border.default,
          true: theme.accent.primary,
        }}
        thumbColor={value ? theme.text.onPrimary : theme.text.muted}
        ios_backgroundColor={theme.border.default}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyMedium,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
  },
})
