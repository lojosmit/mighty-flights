import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './slices/gameSlice'
import leaderboardReducer from './slices/leaderboardSlice'
import playerReducer from './slices/playerSlice'
import pairingReducer from './slices/pairingSlice'

export const store = configureStore({
  reducer: {
    game: gameReducer,
    leaderboard: leaderboardReducer,
    players: playerReducer,
    pairings: pairingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 