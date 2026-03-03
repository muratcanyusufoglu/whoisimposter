import React from 'react'
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useTheme, fontSize, fontFamily, radius, spacing } from '@/theme'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
  accessibilityLabel?: string
}

/**
 * Selectable pill chip — used for category selection, timer options, imposter count, etc.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: ChipProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 20, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const handlePress = () => {
    if (disabled || !onPress) return
    Haptics.selectionAsync().catch(() => {})
    onPress()
  }

  return (
    <Animated.View style={[animatedStyle, disabled && styles.disabled]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected, disabled }}
        style={[
          styles.container,
          {
            backgroundColor: selected
              ? theme.accent.primary + '18'
              : theme.bg.surface,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? theme.border.focus : theme.border.default,
            borderRadius: radius.full,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: selected ? theme.accent.primary : theme.text.secondary,
              fontFamily: selected ? fontFamily.bodyBold : fontFamily.body,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.sm,
    letterSpacing: 0.1,
  },
  disabled: {
    opacity: 0.4,
  },
})
