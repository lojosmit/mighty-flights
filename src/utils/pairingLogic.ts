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
  // Round 1 is special - no one was recently benched
  if (currentRound === 1) return false
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
    const wasInTeam1 = board.team1.some(p => p.id === player.id)
    const wasInTeam2 = board.team2.some(p => p.id === player.id)
    
    if ((wasInTeam1 || wasInTeam2) && board.team1.length === 1 && board.team2.length === 1) {
      console.log(`🎲 [wasInSoloMatch] ${player.name} was in 1v1 match on Board ${board.boardId}`)
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

export const generatePairings = ({
  availablePlayers,
  boardCount,
  pairingHistory,
  currentRound,
  promotedPlayers = [],
  previousRoundBoards = undefined
}: GeneratePairingsParams): PairingResult => {
  console.log('🎲 [generatePairings] Starting new round:', currentRound)
  console.log('🎲 [generatePairings] Available players:', availablePlayers.map(p => p.name))
  console.log('🎲 [generatePairings] Board count:', boardCount)
  console.log('🎲 [generatePairings] Promoted players:', promotedPlayers.map(p => p.name))

  // Round 1 should never be generated here - it should come from preview
  if (currentRound === 1) {
    console.error('🚨 generatePairings called for round 1 - this should not happen!')
    throw new Error('Round 1 pairings should come from preview')
  }

  const result: PairingResult = {
    boards: [],
    bench: []
  }

  // Track which players have been assigned
  const usedPlayers = new Set<string>()

  // Helper to get board winners
  const getBoardWinners = (boardId: string): Player[] => {
    if (!previousRoundBoards) return []
    const board = previousRoundBoards.find(b => b.boardId === boardId)
    if (!board) return []
    return promotedPlayers.filter(p => 
      board.team1.some(t => t.id === p.id) ||
      board.team2.some(t => t.id === p.id)
    )
  }

  // 1. Handle Board A first (highest priority)
  const boardA: PairingResult['boards'][0] = {
    boardId: 'A',
    team1: [],
    team2: []
  }

  // Get Board A winners from last round
  const boardAWinners = getBoardWinners('A')
  
  // Keep Board A winners together if they won and haven't won 3 consecutive times
  if (boardAWinners.length === 2) {
    const consecutiveWins = boardAWinners[0].stats.consecutiveWins || 0
    if (consecutiveWins < 3) {
      console.log('🏆 [Board A] Winners staying:', boardAWinners.map(p => p.name))
      boardA.team1 = boardAWinners
      boardAWinners.forEach(p => usedPlayers.add(p.id))
    } else {
      console.log('🔄 [Board A] Winners reached 3 consecutive wins, rotating out')
      // They'll be handled in lower board assignments
    }
  }

  // 2. Handle promotions from lower boards
  const promotedFromLower = promotedPlayers.filter(p => {
    if (!previousRoundBoards) return false
    const previousBoard = getPreviousBoard(p, previousRoundBoards)
    return previousBoard && previousBoard !== 'A'
  })

  if (promotedFromLower.length > 0) {
    console.log('⬆️ [Promotions] Players promoted:', promotedFromLower.map(p => p.name))
    
    // Group promoted players by their previous board
    const promotedByBoard = new Map<string, Player[]>()
    promotedFromLower.forEach(p => {
      const prevBoard = getPreviousBoard(p, previousRoundBoards)
      if (prevBoard) {
        const existing = promotedByBoard.get(prevBoard) || []
        promotedByBoard.set(prevBoard, [...existing, p])
      }
    })

    // Handle promotions board by board, starting from highest ranked board
    const boards = Array.from(promotedByBoard.keys()).sort()
    for (const boardId of boards) {
      const promoted = promotedByBoard.get(boardId) || []
      
      // If they won as a pair, keep them together
      if (promoted.length === 2 && !promoted.some(p => usedPlayers.has(p.id))) {
        if (boardA.team1.length === 0) {
          boardA.team1 = promoted
        } else if (boardA.team2.length === 0) {
          boardA.team2 = promoted
        }
        promoted.forEach(p => usedPlayers.add(p.id))
      } 
      // If they won in 1v1, pair with someone from bench or available pool
      else {
        for (const player of promoted) {
          if (usedPlayers.has(player.id)) continue
          
          if (wasInSoloMatch(player, previousRoundBoards)) {
            // Try to pair with someone from bench first
            const benchedLastRound = availablePlayers.find(p => 
              !usedPlayers.has(p.id) && 
              wasRecentlyBenched(p, currentRound)
            )
            
            if (benchedLastRound) {
              if (boardA.team1.length === 0) {
                boardA.team1 = [player, benchedLastRound]
              } else if (boardA.team2.length === 0) {
                boardA.team2 = [player, benchedLastRound]
              }
              usedPlayers.add(player.id)
              usedPlayers.add(benchedLastRound.id)
            }
          }
        }
      }
    }
  }

  // 3. Fill remaining Board A slots if needed
  const remainingForBoardA = availablePlayers.filter(p => !usedPlayers.has(p.id))
  if (boardA.team1.length === 0 && remainingForBoardA.length >= 4) {
    // Prioritize players who lost on Board A last round
    const boardALosers = previousRoundBoards
      ? previousRoundBoards
          .find(b => b.boardId === 'A')
          ?.team1.concat(previousRoundBoards.find(b => b.boardId === 'A')?.team2 || [])
          .filter(p => !promotedPlayers.some(pp => pp.id === p.id)) || []
      : []
    
    const remainingPlayers = [
      ...boardALosers,
      ...remainingForBoardA.filter(p => !boardALosers.some(l => l.id === p.id))
    ]

    if (remainingPlayers.length >= 4) {
      boardA.team1 = [remainingPlayers[0], remainingPlayers[1]]
      boardA.team2 = [remainingPlayers[2], remainingPlayers[3]]
      remainingPlayers.slice(0, 4).forEach(p => usedPlayers.add(p.id))
    }
  } else if (boardA.team2.length === 0 && remainingForBoardA.length >= 2) {
    boardA.team2 = [remainingForBoardA[0], remainingForBoardA[1]]
    usedPlayers.add(remainingForBoardA[0].id)
    usedPlayers.add(remainingForBoardA[1].id)
  }

  result.boards.push(boardA)

  // Handle lower boards (B, C, etc.)
  for (let i = 1; i < boardCount; i++) {
    const boardId = String.fromCharCode(65 + i)
    const remainingForBoard = availablePlayers.filter(p => !usedPlayers.has(p.id))
    
    // Get players who lost on the previous board
    const previousBoardLosers = previousRoundBoards
      ? previousRoundBoards
          .find(b => b.boardId === String.fromCharCode(65 + i - 1))
          ?.team1.concat(previousRoundBoards.find(b => b.boardId === String.fromCharCode(65 + i - 1))?.team2 || [])
          .filter(p => !promotedPlayers.some(pp => pp.id === p.id)) || []
      : []
    
    // Prioritize losers from previous board
    const playersForBoard = [
      ...previousBoardLosers,
      ...remainingForBoard.filter(p => !previousBoardLosers.some(l => l.id === p.id))
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

  // Any remaining players go to bench
  result.bench = availablePlayers.filter(p => !usedPlayers.has(p.id))
  
  // Validate bench rules
  const cantBench = result.bench.filter(p => 
    promotedPlayers.some(pp => pp.id === p.id) ||
    wasRecentlyBenched(p, currentRound)
  )

  if (cantBench.length > 0) {
    console.warn('🚨 [Bench] Players that cannot be benched:', cantBench.map(p => p.name))
    // Try to swap them with players who can be benched
    const canBeBenched = availablePlayers.filter(p => 
      !result.bench.some(b => b.id === p.id) &&
      !promotedPlayers.some(pp => pp.id === p.id) &&
      !wasRecentlyBenched(p, currentRound)
    )

    cantBench.forEach(player => {
      const replacement = canBeBenched.find(p => !usedPlayers.has(p.id))
      if (replacement) {
        // Find this player in a team and swap
        for (const board of result.boards) {
          const team1Idx = board.team1.findIndex(p => p.id === replacement.id)
          const team2Idx = board.team2.findIndex(p => p.id === replacement.id)
          
          if (team1Idx !== -1) {
            board.team1[team1Idx] = player
            result.bench = result.bench.filter(p => p.id !== player.id)
            result.bench.push(replacement)
            break
          } else if (team2Idx !== -1) {
            board.team2[team2Idx] = player
            result.bench = result.bench.filter(p => p.id !== player.id)
            result.bench.push(replacement)
            break
          }
        }
      }
    })
  }

  return result
}

// Helper function to calculate pairing score (lower is better)
export const calculatePairingScore = (
  player1: Player,
  player2: Player,
  pairingCounts: GamePairings['pairingCounts']
): number => {
  // Base score is number of times they've played together
  let score = pairingCounts[player1.id]?.[player2.id] || 0

  // Adjust score based on handicap difference (prefer mixing skill levels)
  const handicapDiff = Math.abs(player1.stats.handicap - player2.stats.handicap)
  score += handicapDiff * 0.5  // Small penalty for similar handicaps

  return score
} 