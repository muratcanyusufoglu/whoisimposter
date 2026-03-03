import { Player } from '@/types'
import { shuffle } from '@/utils/shuffle'

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER COLOR PALETTE
// 16 distinct colors that look good on both dark and light themes.
// ─────────────────────────────────────────────────────────────────────────────

const PLAYER_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Mint Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEAA7', // Soft Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Aquamarine
  '#F7DC6F', // Golden Yellow
  '#BB8FCE', // Medium Purple
  '#85C1E9', // Light Blue
  '#82E0AA', // Medium Aquamarine
  '#F0B27A', // Sandy Brown
  '#AED6F1', // Pale Blue
  '#A9DFBF', // Pale Green
  '#F9E79F', // Cream Yellow
  '#D7BDE2', // Lavender
] as const

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER MANAGER
// Pure functions — no React, no stores, fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

export const playerManager = {

  /**
   * Create a new Player with auto-assigned color and initials.
   * @param name - The player's display name (will be trimmed).
   * @param existingCount - Number of players already in the list (for color cycling).
   */
  createPlayer(name: string, existingCount: number): Player {
    const trimmed = name.trim()
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: trimmed,
      color: PLAYER_COLORS[existingCount % PLAYER_COLORS.length],
      initials: this.getInitials(trimmed),
    }
  },

  /**
   * Validate the player list before starting a game.
   * Returns { valid: true } or { valid: false, error: string }.
   */
  validate(players: Player[]): { valid: boolean; error?: string } {
    if (players.length < 3) {
      return { valid: false, error: 'Need at least 3 players' }
    }
    if (players.length > 15) {
      return { valid: false, error: 'Maximum 15 players' }
    }
    const names = players.map((p) => p.name.toLowerCase().trim())
    if (new Set(names).size !== names.length) {
      return { valid: false, error: 'Duplicate player names' }
    }
    return { valid: true }
  },

  /**
   * Return a new shuffled array of player IDs for the reveal order.
   * Does not mutate the input array.
   */
  shuffleOrder(playerIds: string[]): string[] {
    return shuffle([...playerIds])
  },

  /**
   * Derive display initials from a name.
   * Uses up to the first 2 characters, uppercased.
   */
  getInitials(name: string): string {
    const trimmed = name.trim()
    if (!trimmed) return '?'
    return trimmed.slice(0, 2).toUpperCase()
  },
}
