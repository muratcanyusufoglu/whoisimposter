import { imposterLogic } from '../games/imposter'
import { Player } from '../../types'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function createMockPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player_${i}`,
    name: `Player ${i + 1}`,
    color: '#FF0000',
    initials: `P${i + 1}`,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// assignImposters
// ─────────────────────────────────────────────────────────────────────────────

describe('imposterLogic.assignImposters', () => {
  test('assigns exactly 1 imposter when count is 1', () => {
    const players = createMockPlayers(6)
    const ids = imposterLogic.assignImposters(players, 1)
    expect(ids).toHaveLength(1)
    expect(new Set(ids).size).toBe(1)
  })

  test('assigns exactly 2 imposters with ≥5 players', () => {
    const players = createMockPlayers(6)
    const ids = imposterLogic.assignImposters(players, 2)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2) // no duplicates
  })

  test('falls back to 1 imposter when requesting 2 with <5 players', () => {
    const players = createMockPlayers(4)
    const ids = imposterLogic.assignImposters(players, 2)
    expect(ids).toHaveLength(1)
  })

  test('imposter IDs are valid player IDs', () => {
    const players = createMockPlayers(5)
    const playerIds = players.map((p) => p.id)
    const ids = imposterLogic.assignImposters(players, 2)
    ids.forEach((id) => expect(playerIds).toContain(id))
  })

  test('throws when fewer than 3 players', () => {
    const players = createMockPlayers(2)
    expect(() => imposterLogic.assignImposters(players, 1)).toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getRevealContent
// ─────────────────────────────────────────────────────────────────────────────

describe('imposterLogic.getRevealContent', () => {
  const secretWord = 'Pizza'
  const imposterIds = ['player_0']

  test('crew member sees the secret word', () => {
    const content = imposterLogic.getRevealContent('player_1', secretWord, imposterIds)
    expect(content.isImposter).toBe(false)
    expect(content.word).toBe(secretWord)
  })

  test('imposter sees null word', () => {
    const content = imposterLogic.getRevealContent('player_0', secretWord, imposterIds)
    expect(content.isImposter).toBe(true)
    expect(content.word).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// resolveVotes
// ─────────────────────────────────────────────────────────────────────────────

describe('imposterLogic.resolveVotes', () => {
  test('crew wins when imposter gets most votes', () => {
    const players = createMockPlayers(4)
    const imposterIds = [players[0].id]
    const votes: Record<string, string> = {
      [players[1].id]: players[0].id,
      [players[2].id]: players[0].id,
      [players[3].id]: players[0].id,
    }
    const result = imposterLogic.resolveVotes(votes, players, imposterIds)
    expect(result.outcome).toBe('crew_wins')
    expect(result.impostersCaught).toBe(true)
    expect(result.eliminatedId).toBe(players[0].id)
  })

  test('imposter wins when an innocent gets most votes', () => {
    const players = createMockPlayers(4)
    const imposterIds = [players[0].id]
    const votes: Record<string, string> = {
      [players[0].id]: players[1].id,
      [players[2].id]: players[1].id,
      [players[3].id]: players[1].id,
    }
    const result = imposterLogic.resolveVotes(votes, players, imposterIds)
    expect(result.outcome).toBe('imposter_wins')
    expect(result.impostersCaught).toBe(false)
    expect(result.eliminatedId).toBe(players[1].id)
  })

  test('tie when two players share the top vote count', () => {
    const players = createMockPlayers(4)
    const imposterIds = [players[0].id]
    const votes: Record<string, string> = {
      [players[0].id]: players[1].id,
      [players[1].id]: players[0].id,
      [players[2].id]: players[1].id,
      [players[3].id]: players[0].id,
    }
    const result = imposterLogic.resolveVotes(votes, players, imposterIds)
    expect(result.outcome).toBe('tie')
    expect(result.eliminatedId).toBeNull()
    expect(result.impostersCaught).toBe(false)
  })

  test('tally contains correct vote counts', () => {
    const players = createMockPlayers(3)
    const imposterIds = [players[0].id]
    const votes: Record<string, string> = {
      [players[1].id]: players[0].id,
      [players[2].id]: players[0].id,
    }
    const result = imposterLogic.resolveVotes(votes, players, imposterIds)
    expect(result.tally[players[0].id]).toBe(2)
  })

  test('handles empty votes (no votes cast)', () => {
    const players = createMockPlayers(4)
    const result = imposterLogic.resolveVotes({}, players, [players[0].id])
    expect(result.outcome).toBe('tie')
    expect(result.eliminatedId).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// checkImposterGuess
// ─────────────────────────────────────────────────────────────────────────────

describe('imposterLogic.checkImposterGuess', () => {
  test('exact match returns true', () => {
    expect(imposterLogic.checkImposterGuess('Pizza', 'Pizza')).toBe(true)
  })

  test('case-insensitive match returns true', () => {
    expect(imposterLogic.checkImposterGuess('pizza', 'Pizza')).toBe(true)
    expect(imposterLogic.checkImposterGuess('PIZZA', 'pizza')).toBe(true)
  })

  test('whitespace-trimmed match returns true', () => {
    expect(imposterLogic.checkImposterGuess('  Pizza  ', 'Pizza')).toBe(true)
  })

  test('wrong guess returns false', () => {
    expect(imposterLogic.checkImposterGuess('Burger', 'Pizza')).toBe(false)
  })

  test('empty guess returns false for non-empty word', () => {
    expect(imposterLogic.checkImposterGuess('', 'Pizza')).toBe(false)
  })
})
