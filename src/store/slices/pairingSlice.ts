// The fucking awesome pairing system! 🤝
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Player } from '../../types/player'

export interface PairingHistory {
  gameId: string
  round: number
  player1Id: string
  player2Id: string
  boardId: string
  result?: 'win' | 'loss'
  wasDove?: boolean
}

export interface GamePairings {
  pairings: {
    round: number
    boardId: string
    team1: [Player, Player?]
    team2: [Player, Player?]
  }[]
  pairingCounts: {
    [playerId: string]: {
      [partnerId: string]: number
    }
  }
  pairWins: {
    [playerId: string]: {
      [partnerId: string]: number
    }
  }
  lastBenchedRound: {
    [playerId: string]: number
  }
}

interface PairingState {
  currentGameId: string | null
  games: {
    [gameId: string]: GamePairings
  }
}

const initialState: PairingState = {
  currentGameId: null,
  games: {}
}

const pairingSlice = createSlice({
  name: 'pairings',
  initialState,
  reducers: {
    // Start tracking a new game
    initializeGame: (state, action: PayloadAction<{ gameId: string; players: Player[] }>) => {
      const { gameId, players } = action.payload
      state.currentGameId = gameId
      
      // Initialize empty pairing counts for all player combinations
      const pairingCounts: GamePairings['pairingCounts'] = {}
      players.forEach(player1 => {
        pairingCounts[player1.id] = {}
        players.forEach(player2 => {
          if (player1.id !== player2.id) {
            pairingCounts[player1.id][player2.id] = 0
          }
        })
      })

      state.games[gameId] = {
        pairings: [],
        pairingCounts,
        pairWins: {},
        lastBenchedRound: {}
      }
    },

    // Record new pairings for a round
    recordRoundPairings: (state, action: PayloadAction<{
      gameId: string
      round: number
      boardPairings: {
        boardId: string
        team1: [Player, Player?]  // Optional second player for 1v1
        team2: [Player, Player?]
        winner?: 'team1' | 'team2'
        isDove?: boolean
      }[]
      benchedPlayers: Player[]
    }>) => {
      const { gameId, round, boardPairings, benchedPlayers } = action.payload
      const game = state.games[gameId]
      if (!game) return

      // Record bench round for benched players
      benchedPlayers.forEach(player => {
        game.lastBenchedRound[player.id] = round
      })

      // Record all pairings from this round
      boardPairings.forEach(board => {
        // Handle team 1 pairings
        if (board.team1.length === 2 && board.team1[1]) {
          const pairing: PairingHistory = {
            gameId,
            round,
            player1Id: board.team1[0].id,
            player2Id: board.team1[1].id,
            boardId: board.boardId,
            result: board.winner === 'team1' ? 'win' : 'loss',
            wasDove: board.isDove
          }
          game.pairings.push(pairing)
          
          // Update pairing counts
          game.pairingCounts[pairing.player1Id][pairing.player2Id]++
          game.pairingCounts[pairing.player2Id][pairing.player1Id]++
        }

        // Handle team 2 pairings
        if (board.team2.length === 2 && board.team2[1]) {
          const pairing: PairingHistory = {
            gameId,
            round,
            player1Id: board.team2[0].id,
            player2Id: board.team2[1].id,
            boardId: board.boardId,
            result: board.winner === 'team2' ? 'win' : 'loss',
            wasDove: board.isDove
          }
          game.pairings.push(pairing)
          
          // Update pairing counts
          game.pairingCounts[pairing.player1Id][pairing.player2Id]++
          game.pairingCounts[pairing.player2Id][pairing.player1Id]++
        }
      })
    },

    // Get optimal partner suggestions for a player
    getPartnerSuggestions: (state, action: PayloadAction<{
      gameId: string
      playerId: string
      excludePlayerIds?: string[]  // Players to exclude (e.g., already assigned)
    }>) => {
      const { gameId, playerId, excludePlayerIds = [] } = action.payload
      const game = state.games[gameId]
      if (!game) return []

      // Get all possible partners (excluding self and excluded players)
      const possiblePartners = Object.keys(game.pairingCounts[playerId])
        .filter(id => !excludePlayerIds.includes(id))
        
      // Sort by least paired with
      return possiblePartners.sort((a, b) => 
        game.pairingCounts[playerId][a] - game.pairingCounts[playerId][b]
      )
    },

    // Clear game data when a game ends
    clearGame: (state, action: PayloadAction<{ gameId: string }>) => {
      const { gameId } = action.payload
      if (state.currentGameId === gameId) {
        state.currentGameId = null
      }
      delete state.games[gameId]
    }
  }
})

export const { 
  initializeGame, 
  recordRoundPairings, 
  getPartnerSuggestions,
  clearGame 
} = pairingSlice.actions
export default pairingSlice.reducer 