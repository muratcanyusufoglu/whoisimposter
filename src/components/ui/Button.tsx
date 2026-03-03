import React from 'react'
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useTheme, spacing, fontSize, radius, fontFamily } from '@/theme'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
  accessibilityLabel?: string
  haptic?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// SIZE TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { height: 36, fontSize: fontSize.md, paddingH: spacing.md, radius: radius.sm },
  md: { height: 46, fontSize: fontSize.lg, paddingH: spacing.lg, radius: radius.md },
  lg: { height: 56, fontSize: fontSize.xl, paddingH: spacing.xl, radius: radius.lg },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Button({
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  style,
  textStyle,
  accessibilityLabel,
  haptic = true,
}: ButtonProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const cfg = SIZE_CONFIG[size]

  // Reanimated press animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (disabled || loading) return
    scale.value = withTiming(0.96, { duration: 120 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const handlePress = () => {
    if (disabled || loading || !onPress) return
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
    onPress()
  }

  // ── Colors per variant ──
  const variantStyle = getVariantStyle(variant, theme)

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          styles.base,
          {
            height: cfg.height,
            paddingHorizontal: cfg.paddingH,
            borderRadius: cfg.radius,
            backgroundColor: variantStyle.bg,
            borderWidth: variantStyle.borderWidth,
            borderColor: variantStyle.borderColor,
            shadowColor: variantStyle.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variantStyle.shadowOpacity,
            shadowRadius: 12,
            elevation: variantStyle.elevation,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyle.textColor}
          />
        ) : (
          <Text
            style={[
              styles.label,
              {
                fontSize: cfg.fontSize,
                color: variantStyle.textColor,
                fontFamily: fontFamily.bodyBold,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT STYLE HELPER
// ─────────────────────────────────────────────────────────────────────────────

function getVariantStyle(variant: ButtonVariant, theme: ReturnType<typeof useTheme>['theme']) {
  switch (variant) {
    case 'primary':
      return {
        bg: theme.accent.primary,
        borderWidth: 1,
        borderColor: theme.accent.primary + '4D', // 30% opacity
        textColor: theme.text.onPrimary,
        shadowColor: theme.glow.primary,
        shadowOpacity: 0.8,
        elevation: 6,
      }
    case 'secondary':
      return {
        bg: theme.bg.surface,
        borderWidth: 1,
        borderColor: theme.border.default,
        textColor: theme.text.primary,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      }
    case 'danger':
      return {
        bg: theme.accent.secondary,
        borderWidth: 0,
        borderColor: 'transparent',
        textColor: '#FFFFFF',
        shadowColor: theme.glow.danger,
        shadowOpacity: 0.6,
        elevation: 4,
      }
    case 'ghost':
      return {
        bg: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        textColor: theme.text.secondary,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      }
    case 'outline':
      return {
        bg: 'transparent',
        borderWidth: 1,
        borderColor: theme.border.default,
        textColor: theme.text.primary,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      }
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
})
