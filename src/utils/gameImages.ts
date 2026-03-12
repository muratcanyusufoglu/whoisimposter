import type { ImageSourcePropType } from 'react-native'
import type { GameModeId } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// GAME IMAGE MAP
// Maps each game mode ID to its AI-generated PNG asset.
// All require() calls must be static (Metro bundler requirement).
// ─────────────────────────────────────────────────────────────────────────────

export const GAME_IMAGES: Record<GameModeId, ImageSourcePropType> = {
  'imposter':          require('../../assets/whosimposter.png'),
  'truth-dare':        require('../../assets/truthordare.png'),
  'never-have-i-ever': require('../../assets/neverhaveeveri.png'),
  'most-likely-to':    require('../../assets/mostlikelyto.png'),
  'hot-takes':         require('../../assets/hottakes.png'),
  'would-you-rather':  require('../../assets/wouldyourather.png'),
  'two-truths':        require('../../assets/twotruthsoneline.png'),
  'heads-up':          require('../../assets/headsup.png'),
  'word-chain':        require('../../assets/wordchain.png'),
  'trivia-bet':        require('../../assets/trivia.png'),
  'charades':          require('../../assets/charades.png'),
  'paranoia':          require('../../assets/paranoia.png'),
}
