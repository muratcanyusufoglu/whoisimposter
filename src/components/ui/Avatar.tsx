import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { useTheme, fontSize, fontFamily } from '@/theme'

interface AvatarProps {
  name: string
  color: string        // Player's assigned color (background)
  size?: number        // Diameter in px (default 48)
  style?: ViewStyle
}

/**
 * Circle avatar showing player initials on their assigned color background.
 */
export function Avatar({ name, color, size = 48, style }: AvatarProps) {
  const { theme } = useTheme()

  const initials = getInitials(name)
  const textSize = size * 0.38

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: theme.border.subtle,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: textSize,
            color: theme.text.inverse,
            fontFamily: fontFamily.displayBold,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || parts[0] === '') return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    letterSpacing: -0.5,
  },
})
