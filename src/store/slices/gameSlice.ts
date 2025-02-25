import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Player } from '../../types/player'
import { updatePlayerStats } from './leaderboardSlice'
import { initializeGame as initializePairings } from './pairingSlice'
import { AppDispatch } from '../store'
import { RootState } from '../store'
import { generatePairings } from '../../utils/pairingLogic'
import { GameState, TeamAssignment } from '../../types/game'

interface BoardResults {
  [boardId: string]: {
    winner: 'team1' | 'team2'
    isDove?: boolean
  }
}

interface RoundStats {
  boards: {
    boardId: string
    team1: Player[]
    team2: Player[]
    winner?: 'team1' | 'team2'
    isDove?: boolean
  }[]
  bench: Player[]
}

const initialState: GameState = {
  isActive: false,
  players: [],
  boards: {},
  bench: [],
  boardCount: 2,
  roundTime: 300,
  totalRounds: 10,
  currentRound: 1,
  roundHistory: {},
  gameStats: {
    doves: 0,
    totalGames: 0,
    roundsPlayed: 0
  }
}

// Async thunk for starting a new game
export const startGame = createAsyncThunk(
  'game/startGame',
  async (payload: {
    players: Player[]
    boardCount: number
    roundTime: number
    totalRounds: number
  }, { dispatch }) => {
    console.log('🎮 [startGame] Starting new game with:', {
      playerCount: payload.players.length,
      boardCount: payload.boardCount,
      roundTime: payload.roundTime,
      totalRounds: payload.totalRounds
    })

    // Initialize game state
    dispatch(initializeGame(payload))

    // For round 1, use the stored preview pairings instead of generating new ones
    const storedPairings = localStorage.getItem('firstRoundPairings')
    let boardsObj: { [key: string]: TeamAssignment } = {}
    let benchPlayers: Player[] = []

    if (storedPairings) {
      const { boards, bench } = JSON.parse(storedPairings)
      // Convert stored pairings to the correct format
      boards.forEach(board => {
        boardsObj[board.board] = {
          team1: board.players.team1,
          team2: board.players.team2
        }
      })
      benchPlayers = bench
      // Clear stored pairings as they're no longer needed
      localStorage.removeItem('firstRoundPairings')
    } else {
      console.warn('🚨 No stored preview pairings found, this should not happen!')
      // Fallback to random pairings if something went wrong
      const initialPairings = generatePairings({
        availablePlayers: payload.players,
        boardCount: payload.boardCount,
        pairingHistory: { pairingCounts: {}, pairWins: {}, pairings: [], lastBenchedRound: {} },
        currentRound: 1
      })

      initialPairings.boards.forEach(board => {
        boardsObj[board.boardId] = {
          team1: board.team1,
          team2: board.team2
        }
      })
      benchPlayers = initialPairings.bench
    }

    console.log('🎮 [startGame] Updating boards with:', {
      boards: Object.keys(boardsObj),
      benchCount: benchPlayers.length
    })

    dispatch(updateBoards({
      boards: boardsObj,
      bench: benchPlayers
    }))

    return payload
  }
)

