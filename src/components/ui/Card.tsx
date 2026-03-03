import React from 'react'
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTheme, radius, spacing } from '@/theme'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'elevated' | 'glass'

interface CardProps {
  children: React.ReactNode
  variant?: CardVariant
  pressable?: boolean
  selected?: boolean
  onPress?: () => void
  style?: ViewStyle
  accessibilityLabel?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Card({
  children,
  variant = 'default',
  pressable = false,
  selected = false,
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (!pressable) return
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const cardStyle = getCardStyle(variant, selected, theme)

  const inner = (
    <View
      style={[
        styles.base,
        {
          backgroundColor: cardStyle.bg,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? theme.border.focus : cardStyle.borderColor,
          borderRadius: radius.lg,
          shadowColor: cardStyle.shadowColor,
          shadowOffset: { width: 0, height: cardStyle.shadowOffset },
          shadowOpacity: cardStyle.shadowOpacity,
          shadowRadius: cardStyle.shadowRadius,
          elevation: cardStyle.elevation,
        },
        selected && {
          shadowColor: theme.glow.primary,
          shadowOpacity: 0.5,
          shadowRadius: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  )

  if (pressable) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ selected }}
        >
          {inner}
        </Pressable>
      </Animated.View>
    )
  }

  return inner
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT STYLE HELPER
// ─────────────────────────────────────────────────────────────────────────────

function getCardStyle(
  variant: CardVariant,
  selected: boolean,
  theme: ReturnType<typeof useTheme>['theme'],
) {
  switch (variant) {
    case 'default':
      return {
        bg: theme.bg.surface,
        borderColor: theme.border.subtle,
        shadowColor: 'transparent',
        shadowOffset: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      }
    case 'elevated':
      return {
        bg: theme.bg.elevated,
        borderColor: theme.border.subtle,
        shadowColor: '#000000',
        shadowOffset: 4,
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 8,
      }
    case 'glass':
      return {
        bg: theme.bg.glass,
        borderColor: theme.border.default,
        shadowColor: 'transparent',
        shadowOffset: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      }
  }
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.md,
    overflow: 'hidden',
  },
})
