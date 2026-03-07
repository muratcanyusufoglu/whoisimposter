import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useTheme } from '@/theme'
import { fontFamily, fontSize } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'

// ─────────────────────────────────────────────────────────────────────────────
// GLASS TAB BAR
// iOS: BlurView (expo-blur) — native frosted glass effect
// Android: semi-transparent surface fallback (BlurView not supported natively)
// ─────────────────────────────────────────────────────────────────────────────

const TAB_BAR_HEIGHT = 60

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, themeId } = useTheme()
  const insets = useSafeAreaInsets()
  const haptics = useHaptics()

  const bottomPad = Math.max(insets.bottom, 8)
  const tint = themeId === 'light' ? 'light' : 'dark'

  const tabs = state.routes.map((route, index) => {
    const { options } = descriptors[route.key]
    const isFocused = state.index === index

    const activeColor   = theme.accent.primary
    const inactiveColor = theme.text.muted

    const onPress = () => {
      haptics.selection()
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name)
      }
    }

    const icon = options.tabBarIcon?.({
      focused: isFocused,
      color: isFocused ? activeColor : inactiveColor,
      size: 22,
    })

    const label =
      typeof options.title === 'string' ? options.title : route.name

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={s.tab}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={options.tabBarAccessibilityLabel}
      >
        {/* Active glow pill */}
        {isFocused && (
          <View
            style={[s.activePill, { backgroundColor: theme.accent.primary + '20' }]}
          />
        )}

        {icon}

        <Text
          style={[
            s.label,
            {
              color: isFocused ? activeColor : inactiveColor,
              fontFamily: isFocused ? fontFamily.bodyBold : fontFamily.body,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    )
  })

  return (
    <View style={[s.wrapper, { height: TAB_BAR_HEIGHT + bottomPad }]}>
      {/* Hairline separator */}
      <View style={[s.topBorder, { backgroundColor: theme.border.subtle }]} />

      {Platform.OS === 'ios' ? (
        // iOS: real frosted glass blur
        <BlurView
          style={StyleSheet.absoluteFill}
          tint={tint}
          intensity={80}
        />
      ) : (
        // Android: semi-transparent surface
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg.surface + 'F2' }]}
        />
      )}

      {/* Tab items on top of blur layer */}
      <View style={[s.tabs, { paddingBottom: bottomPad }]}>
        {tabs}
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },

  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    zIndex: 1,
  },

  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    gap: 3,
  },

  activePill: {
    position: 'absolute',
    top: 6,
    width: 44,
    height: 34,
    borderRadius: 12,
  },

  label: {
    fontSize: fontSize.xs,
  },
})
