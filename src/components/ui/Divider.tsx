import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { useTheme, fontSize, fontFamily, spacing } from '@/theme'

interface DividerProps {
  label?: string
  style?: ViewStyle
}

/**
 * Themed horizontal divider line with optional centered label.
 */
export function Divider({ label, style }: DividerProps) {
  const { theme } = useTheme()

  if (label) {
    return (
      <View style={[styles.row, style]}>
        <View style={[styles.line, { backgroundColor: theme.border.subtle }]} />
        <Text style={[styles.label, { color: theme.text.muted }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: theme.border.subtle }]} />
      </View>
    )
  }

  return (
    <View
      style={[
        styles.simple,
        { backgroundColor: theme.border.subtle },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  simple: {
    height: 1,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
