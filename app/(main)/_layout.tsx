import { Tabs } from 'expo-router'
import { Home, Settings } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { GlassTabBar } from '@/components/layout/GlassTabBar'

// ─────────────────────────────────────────────────────────────────────────────
// (main) TAB LAYOUT — Home + Settings
// Uses GlassTabBar: expo-glass-effect on iOS 26+, semi-transparent on Android
// ─────────────────────────────────────────────────────────────────────────────

export default function MainLayout() {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Hide the default tab bar (replaced by GlassTabBar)
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: theme.accent.primary,
        tabBarInactiveTintColor: theme.text.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('common.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('common.settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
