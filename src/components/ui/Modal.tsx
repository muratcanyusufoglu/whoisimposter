import React, { useEffect } from 'react'
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { useTheme, radius, spacing } from '@/theme'

interface ModalProps {
  visible: boolean
  onClose?: () => void
  children: React.ReactNode
  /** 'center' slides in from center (scale), 'bottom' slides up from bottom */
  position?: 'center' | 'bottom'
  /** Whether tapping the backdrop closes the modal */
  dismissible?: boolean
  contentStyle?: ViewStyle
}

/**
 * Themed modal wrapper with animated entrance, backdrop, and keyboard avoidance.
 */
export function Modal({
  visible,
  onClose,
  children,
  position = 'center',
  dismissible = true,
  contentStyle,
}: ModalProps) {
  const { theme } = useTheme()
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(position === 'bottom' ? 400 : 0)
  const scale = useSharedValue(position === 'center' ? 0.92 : 1)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 })
      if (position === 'bottom') {
        translateY.value = withSpring(0, { damping: 24, stiffness: 300 })
      } else {
        scale.value = withSpring(1, { damping: 20, stiffness: 280 })
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 })
      if (position === 'bottom') {
        translateY.value = withTiming(400, { duration: 200 })
      } else {
        scale.value = withTiming(0.92, { duration: 180 })
      }
    }
  }, [visible, position, opacity, translateY, scale])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform:
      position === 'bottom'
        ? [{ translateY: translateY.value }]
        : [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.container,
            position === 'bottom' && styles.bottomContainer,
          ]}
        >
          {/* Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              { backgroundColor: theme.bg.overlay },
              backdropStyle,
            ]}
          >
            {dismissible ? (
              <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            ) : null}
          </Animated.View>

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              position === 'bottom' ? styles.bottomContent : styles.centerContent,
              {
                backgroundColor: theme.bg.elevated,
                borderColor: theme.border.subtle,
              },
              contentAnimStyle,
              contentStyle,
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  centerContent: {
    maxWidth: 400,
    width: '90%',
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  bottomContent: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
})
