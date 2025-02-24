// Test file for our sexy pairing logic! 🧪
import { generatePairings } from './pairingLogic'
import { Player } from '../types/player'
import { describe, test, expect } from '@jest/globals'

describe('generatePairings', () => {
  // Mock players for testing
  const players: Player[] = [
    { id: '1', name: 'Michael Scott', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true },
    { id: '2', name: 'Dwight K. Schrute', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true },
    { id: '3', name: 'Jim Halpert', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true },
    { id: '4', name: 'Pam Beesly', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true },
    { id: '5', name: 'Stanley Hudson', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true },
    { id: '6', name: 'Kevin Malone', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true },
    { id: '7', name: 'Andy Bernard', stats: { wins: 0, losses: 0, doves: 0, handicap: 1, benched: 0, games: 0 }, isActive: true }
  ]

  // Test case 1: Board A winners with consecutive wins
  test('should rotate Board A winners after 3 consecutive wins', () => {
    const boardAWinners = [players[0], players[1]]
    boardAWinners[0].stats.consecutiveWins = 3
    boardAWinners[1].stats.consecutiveWins = 3

    const result = generatePairings({
      availablePlayers: players,
      boardCount: 2,
      pairingHistory: { pairingCounts: {}, pairWins: {}, pairings: [], lastBenchedRound: {} },
      currentRound: 2,
      promotedPlayers: boardAWinners,
      previousRoundBoards: [
        { boardId: 'A', team1: boardAWinners, team2: [players[2], players[3]] }
      ]
    })

    // Board A winners should not be together anymore
    const boardA = result.boards.find(b => b.boardId === 'A')
    expect(boardA?.team1).not.toEqual(boardAWinners)
  })

  // Test case 2: 1v1 winner promotion with bench partner
  test('should promote 1v1 winner with benched partner', () => {
    const winner = players[0]
    const benchedPlayer = players[1]
    benchedPlayer.stats.lastBenchedRound = 1

    const result = generatePairings({
      availablePlayers: players,
      boardCount: 2,
      pairingHistory: { pairingCounts: {}, pairWins: {}, pairings: [], lastBenchedRound: {} },
      currentRound: 2,
      promotedPlayers: [winner],
      previousRoundBoards: [
        { boardId: 'B', team1: [winner], team2: [players[2]] }
      ]
    })

    // Winner should be paired with benched player on Board A
    const boardA = result.boards.find(b => b.boardId === 'A')
    expect(boardA?.team1.map(p => p.id)).toContain(winner.id)
    expect(boardA?.team1.map(p => p.id)).toContain(benchedPlayer.id)
  })

  // Test case 3: Board hierarchy maintenance
  test('should maintain board hierarchy with proper relegation', () => {
    const boardALosers = [players[0], players[1]]
    const boardBWinners = [players[2], players[3]]

    const result = generatePairings({
      availablePlayers: players,
      boardCount: 2,
      pairingHistory: { pairingCounts: {}, pairWins: {}, pairings: [], lastBenchedRound: {} },
      currentRound: 2,
      promotedPlayers: boardBWinners,
      previousRoundBoards: [
        { boardId: 'A', team1: boardALosers, team2: [players[4], players[5]] },
        { boardId: 'B', team1: boardBWinners, team2: [players[6]] }
      ]
    })

    // Board B winners should be on Board A
    const boardA = result.boards.find(b => b.boardId === 'A')
    expect(boardA?.team1.map(p => p.id)).toContain(boardBWinners[0].id)
    expect(boardA?.team1.map(p => p.id)).toContain(boardBWinners[1].id)

    // Board A losers should be on Board B
    const boardB = result.boards.find(b => b.boardId === 'B')
    expect(boardB?.team1.map(p => p.id)).toContain(boardALosers[0].id)
    expect(boardB?.team1.map(p => p.id)).toContain(boardALosers[1].id)
  })

  // Test case 4: Bench rotation
  test('should not bench recently benched players or winners', () => {
    const recentlyBenched = players[0]
    recentlyBenched.stats.lastBenchedRound = 1
    const winner = players[1]

    const result = generatePairings({
      availablePlayers: players,
      boardCount: 2,
      pairingHistory: { pairingCounts: {}, pairWins: {}, pairings: [], lastBenchedRound: {} },
      currentRound: 2,
      promotedPlayers: [winner],
      previousRoundBoards: [
        { boardId: 'A', team1: [winner], team2: [players[2]] }
      ]
    })

    // Recently benched and winners should not be in bench
    expect(result.bench.map(p => p.id)).not.toContain(recentlyBenched.id)
    expect(result.bench.map(p => p.id)).not.toContain(winner.id)
  })
}) 