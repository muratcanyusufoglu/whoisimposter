import type {
  Player,
  VoteResult,
  PlayerRoundPoints,
  PointBreakdown,
  AchievementId,
  AchievementDefinition,
  StreakState,
  PlayerLifetimeStats,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// SCORING RULES (imposter mode only)
//
// crew_wins + impostersCaught:
//   crew members: +2 pts each
//   imposter:     +0 (or +1 bonus if they guessed the secret word correctly)
//
// imposter_wins (crew eliminated / imposter escaped):
//   imposter:     +3 pts
//   crew:         +0
//
// tie (split vote):
//   all players:  +1 pt
// ─────────────────────────────────────────────────────────────────────────────

interface CalcPointsParams {
  players: Player[]
  imposterIds: string[]
  voteResult: VoteResult
  /**
   * Whether the imposter correctly guessed the secret word after being caught.
   * Only relevant when voteResult.impostersCaught === true.
   */
  imposterGuessedCorrectly: boolean | null
}

/**
 * Calculate points earned by each player for one completed imposter round.
 * Pure function — no side effects.
 */
export function calcRoundPoints(params: CalcPointsParams): PlayerRoundPoints[] {
  const { players, imposterIds, voteResult, imposterGuessedCorrectly } = params
  const imposterSet = new Set(imposterIds)

  return players.map((player) => {
    const isImposter = imposterSet.has(player.id)
    const breakdown = calcBreakdown(
      isImposter,
      voteResult,
      imposterGuessedCorrectly ?? false,
    )
    return {
      playerId: player.id,
      points: breakdown.base + breakdown.bonusGuess,
      breakdown,
    }
  })
}

function calcBreakdown(
  isImposter: boolean,
  result: VoteResult,
  guessedCorrectly: boolean,
): PointBreakdown {
  if (result.outcome === 'tie') {
    return { base: 1, bonusGuess: 0 }
  }

  if (result.outcome === 'crew_wins') {
    if (isImposter) {
      // Caught imposter gets +0 base, +1 bonus only if they guessed the word
      return { base: 0, bonusGuess: guessedCorrectly ? 1 : 0 }
    }
    // Crew member in a crew win: +2
    return { base: 2, bonusGuess: 0 }
  }

  // outcome === 'imposter_wins'
  if (isImposter) {
    return { base: 3, bonusGuess: 0 }
  }
  return { base: 0, bonusGuess: 0 }
}

/**
 * Convert PlayerRoundPoints[] into a flat Record<playerId, delta>
 * suitable for sessionStore.addRoundPoints().
 */
export function toPointsMap(roundPoints: PlayerRoundPoints[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const rp of roundPoints) {
    map[rp.playerId] = rp.points
  }
  return map
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENT DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_blood',
    emoji: '🩸',
    titleKey: 'achievements.first_blood.title',
    descKey: 'achievements.first_blood.desc',
  },
  {
    id: 'ghost',
    emoji: '👻',
    titleKey: 'achievements.ghost.title',
    descKey: 'achievements.ghost.desc',
  },
  {
    id: 'mind_reader',
    emoji: '🔮',
    titleKey: 'achievements.mind_reader.title',
    descKey: 'achievements.mind_reader.desc',
  },
  {
    id: 'unanimous',
    emoji: '🗳️',
    titleKey: 'achievements.unanimous.title',
    descKey: 'achievements.unanimous.desc',
  },
  {
    id: 'social_butterfly',
    emoji: '🦋',
    titleKey: 'achievements.social_butterfly.title',
    descKey: 'achievements.social_butterfly.desc',
  },
  {
    id: 'sharp_eye',
    emoji: '👁️',
    titleKey: 'achievements.sharp_eye.title',
    descKey: 'achievements.sharp_eye.desc',
  },
  {
    id: 'survivor',
    emoji: '🛡️',
    titleKey: 'achievements.survivor.title',
    descKey: 'achievements.survivor.desc',
  },
  {
    id: 'master_disguise',
    emoji: '🎭',
    titleKey: 'achievements.master_disguise.title',
    descKey: 'achievements.master_disguise.desc',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENT CHECKS
//
// All functions are pure: they read state snapshots and return IDs.
//
// IMPORTANT: All lifetime threshold checks use a +1 offset (e.g. gamesPlayed + 1 === 10).
// This is because the stats store has NOT been updated yet when checkAchievementsForPlayer
// runs — the +1 accounts for the round that just happened, firing on the exact threshold.
// ─────────────────────────────────────────────────────────────────────────────

export interface AchievementCheckParams {
  /** Final outcome of this round */
  outcome: 'crew_wins' | 'imposter_wins' | 'tie'
  /** Was the imposter actually eliminated? */
  impostersCaught: boolean
  /** Did the caught imposter guess the secret word? */
  imposterGuessedCorrectly: boolean
  /** Is this specific player one of the imposters? */
  isImposter: boolean
  /** Current session streak from sessionStore (BEFORE this round is recorded) */
  sessionStreak: StreakState
  /** Vote tally from VoteResult */
  voteTally: Record<string, number>
  /** Total number of players in this round */
  playerCount: number
  /** Number of imposters in this round */
  imposterCount: number
  /** This player's lifetime stats snapshot (BEFORE this round is recorded) */
  playerLifetimeStats: PlayerLifetimeStats
  /** True if this player voted for the correct imposter */
  votedCorrectly: boolean
}

/**
 * Returns achievement IDs earned by a single player this round.
 * Call once per player. Caller is responsible for calling unlockAchievement()
 * and only showing a toast if the result is newly unlocked.
 */
export function checkAchievementsForPlayer(
  params: AchievementCheckParams,
): AchievementId[] {
  const {
    outcome,
    impostersCaught,
    imposterGuessedCorrectly,
    isImposter,
    sessionStreak,
    voteTally,
    playerCount,
    imposterCount,
    playerLifetimeStats,
    votedCorrectly,
  } = params

  const earned: AchievementId[] = []
  const stats = playerLifetimeStats

  // ── first_blood: Any crew member earns on the first crew win ──────────────
  if (!isImposter && outcome === 'crew_wins') {
    earned.push('first_blood')
    // Note: unlockAchievement returns false after first unlock, so toast only fires once
  }

  // ── ghost: Imposter wins 3 times in a row in this session ─────────────────
  // Check BEFORE recordStreakOutcome runs (hence streak.count + 1)
  if (
    isImposter &&
    outcome === 'imposter_wins' &&
    sessionStreak.currentHolder === 'imposter' &&
    sessionStreak.count + 1 >= 3
  ) {
    earned.push('ghost')
  }

  // ── mind_reader: Imposter guessed the word after being caught ─────────────
  if (isImposter && impostersCaught && imposterGuessedCorrectly) {
    earned.push('mind_reader')
  }

  // ── unanimous: All crew members voted for the imposter ────────────────────
  // "Unanimous" means every crew member (non-imposter) voted for an imposter.
  // The imposter(s) received a total of (playerCount - imposterCount) votes.
  if (outcome === 'crew_wins' && impostersCaught) {
    const crewCount = playerCount - imposterCount
    const maxVotesReceived = Math.max(...Object.values(voteTally), 0)
    if (maxVotesReceived >= crewCount) {
      earned.push('unanimous')
    }
  }

  // ── social_butterfly: 10th game played ───────────────────────────────────
  if (stats.gamesPlayed + 1 === 10) {
    earned.push('social_butterfly')
  }

  // ── sharp_eye: 5th correct imposter vote ─────────────────────────────────
  if (!isImposter && votedCorrectly && stats.timesVotedCorrectly + 1 === 5) {
    earned.push('sharp_eye')
  }

  // ── survivor: 10th crew win ───────────────────────────────────────────────
  if (!isImposter && outcome === 'crew_wins' && stats.wins + 1 === 10) {
    earned.push('survivor')
  }

  // ── master_disguise: 5th imposter win ────────────────────────────────────
  if (isImposter && outcome === 'imposter_wins' && stats.imposterWins + 1 === 5) {
    earned.push('master_disguise')
  }

  return earned
}
