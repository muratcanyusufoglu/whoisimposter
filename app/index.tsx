import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { getItem, STORAGE_KEYS } from '@/utils/storage'
import { useTheme } from '@/theme'

type Destination = '/onboarding/language' | '/(main)/home'

export default function Index() {
  const { theme } = useTheme()
  const [destination, setDestination] = useState<Destination | null>(null)

  useEffect(() => {
    getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED).then((completed) => {
      setDestination(completed ? '/(main)/home' : '/onboarding/language')
    })
  }, [])

  if (destination === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent.primary} />
      </View>
    )
  }

  return <Redirect href={destination} />
}
