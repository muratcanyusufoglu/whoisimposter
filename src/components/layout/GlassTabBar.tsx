import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useTheme } from '@/theme'
import { fontFamily, fontSize } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'

// ─────────────────────────────────────────────────────────────────────────────
// GLASS TAB BAR
// Semi-transparent frosted look using View + opacity — works in Expo Go
// and production builds on both iOS and Android.
// ─────────────────────────────────────────────────────────────────────────────

const TAB_BAR_HEIGHT = 60

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const haptics = useHaptics()

  const bottomPad = Math.max(insets.bottom, 8)

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
        {isFocused && (
          <View
            style={[s.activePill, { backgroundColor: theme.accent.primary + '22' }]}
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
    <View style={[s.wrapper, { height: TAB_BAR_HEIGHT + bottomPad, backgroundColor: theme.bg.surface + 'EE' }]}>
      {/* Hairline top border */}
      <View style={[s.topBorder, { backgroundColor: theme.border.subtle }]} />

      {/* Tab items */}
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
  },

  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },

  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