// Async thunk for ending a round
export const endRound = createAsyncThunk(
  'game/endRound',
  async (payload: { boardResults: BoardResults }, { getState }) => {
    try {
      const state = getState() as RootState
      const { boards, currentRound } = state.game
      const promotedPlayers: Player[] = []
      const updatedPlayers: Player[] = [...state.game.players]

      // Track winners and update stats
      Object.entries(boards).forEach(([boardId, board]) => {
        if (!payload.boardResults[boardId]?.winner) return

        const winner = payload.boardResults[boardId].winner
        const winningTeam = winner === 'team1' ? board.team1 : board.team2
        const losingTeam = winner === 'team1' ? board.team2 : board.team1

        // Update winning team stats
        winningTeam.forEach(player => {
          const playerIndex = updatedPlayers.findIndex(p => p.id === player.id)
          if (playerIndex === -1) return

          const updatedPlayer = {
            ...player,
            stats: {
              ...player.stats,
              consecutiveWins: boardId === 'A' 
                ? (player.stats?.consecutiveWins || 0) + 1 
                : 0,
              totalWins: (player.stats?.totalWins || 0) + 1
            }
          }
          updatedPlayers[playerIndex] = updatedPlayer
          promotedPlayers.push(updatedPlayer)
        })

        // Update losing team stats
        losingTeam.forEach(player => {
          const playerIndex = updatedPlayers.findIndex(p => p.id === player.id)
          if (playerIndex === -1) return

          updatedPlayers[playerIndex] = {
            ...player,
            stats: {
              ...player.stats,
              consecutiveWins: 0,
              totalLosses: (player.stats?.totalLosses || 0) + 1
            }
          }
        })
      })

      // Convert board results to the correct format for history
      const boardHistory: { [key: string]: TeamAssignment } = {}
      Object.entries(boards).forEach(([boardId, board]) => {
        boardHistory[boardId] = {
          team1: board.team1.map(player => ({
            ...player,
            stats: updatedPlayers.find(p => p.id === player.id)?.stats || player.stats
          })),
          team2: board.team2.map(player => ({
            ...player,
            stats: updatedPlayers.find(p => p.id === player.id)?.stats || player.stats
          })),
          winner: payload.boardResults[boardId]?.winner,
          isDove: payload.boardResults[boardId]?.isDove
        }
      })

      return {
        roundHistory: {
          ...state.game.roundHistory,
          [currentRound]: {
            boards: boardHistory,
            bench: state.game.bench.map(player => ({
              ...player,
              stats: updatedPlayers.find(p => p.id === player.id)?.stats || player.stats
            }))
          }
        },
        players: updatedPlayers,
        nextRound: currentRound + 1
      }
    } catch (error) {
      console.error('🚨 Error in endRound thunk:', error)
      throw error
    }
  }
)

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action: PayloadAction<{
      players: Player[]
      boardCount: number
      roundTime: number
      totalRounds: number
    }>) => {
      const { players, boardCount, roundTime, totalRounds } = action.payload
      state.isActive = true
      state.players = players
      state.boardCount = boardCount
      state.roundTime = roundTime
      state.totalRounds = totalRounds
      state.currentRound = 1
      state.roundHistory = {}
      state.gameStats = {
        doves: 0,
        totalGames: 0,
        roundsPlayed: 0
      }
      console.log('🎮 [initializeGame] Game state initialized:', {
        players: players.length,
        boardCount,
        roundTime,
        totalRounds
      })
    },
    updateBoards: (state, action: PayloadAction<{
      boards: { [key: string]: TeamAssignment }
      bench: Player[]
    }>) => {
      state.boards = action.payload.boards
      state.bench = action.payload.bench
      console.log('🎮 [updateBoards] Boards updated:', {
        boards: Object.keys(action.payload.boards),
        benchCount: action.payload.bench.length
      })
    },
    startNextRound: (state) => {
      console.log('🎮 [startNextRound] Starting round:', state.currentRound)
    },
    endGame: (state) => {
      state.isActive = false
      console.log('🎮 [endGame] Game ended')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(endRound.fulfilled, (state, action) => {
        // Update round history
        state.roundHistory = action.payload.roundHistory

        // Update players with new stats
        state.players = action.payload.players

        // Update current round
        state.currentRound = action.payload.nextRound

        // Update game stats
        state.gameStats.roundsPlayed++
        state.gameStats.doves += Object.values(action.payload.roundHistory[state.currentRound - 1].boards)
          .filter(board => board.isDove).length

        // Log bench stats for players who were benched
        state.players.forEach(player => {
          if (player.stats.lastBenchedRound === state.currentRound - 1) {
            console.log(`🎯 [endRound] ${player.name} bench stats:`, {
              total: player.stats.benched || 0,
              lastRound: player.stats.lastBenchedRound || 'never'
            })
          }
        })
      })
      .addCase(startGame.fulfilled, (state, action) => {
        console.log('🎮 [startGame] Game initialized successfully with:', {
          players: state.players.length,
          boards: Object.keys(state.boards),
          bench: state.bench.length
        })
      })
  }
})

export const {
  initializeGame,
  updateBoards,
  endGame,
  startNextRound
} = gameSlice.actions

export default gameSlice.reducer 