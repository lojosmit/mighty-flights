// The legendary leaderboard data! 🏆
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Player } from '../../types/player'
import { RootState } from '../store'

export interface LeaderboardEntry extends Player {
  seasonStats: {
    gamesPlayed: number
    wins: number
    losses: number
    doves: number
    points: number
    basePoints: number
    handicap: number
    rank?: number
  }
}

interface LeaderboardState {
  entries: LeaderboardEntry[]
  lastUpdated: string
  seasonNumber: number
}

// Load initial state from localStorage
const loadInitialState = (): LeaderboardState => {
  try {
    const savedState = localStorage.getItem('leaderboard')
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (error) {
    console.warn('Failed to load leaderboard from localStorage:', error)
  }
  
  // If no saved state, create a new one
  return {
    entries: [], // Will be populated when players are loaded
    lastUpdated: new Date().toISOString(),
    seasonNumber: 1
  }
}

const calculateHandicap = (rank: number): number => {
  // Top 2 players always get 1.0x
  if (rank <= 2) return 1.0
  
  // For ranks 3 and below:
  // Ranks 3-4: 1.1x
  // Ranks 5-6: 1.2x
  // Ranks 7-8: 1.3x
  // Ranks 9-10: 1.4x
  // etc...
  const rankPairIndex = Math.floor((rank - 3) / 2)  // -3 because we start counting pairs after rank 2
  return 1.0 + ((rankPairIndex + 1) * 0.1)  // +1 because first pair (ranks 3-4) should get 0.1
}

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: loadInitialState(),
  reducers: {
    initializeLeaderboard: (state, action: PayloadAction<Player[]>) => {
      console.log('🎯 Initializing leaderboard with players:', action.payload.length)
      
      // Only add new players that aren't already in the leaderboard
      action.payload.forEach(player => {
        if (!state.entries.find(entry => entry.id === player.id)) {
          state.entries.push({
            ...player,
            seasonStats: {
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              doves: 0,
              points: 0,
              basePoints: 0,
              handicap: 1.0
            }
          })
        }
      })

      // Sort entries by points and update ranks and handicaps
      state.entries.sort((a, b) => b.seasonStats.points - a.seasonStats.points)
      state.entries.forEach((entry, index) => {
        entry.seasonStats.rank = index + 1
        entry.seasonStats.handicap = calculateHandicap(index + 1)
      })

      // Save to localStorage
      try {
        localStorage.setItem('leaderboard', JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save leaderboard to localStorage:', error)
      }
    },

    updatePlayerStats: (state, action: PayloadAction<{
      playerId: string
      gameStats: {
        wins: number
        losses: number
        doves: number
        basePoints: number
        points: number
      }
    }>) => {
      const { playerId, gameStats } = action.payload
      const playerIndex = state.entries.findIndex(entry => entry.id === playerId)

      if (playerIndex === -1) {
        console.warn('Player not found in leaderboard:', playerId)
        return
      }

      // Update existing player
      const entry = state.entries[playerIndex]
      entry.seasonStats.gamesPlayed += 1
      entry.seasonStats.wins += gameStats.wins
      entry.seasonStats.losses += gameStats.losses
      entry.seasonStats.doves += gameStats.doves
      entry.seasonStats.basePoints = gameStats.basePoints
      entry.seasonStats.points = gameStats.points

      // Sort entries by points and update ranks and handicaps
      state.entries.sort((a, b) => b.seasonStats.points - a.seasonStats.points)
      state.entries.forEach((entry, index) => {
        entry.seasonStats.rank = index + 1
        entry.seasonStats.handicap = calculateHandicap(index + 1)
      })

      // Update timestamp and save to localStorage
      state.lastUpdated = new Date().toISOString()
      try {
        localStorage.setItem('leaderboard', JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save leaderboard to localStorage:', error)
      }
    },

    resetSeason: (state) => {
      state.entries = state.entries.map(entry => ({
        ...entry,
        seasonStats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          doves: 0,
          points: 0,
          basePoints: 0,
          handicap: 1.0
        }
      }))
      state.seasonNumber += 1
      state.lastUpdated = new Date().toISOString()
      
      try {
        localStorage.setItem('leaderboard', JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save leaderboard to localStorage:', error)
      }
    }
  }
})

export const { initializeLeaderboard, updatePlayerStats, resetSeason } = leaderboardSlice.actions
export default leaderboardSlice.reducer 