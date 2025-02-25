// The brain behind the perfect fucking pairings! 🧠
import { Player } from '../types/player'
import { GamePairings } from '../store/slices/pairingSlice'

interface GeneratePairingsParams {
  availablePlayers: Player[]
  boardCount: number
  pairingHistory: GamePairings
  currentRound: number
  promotedPlayers?: Player[]
  previousRoundBoards?: PairingResult['boards']
}

interface PairingResult {
  boards: {
    boardId: string
    team1: Player[]
    team2: Player[]
    winner?: 'team1' | 'team2'
    isDove?: boolean
  }[]
  bench: Player[]
}

interface PlayerStats {
  wins: number
  losses: number
  doves: number
  handicap: number
  benched: number
  games: number
  lastBenchedRound?: number
  consecutiveWins?: number
}

// Helper to calculate total times a player has been benched
const getTotalBenchCount = (player: Player): number => {
  return player.stats.benched || 0
}

// Helper to check if a player was benched in the previous round
const wasRecentlyBenched = (player: Player, currentRound: number): boolean => {
  return player.stats.lastBenchedRound === currentRound - 1
}

// Helper to get player's current partner
const getCurrentPartner = (player: Player, boards: PairingResult['boards']): Player | null => {
  for (const board of boards) {
    const team1HasPlayer = board.team1.some(p => p.id === player.id)
    const team2HasPlayer = board.team2.some(p => p.id === player.id)
    
    if (team1HasPlayer) {
      return board.team1.find(p => p.id !== player.id) || null
    }
    if (team2HasPlayer) {
      return board.team2.find(p => p.id !== player.id) || null
    }
  }
  return null
}

// Helper to check if a player was in a 1v1 match in the previous round
const wasInSoloMatch = (
  player: Player, 
  previousRoundBoards: PairingResult['boards'] | undefined
): boolean => {
  if (!previousRoundBoards) return false
  for (const board of previousRoundBoards) {
    if ((board.team1.some(p => p.id === player.id) || 
         board.team2.some(p => p.id === player.id)) && 
        board.team1.length === 1 && 
        board.team2.length === 1) {
      return true
    }
  }
  return false
}

// Helper to get the board letter for a player in previous round
const getPreviousBoard = (
  player: Player,
  previousRoundBoards: PairingResult['boards'] | undefined
): string | null => {
  if (!previousRoundBoards) return null
  for (const board of previousRoundBoards) {
    if (board.team1.some(p => p.id === player.id) || 
        board.team2.some(p => p.id === player.id)) {
      return board.boardId
    }
  }
  return null
}

// Helper to check if a player should be promoted
const shouldPromote = (
  player: Player,
  previousRoundBoards: PairingResult['boards'] | undefined,
  wasWinner: boolean
): boolean => {
  if (!wasWinner || !previousRoundBoards) return false
  
  const previousBoard = getPreviousBoard(player, previousRoundBoards)
  return previousBoard !== null && previousBoard !== 'A'
}

// Helper to calculate win rate for a player pair
const getPairWinRate = (
  player1: Player,
  player2: Player,
  pairingHistory: GamePairings
): number => {
  const wins = pairingHistory.pairWins?.[player1.id]?.[player2.id] || 0
  const totalGames = pairingHistory.pairingCounts[player1.id]?.[player2.id] || 0
  return totalGames > 0 ? wins / totalGames : 0.5 // Default to 0.5 if never paired
}

// Helper to calculate pairing score based on win/loss ratio
const calculatePairingScore = (
  player1: Player,
  player2: Player,
  pairingCounts: GamePairings['pairingCounts']
): number => {
  // Base score starts at 1
  let score = 1

  // Penalize for number of times paired before
  const timesPaired = pairingCounts[player1.id]?.[player2.id] || 0
  score -= timesPaired * 0.1

  // Bonus for similar skill levels (based on win/loss ratio)
  const player1Ratio = player1.stats.totalWins / (player1.stats.totalWins + player1.stats.totalLosses || 1)
  const player2Ratio = player2.stats.totalWins / (player2.stats.totalWins + player2.stats.totalLosses || 1)
  const skillDiff = Math.abs(player1Ratio - player2Ratio)
  score += (1 - skillDiff) * 0.5

  return Math.max(0, score)
}

