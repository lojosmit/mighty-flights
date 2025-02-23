import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Player } from '../../types/player'
import { updatePlayerStats } from './leaderboardSlice'
import { initializeGame as initializePairings } from './pairingSlice'
import { AppDispatch } from '../store'
import { RootState } from '../store'
import { generatePairings } from '../../utils/pairingLogic'

interface TeamAssignment {
  team1: Player[]
  team2: Player[]
}

interface BoardResults {
  [boardId: string]: {
    winner: 'team1' | 'team2'
    isDove: boolean
  }
}

interface RoundStats {
  boards: { [boardId: string]: TeamAssignment }
  results: BoardResults
  bench: Player[]
}

interface GameState {
  isActive: boolean
  players: Player[]
  boards: { [boardId: string]: TeamAssignment }
  bench: Player[]
  boardCount: number
  roundTime: number
  totalRounds: number
  currentRound: number
  roundHistory: { [round: number]: RoundStats }
  gameStats: {
    roundsPlayed: number
    totalDoves: number
  }
}

const initialState: GameState = {
  isActive: false,
  players: [],
  boards: {},
  bench: [],
  boardCount: 0,
  roundTime: 0,
  totalRounds: 0,
  currentRound: 1,
  roundHistory: {},
  gameStats: {
    roundsPlayed: 0,
    totalDoves: 0
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
    
    // Initialize the game state
    dispatch(initializeGame(payload))
    
    // Initialize the pairing system with a unique game ID
    const gameId = Date.now().toString()
    console.log('🎮 [startGame] Initializing pairing system with gameId:', gameId)
    
    dispatch(initializePairings({
      players: payload.players,
      gameId
    }))

    // Generate initial pairings
    console.log('🎮 [startGame] Generating initial pairings...')
    const initialPairings = generatePairings({
      availablePlayers: payload.players,
      boardCount: payload.boardCount,
      pairingHistory: {
        pairings: [],
        pairingCounts: {},
        lastBenchedRound: {}
      },
      currentRound: 1
    })

    console.log('🎮 [startGame] Initial pairings generated:', {
      boards: initialPairings.boards.map(b => ({
        boardId: b.boardId,
        team1: b.team1.map(p => p.name),
        team2: b.team2.map(p => p.name)
      })),
      bench: initialPairings.bench.map(p => p.name)
    })

    // Update the boards with initial pairings
    const boardsObj = initialPairings.boards.reduce((acc, board) => ({
      ...acc,
      [board.boardId]: {
        team1: board.team1,
        team2: board.team2
      }
    }), {})

    console.log('🎮 [startGame] Updating boards with:', {
      boards: Object.keys(boardsObj),
      benchCount: initialPairings.bench.length
    })

    dispatch(updateBoards({
      boards: boardsObj,
      bench: initialPairings.bench
    }))

    return payload
  }
)

// Async thunk for ending a round
export const endRound = createAsyncThunk(
  'game/endRound',
  async (payload: { boardResults: BoardResults }, { getState, dispatch }) => {
    const state = getState() as RootState
    const { currentRound, roundHistory, boards, players, bench } = state.game

    console.log('🎯 [endRound] Starting round:', currentRound)
    console.log('🎯 [endRound] History size before:', Object.keys(roundHistory).length)

    // Save current round to history
    const roundStats: RoundStats = {
      boards: { ...boards },
      results: { ...payload.boardResults },
      bench: [...bench]
    }

    // Update player stats
    const updatedPlayers = players.map(player => {
      const stats = { ...player.stats }
      let wasInGame = false

      // Check each board
      Object.entries(boards).forEach(([boardId, board]) => {
        const result = payload.boardResults[boardId]
        if (!result) return

        // Check if player was on winning team
        const wasOnTeam1 = board.team1.some(p => p.id === player.id)
        const wasOnTeam2 = board.team2.some(p => p.id === player.id)
        
        if (wasOnTeam1 || wasOnTeam2) {
          wasInGame = true
          stats.games = (stats.games || 0) + 1
          
          if ((wasOnTeam1 && result.winner === 'team1') || 
              (wasOnTeam2 && result.winner === 'team2')) {
            stats.wins++
            if (result.isDove) stats.doves++
          }
        }
      })

      // Update bench count if player was benched
      if (!wasInGame) {
        stats.benched = (stats.benched || 0) + 1
        stats.lastBenchedRound = currentRound
        console.log(`🎯 [endRound] ${player.name} was benched, total: ${stats.benched}, last round: ${currentRound}`)
      }

      return {
        ...player,
        stats
      }
    })

    // Save round to history
    const newHistory = {
      ...roundHistory,
      [currentRound]: roundStats
    }

    console.log('🎯 [endRound] Saved round to history:', currentRound)
    console.log('🎯 [endRound] History size after:', Object.keys(newHistory).length)
    console.log('🎯 [endRound] Round history keys:', Object.keys(newHistory))

    // Increment round number BEFORE generating new pairings
    const nextRound = currentRound + 1

    return {
      roundHistory: newHistory,
      players: updatedPlayers,
      nextRound
    }
  }
)

const gameSlice = createSlice({
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
        roundsPlayed: 0,
        totalDoves: 0
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
    endGame: (state) => {
      state.isActive = false
      console.log('🎮 [endGame] Game ended')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(endRound.fulfilled, (state, action) => {
        state.roundHistory = action.payload.roundHistory
        state.players = action.payload.players
        state.currentRound = action.payload.nextRound
        state.gameStats.roundsPlayed++

        // Only log bench stats for players who were actually benched
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
  endGame
} = gameSlice.actions

export default gameSlice.reducer 