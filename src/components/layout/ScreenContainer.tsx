import React from 'react'
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'

interface ScreenContainerProps {
  children: React.ReactNode
  scrollable?: boolean
  keyboardAvoiding?: boolean
  style?: ViewStyle
  contentStyle?: ViewStyle
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>
}

/**
 * Root container for every screen.
 * Provides: SafeArea insets, theme background color, optional scroll + keyboard avoidance.
 * Never set screen background colors directly — always use this component.
 */
export function ScreenContainer({
  children,
  scrollable = false,
  keyboardAvoiding = false,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) {
  const { theme } = useTheme()

  const inner = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  )

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : (
    inner
  )

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg.primary }, style]}
      edges={edges}
    >
      {content}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
})
