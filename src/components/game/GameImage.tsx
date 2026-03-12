import { Image, StyleSheet } from 'react-native'
import type { GameModeId } from '@/types'
import { GAME_IMAGES } from '@/utils/gameImages'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface GameImageProps {
  id: GameModeId
  size?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function GameImage({ id, size = 44 }: GameImageProps) {
  return (
    <Image
      source={GAME_IMAGES[id]}
      style={[s.image, { width: size, height: size, borderRadius: Math.round(size * 0.2) }]}
      resizeMode="cover"
    />
  )
}

const s = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
})
