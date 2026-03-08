import React from 'react'
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, spacing, fontSize, fontFamily } from '@/theme'

interface ScreenHeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightElement?: React.ReactNode
  style?: ViewStyle
}

/**
 * Standard screen header: back button (left), title (center), optional right slot.
 * All colors from theme — zero hardcoded values.
 */
export function ScreenHeader({
  title,
  showBack = true,
  onBack,
  rightElement,
  style,
}: ScreenHeaderProps) {
  const { theme } = useTheme()
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <View style={[styles.container, style]}>
      {/* Left — back button */}
      <View style={styles.side}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
          </Pressable>
        )}
      </View>

      {/* Center — title */}
      <View style={styles.titleContainer}>
        {title ? (
          <Text
            style={[styles.title, { color: theme.text.primary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>

      {/* Right — optional element */}
      <View style={[styles.side, styles.rightSide]}>
        {rightElement}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.displayBold,
    letterSpacing: -0.3,
  },
})
