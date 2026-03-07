import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useTheme } from '@/theme'
import { fontFamily, fontSize } from '@/theme/tokens'
import { useHaptics } from '@/hooks/useHaptics'

// ─────────────────────────────────────────────────────────────────────────────
// GLASS TAB BAR
// iOS 26+: expo-glass-effect GlassView (Liquid Glass / blurred glass)
// iOS < 26 / Android: semi-transparent surface with backdrop blur simulation
// ─────────────────────────────────────────────────────────────────────────────

const TAB_BAR_HEIGHT = 60

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, themeId } = useTheme()
  const insets = useSafeAreaInsets()
  const haptics = useHaptics()

  // Glass is available on iOS with the necessary system support
  const glassAvailable = Platform.OS === 'ios' && isGlassEffectAPIAvailable()
  const colorScheme: 'light' | 'dark' = themeId === 'light' ? 'light' : 'dark'

  const bottomPad = Math.max(insets.bottom, 8)

  return (
    <View
      style={[
        s.wrapper,
        { height: TAB_BAR_HEIGHT + bottomPad },
      ]}
    >
      {/* ── Background layer ── */}
      {glassAvailable ? (
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle="regular"
          colorScheme={colorScheme}
        />
      ) : (
        // Android / older iOS: simulate glass with semi-transparent surface + blur tint
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                Platform.OS === 'android'
                  ? theme.bg.surface + 'F2'   // slightly more opaque on Android
                  : theme.bg.surface + 'D8',  // lighter on iOS (supports backdrop blur)
            },
          ]}
        />
      )}

      {/* ── Top border — subtle definition line ── */}
      <View style={[s.topBorder, { backgroundColor: theme.border.subtle }]} />

      {/* ── Tab items ── */}
      <View style={[s.tabs, { paddingBottom: bottomPad }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index

          const activeColor = theme.accent.primary
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
              {/* Active indicator pill behind icon */}
              {isFocused && (
                <View
                  style={[
                    s.activePill,
                    { backgroundColor: theme.accent.primary + '18' },
                  ]}
                />
              )}

              {icon}

              <Text
                style={[
                  s.label,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontFamily: isFocused
                      ? fontFamily.bodyBold
                      : fontFamily.body,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
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