// Helper to get all winners from a specific board
const getBoardWinners = (
  boardId: string,
  previousRoundBoards: PairingResult['boards'] | undefined
): Player[] => {
  if (!previousRoundBoards) return []
  const board = previousRoundBoards.find(b => b.boardId === boardId)
  if (!board || !board.winner) return []
  return board[board.winner]
}

// Helper to find best partner for a promoted player
const findBestPartner = (
  player: Player,
  availablePlayers: Player[],
  usedPlayers: Set<string>,
  currentRound: number,
  pairingHistory: GamePairings
): Player | null => {
  // First priority: Recently benched players
  const benchedPartner = availablePlayers.find(p => 
    !usedPlayers.has(p.id) && 
    wasRecentlyBenched(p, currentRound)
  )
  if (benchedPartner) return benchedPartner

  // Second priority: Player with least pairing history
  const remainingPlayers = availablePlayers.filter(p => !usedPlayers.has(p.id))
  if (remainingPlayers.length === 0) return null

  // Safely access pairingCounts with fallback to empty object
  const pairingCounts = pairingHistory?.pairingCounts || {}

  return remainingPlayers.reduce((bestPartner, currentPlayer) => {
    if (bestPartner === null) return currentPlayer
    
    // Safely access nested pairing counts with fallback to 0
    const bestPairCount = pairingCounts[player.id]?.[bestPartner.id] || 0
    const currentPairCount = pairingCounts[player.id]?.[currentPlayer.id] || 0
    
    return currentPairCount < bestPairCount ? currentPlayer : bestPartner
  }, null as Player | null)
}

