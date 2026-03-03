import { useGameStore } from '@/store/gameStore'
import { Player, VoteResult } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// useGame — convenience selectors and derived state for the game store.
// Keeps screen components thin by centralizing game logic queries here.
// ─────────────────────────────────────────────────────────────────────────────

export function useGame() {
  const store = useGameStore()

  // ── Derived: current player being revealed (respects revealOrder shuffle) ──
  const currentPlayerId = store.revealOrder[store.currentRevealIndex]
  const currentPlayer: Player | undefined = store.players.find(
    (p) => p.id === currentPlayerId,
  )

  // ── Derived: is the current player an imposter? ──
  const currentPlayerIsImposter: boolean = currentPlayer
    ? store.imposterIds.includes(currentPlayer.id)
    : false

  // ── Derived: how many players have voted ──
  const voteCount = Object.keys(store.votes).length

  // ── Derived: are all votes cast (one per non-absent player) ──
  const allVotesCast = voteCount >= store.players.length

  // ── Derived: how many players have given clues ──
  const clueCount = store.playerCluesGiven.length

  // ── Derived: are all clues in ──
  const allCluesGiven = clueCount >= store.players.length

  // ── Derived: has a specific player voted? ──
  const hasVoted = (playerId: string) => playerId in store.votes

  // ── Derived: which player did someone vote for? ──
  const getVoteTarget = (voterId: string): Player | undefined => {
    const targetId = store.votes[voterId]
    return store.players.find((p) => p.id === targetId)
  }

  // ── Derived: is the reveal phase complete? ──
  const isRevealComplete = store.currentRevealIndex >= store.players.length

  // ── Derived: imposter players ──
  const imposters: Player[] = store.players.filter((p) =>
    store.imposterIds.includes(p.id),
  )

  return {
    // Raw store state
    ...store,

    // Derived values
    currentPlayer,
    currentPlayerIsImposter,
    voteCount,
    allVotesCast,
    clueCount,
    allCluesGiven,
    isRevealComplete,
    imposters,

    // Derived helpers
    hasVoted,
    getVoteTarget,
  }
}
