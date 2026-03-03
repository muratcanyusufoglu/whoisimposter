import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { useTheme, fontSize, fontFamily, radius, spacing } from '@/theme'

export type BadgeVariant = 'pro' | 'free' | 'new' | 'custom'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  style?: ViewStyle
}

/**
 * Small label chip — used for PRO badge, status indicators, etc.
 */
export function Badge({ label, variant = 'pro', style }: BadgeProps) {
  const { theme } = useTheme()

  const colors = getBadgeColors(variant, theme)

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  )
}

function getBadgeColors(
  variant: BadgeVariant,
  theme: ReturnType<typeof useTheme>['theme'],
) {
  switch (variant) {
    case 'pro':
      return {
        bg: theme.accent.premium + '22',
        border: theme.accent.premium + '66',
        text: theme.accent.premium,
      }
    case 'free':
      return {
        bg: theme.status.success + '22',
        border: theme.status.success + '44',
        text: theme.status.success,
      }
    case 'new':
      return {
        bg: theme.accent.primary + '22',
        border: theme.accent.primary + '44',
        text: theme.accent.primary,
      }
    case 'custom':
      return {
        bg: theme.bg.elevated,
        border: theme.border.subtle,
        text: theme.text.secondary,
      }
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
