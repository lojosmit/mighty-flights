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

  // Sort players by priority:
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    // Round 1 is special - only consider handicaps for initial sorting
    if (currentRound === 1) {
      return b.stats.handicap - a.stats.handicap
    }

    // After round 1, use full sorting logic
    const aWasRecentlyBenched = wasRecentlyBenched(a, currentRound)
    const bWasRecentlyBenched = wasRecentlyBenched(b, currentRound)
    
    // Log bench status
    console.log(`🎲 [sortPlayers] Comparing ${a.name} (recent: ${aWasRecentlyBenched}, count: ${getTotalBenchCount(a)}) vs ${b.name} (recent: ${bWasRecentlyBenched}, count: ${getTotalBenchCount(b)})`)
    
    // If either was recently benched, they should NOT be benched again
    // This is now a HARD rule - recently benched players MUST be sorted first
    if (aWasRecentlyBenched && !bWasRecentlyBenched) return -1  // a should be FIRST (not benched)
    if (bWasRecentlyBenched && !aWasRecentlyBenched) return 1   // b should be FIRST (not benched)

    // STRONGLY prioritize players who have been benched less
    const aBenchCount = getTotalBenchCount(a)
    const bBenchCount = getTotalBenchCount(b)
    if (aBenchCount !== bBenchCount) {
      console.log(`🎲 [sortPlayers] ${a.name} bench count ${aBenchCount} vs ${b.name} bench count ${bBenchCount}`)
      // Lower bench count = less likely to be benched (should be LAST in sort)
      return aBenchCount - bBenchCount
    }

    // If bench counts are equal, prioritize who was benched longer ago
    const aLastBenched = a.stats.lastBenchedRound || 0
    const bLastBenched = b.stats.lastBenchedRound || 0
    if (aLastBenched !== bLastBenched) {
      // More recent bench = more likely to be benched again
      return aLastBenched - bLastBenched
    }

    // If all else is equal, mix skill levels
    return b.stats.handicap - a.stats.handicap
  })

  const result: PairingResult = {
    boards: [],
    bench: []
  }

  // Track which players have been assigned
  const usedPlayers = new Set<string>()

  // Function to find the best partner for a player
  const findBestPartner = (player: Player, usedPlayers: Set<string>): Player | null => {
    console.log(`🎲 [findBestPartner] Finding partner for ${player.name}`)
    console.log(`🎲 [findBestPartner] Already used players:`, 
      [...usedPlayers].map(id => availablePlayers.find(p => p.id === id)?.name)
    )

    // Get all available partners sorted by win rate and pairing count
    const availablePartners = sortedPlayers
      .filter(p => p.id !== player.id && !usedPlayers.has(p.id))
      .sort((a, b) => {
        // For round 1, only consider win rates
        if (currentRound === 1) {
          const aWinRate = getPairWinRate(player, a, pairingHistory)
          const bWinRate = getPairWinRate(player, b, pairingHistory)
          return bWinRate - aWinRate // Higher win rate first
        }

        // After round 1, balance win rates with pairing counts
        const aCount = pairingHistory.pairingCounts[player.id]?.[a.id] || 0
        const bCount = pairingHistory.pairingCounts[player.id]?.[b.id] || 0
        if (aCount !== bCount) return aCount - bCount

        // If pairing counts are equal, prefer higher win rate
        const aWinRate = getPairWinRate(player, a, pairingHistory)
        const bWinRate = getPairWinRate(player, b, pairingHistory)
        return bWinRate - aWinRate
      })

    // Try to find someone they haven't played with (after round 1)
    if (currentRound > 1) {
      const newPartner = availablePartners.find(p => 
        !pairingHistory.pairingCounts[player.id]?.[p.id]
      )
      if (newPartner) return newPartner
    }

    // Get the best available partner based on sorting
    return availablePartners[0] || null
  }

  // First, handle promoted players
  for (const player of promotedPlayers) {
    if (!usedPlayers.has(player.id) && wasInSoloMatch(player, previousRoundBoards)) {
      console.log(`🎲 [generatePairings] ${player.name} promoted from 1v1, finding partner...`)
      const partner = findBestPartner(player, usedPlayers)
      if (partner) {
        console.log(`🎲 [generatePairings] Pairing promoted player ${player.name} with ${partner.name}`)
        const boardId = String.fromCharCode(65 + result.boards.length)
        result.boards.push({
          boardId,
          team1: [player, partner],
          team2: []
        })
        usedPlayers.add(player.id)
        usedPlayers.add(partner.id)
      }
    }
  }

  // Then handle remaining players
  for (const player of sortedPlayers) {
    if (usedPlayers.has(player.id)) continue

    const partner = findBestPartner(player, usedPlayers)
    if (partner && result.boards.length < boardCount) {
      const boardId = String.fromCharCode(65 + result.boards.length)
      
      // If this board exists (from promoted players), add as team2
      const existingBoard = result.boards.find(b => b.boardId === boardId)
      if (existingBoard && existingBoard.team2.length === 0) {
        existingBoard.team2 = [player, partner]
      } else {
        result.boards.push({
          boardId,
          team1: [player, partner],
          team2: []
        })
      }
      
      usedPlayers.add(player.id)
      usedPlayers.add(partner.id)
    }
  }

  // Any remaining players go to bench
  result.bench = sortedPlayers.filter(p => !usedPlayers.has(p.id))
  
  // Safety check - NEVER bench players who were benched in the previous round
  const safeToPlay = result.bench.filter(p => !wasRecentlyBenched(p, currentRound))
  const mustPlay = result.bench.filter(p => wasRecentlyBenched(p, currentRound))
  
  if (mustPlay.length > 0) {
    console.log(`🚨 [bench] Found ${mustPlay.length} players that cannot be benched:`, mustPlay.map(p => p.name))
    // Try to swap these players with already assigned players who can be benched
    mustPlay.forEach(player => {
      // Find a safe player to bench instead
      const boardPlayers = result.boards.flatMap(b => [...b.team1, ...b.team2])
      const safeToSwap = boardPlayers.find(p => !wasRecentlyBenched(p, currentRound))
      
      if (safeToSwap) {
        console.log(`🔄 [bench] Swapping ${player.name} with ${safeToSwap.name} to prevent consecutive benching`)
        // Remove the player from bench
        result.bench = result.bench.filter(p => p.id !== player.id)
        // Add the safe player to bench
        result.bench.push(safeToSwap)
        // Replace the safe player with our must-play player in their board
        result.boards = result.boards.map(board => ({
          ...board,
          team1: board.team1.map(p => p.id === safeToSwap.id ? player : p),
          team2: board.team2.map(p => p.id === safeToSwap.id ? player : p)
        }))
      }
    })
  }
  
  // Log bench decisions
  result.bench.forEach(player => {
    console.log(`🪑 [bench] ${player.name} benched because:`)
    console.log(`   - Total times benched: ${getTotalBenchCount(player)}`)
    console.log(`   - Last benched round: ${player.stats.lastBenchedRound || 'never'}`)
    console.log(`   - Recently benched: ${wasRecentlyBenched(player, currentRound)}`)
  })

  // If we have incomplete boards (missing team2), try to fill with bench players
  result.boards.forEach(board => {
    if (board.team2.length === 0 && result.bench.length >= 2) {
      // Try to find a new pairing for team2
      const player1 = result.bench[0]
      const partner = findBestPartner(player1, usedPlayers)
      if (partner) {
        result.bench = result.bench.filter(p => p.id !== player1.id && p.id !== partner.id)
        board.team2 = [player1, partner]
        usedPlayers.add(player1.id)
        usedPlayers.add(partner.id)
      }
    }
  })

  // If we still have incomplete boards, convert them to 1v1
  result.boards.forEach(board => {
    if (board.team2.length === 0 && result.bench.length >= 1) {
      const player = result.bench.shift()!
      board.team2 = [player]
      // Convert team1 to single player if it has 2
      if (board.team1.length === 2) {
        result.bench.push(board.team1[1])
        board.team1 = [board.team1[0]]
      }
    }
  })

  // Log final pairings
  console.log('🎲 [generatePairings] Final pairings:')
  result.boards.forEach(board => {
    console.log(`   Board ${board.boardId}:`)
    console.log(`     Team 1: ${board.team1.map(p => p.name).join(', ')}`)
    console.log(`     Team 2: ${board.team2.map(p => p.name).join(', ')}`)
  })
  console.log('   Bench:', result.bench.map(p => p.name).join(', '))

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