export const generatePairings = ({
  availablePlayers,
  boardCount,
  pairingHistory,
  currentRound,
  promotedPlayers = [],
  previousRoundBoards = undefined
}: GeneratePairingsParams): PairingResult => {
  console.log('🎲 [generatePairings] Starting round:', currentRound)

  if (currentRound === 1) {
    throw new Error('Round 1 pairings should come from preview')
  }

  const result: PairingResult = {
    boards: [],
    bench: []
  }

  const usedPlayers = new Set<string>()

  // 1. Initialize Board A
  const boardA: PairingResult['boards'][0] = {
    boardId: 'A',
    team1: [],
    team2: []
  }

  // 2. Handle Board A winners first (if they haven't won 3 times)
  const boardAWinners = getBoardWinners('A', previousRoundBoards)
  if (boardAWinners.length > 0 && 
      (boardAWinners[0].stats.consecutiveWins || 0) < 3) {
    boardA.team1 = boardAWinners
    boardAWinners.forEach(p => usedPlayers.add(p.id))
    console.log('🏆 Board A winners staying:', boardAWinners.map(p => p.name))
  }

  // 3. Handle promotions from lower boards
  for (let i = 1; i < boardCount; i++) {
    const lowerBoardId = String.fromCharCode(65 + i)
    const lowerBoardWinners = getBoardWinners(lowerBoardId, previousRoundBoards)
    
    for (const winner of lowerBoardWinners) {
      if (usedPlayers.has(winner.id)) continue

      // If won in 1v1, find a partner (preferably from bench)
      if (wasInSoloMatch(winner, previousRoundBoards)) {
        const partner = findBestPartner(
          winner,
          availablePlayers,
          usedPlayers,
          currentRound,
          pairingHistory
        )

        if (partner) {
          if (boardA.team2.length === 0) {
            boardA.team2 = [winner, partner]
            usedPlayers.add(winner.id)
            usedPlayers.add(partner.id)
          }
        }
      }
      // If won as a pair, keep together if possible
      else if (lowerBoardWinners.length === 2) {
        const partner = lowerBoardWinners.find(p => p.id !== winner.id)
        if (partner && !usedPlayers.has(partner.id)) {
          if (boardA.team2.length === 0) {
            boardA.team2 = [winner, partner]
            usedPlayers.add(winner.id)
            usedPlayers.add(partner.id)
          }
        }
      }
    }
  }

  // 4. Fill remaining Board A slots if needed
  if (boardA.team1.length === 0 || boardA.team2.length === 0) {
    const remainingPlayers = availablePlayers.filter(p => !usedPlayers.has(p.id))
    
    // Try to make Board A 2v2 whenever possible
    if (boardA.team1.length === 0 && remainingPlayers.length >= 2) {
      boardA.team1 = [remainingPlayers[0], remainingPlayers[1]]
      usedPlayers.add(remainingPlayers[0].id)
      usedPlayers.add(remainingPlayers[1].id)
    }
    
    if (boardA.team2.length === 0 && remainingPlayers.length >= 2) {
      const stillAvailable = remainingPlayers.filter(p => !usedPlayers.has(p.id))
      if (stillAvailable.length >= 2) {
        boardA.team2 = [stillAvailable[0], stillAvailable[1]]
        usedPlayers.add(stillAvailable[0].id)
        usedPlayers.add(stillAvailable[1].id)
      }
    }
  }

  result.boards.push(boardA)

  // 5. Handle lower boards
  for (let i = 1; i < boardCount; i++) {
    const boardId = String.fromCharCode(65 + i)
    const remainingPlayers = availablePlayers.filter(p => !usedPlayers.has(p.id))
    
    // Prioritize players who lost on higher boards
    const higherBoardLosers = previousRoundBoards
      ?.filter(b => b.boardId < boardId)
      .flatMap(b => {
        const loserTeam = b.winner === 'team1' ? b.team2 : b.team1
        return loserTeam.filter(p => !usedPlayers.has(p.id))
      }) || []

    const playersForBoard = [
      ...higherBoardLosers,
      ...remainingPlayers.filter(p => !higherBoardLosers.some(l => l.id === p.id))
    ]

    if (playersForBoard.length >= 4) {
      // Create 2v2 match
      const board = {
        boardId,
        team1: [playersForBoard[0], playersForBoard[1]],
        team2: [playersForBoard[2], playersForBoard[3]]
      }
      result.boards.push(board)
      playersForBoard.slice(0, 4).forEach(p => usedPlayers.add(p.id))
    } else if (playersForBoard.length >= 2) {
      // Create 1v1 match
      const board = {
        boardId,
        team1: [playersForBoard[0]],
        team2: [playersForBoard[1]]
      }
      result.boards.push(board)
      playersForBoard.slice(0, 2).forEach(p => usedPlayers.add(p.id))
    }
  }

  // 6. Remaining players go to bench, but validate bench rules
  result.bench = availablePlayers.filter(p => !usedPlayers.has(p.id))
  
  // Ensure we're not benching winners or recently benched players
  const invalidBench = result.bench.filter(p => 
    promotedPlayers?.some(pp => pp.id === p.id) ||
    wasRecentlyBenched(p, currentRound)
  )

  if (invalidBench.length > 0) {
    console.warn('🚨 Invalid bench assignments:', invalidBench.map(p => p.name))
    
    // Find players who can be benched instead
    const validBenchCandidates = availablePlayers.filter(p => 
      !result.bench.some(b => b.id === p.id) &&
      !promotedPlayers?.some(pp => pp.id === p.id) &&
      !wasRecentlyBenched(p, currentRound)
    )

    // Swap invalid bench players with valid ones
    for (const player of invalidBench) {
      const replacement = validBenchCandidates.find(p => !usedPlayers.has(p.id))
      if (replacement) {
        let swapped = false
        // Find where the replacement is and swap
        for (const board of result.boards) {
          if (swapped) break
          for (const team of ['team1', 'team2'] as const) {
            const idx = board[team].findIndex(p => p.id === replacement.id)
            if (idx !== -1) {
              board[team][idx] = player
              result.bench = result.bench.filter(p => p.id !== player.id)
              result.bench.push(replacement)
              swapped = true
              break
            }
          }
        }
      }
    }
  }

  return result
}

export { calculatePairingScore, findBestPartner } 