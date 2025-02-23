import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Player } from '../../types/player'

interface PlayerState {
  players: Player[]
  loading: boolean
  error: string | null
}

const initialState: PlayerState = {
  players: [
    {
      id: '1',
      name: 'Michael Scott',
      nickname: 'The World\'s Best Dart Boss',
      email: 'michael@dundermifflin.com',
      active: true,
      stats: {
        wins: 42,
        losses: 69,
        doves: 15,
        handicap: 1.0
      }
    },
    {
      id: '2',
      name: 'Dwight K. Schrute',
      nickname: 'Bullseye Battlestar',
      email: 'dwight@schrutefarms.com',
      active: true,
      stats: {
        wins: 180,
        losses: 20,
        doves: 15, // Dwight dominates frequently
        handicap: 0.8
      }
    },
    {
      id: '3',
      name: 'Jim Halpert',
      nickname: 'The Prankster Triple',
      email: 'jim@dundermifflin.com',
      active: true,
      stats: {
        wins: 120,
        losses: 40,
        doves: 5,
        handicap: 0.9
      }
    },
    {
      id: '4',
      name: 'Pam Beesly',
      nickname: 'The Artistic Aim',
      email: 'pam@dundermifflin.com',
      active: true,
      stats: {
        wins: 85,
        losses: 35,
        doves: 3,
        handicap: 1.1
      }
    },
    {
      id: '5',
      name: 'Kevin Malone',
      nickname: 'The Lucky Seven',
      email: 'kevin@dundermifflin.com',
      active: true,
      stats: {
        wins: 69,
        losses: 69,
        doves: 1, // Got lucky once
        handicap: 1.4
      }
    },
    {
      id: '6',
      name: 'Creed Bratton',
      nickname: 'The Mystery Marksman',
      email: 'creed@www.creedthoughts.gov.www/creedthoughts',
      active: false,
      stats: {
        wins: 666,
        losses: 0,
        doves: 42, // The most dominant player ever
        handicap: 0.5 // Nobody knows how he's so good
      }
    },
    {
      id: '7',
      name: 'Stanley Hudson',
      nickname: 'The Crossword King',
      email: 'stanley@dundermifflin.com',
      active: true,
      stats: {
        wins: 150,
        losses: 30,
        doves: 2,
        handicap: 0.9 // He's surprisingly good when not doing crosswords
      }
    },
    {
      id: '8',
      name: 'Angela Martin',
      nickname: 'The Precise Princess',
      email: 'angela@dundermifflin.com',
      active: true,
      stats: {
        wins: 95,
        losses: 25,
        doves: 1,
        handicap: 1.0 // As precise with darts as she is with accounting
      }
    },
    {
      id: '9',
      name: 'Andy Bernard',
      nickname: 'The Nard-Dart',
      email: 'narddog@cornell.edu',
      active: true,
      stats: {
        wins: 45,
        losses: 85,
        doves: 20,
        handicap: 1.3 // Too busy singing to focus
      }
    },
    {
      id: '10',
      name: 'Meredith Palmer',
      nickname: 'The Happy Hour Hero',
      email: 'meredith@dundermifflin.com',
      active: true,
      stats: {
        wins: 80,
        losses: 80,
        doves: 30,
        handicap: 1.2 // Better after a few drinks
      }
    },
    {
      id: '11',
      name: 'Oscar Martinez',
      nickname: 'Actually Accurate',
      email: 'oscar@dundermifflin.com',
      active: true,
      stats: {
        wins: 140,
        losses: 30,
        doves: 1,
        handicap: 0.85 // He did the math
      }
    },
    {
      id: '12',
      name: 'Toby Flenderson',
      nickname: 'The Silent Striker',
      email: 'toby@dundermifflin.com',
      active: false, // Michael banned him
      stats: {
        wins: 90,
        losses: 40,
        doves: 5,
        handicap: 1.1
      }
    },
    {
      id: '13',
      name: 'Ryan Howard',
      nickname: 'The Temp',
      email: 'ryan@wuphf.com',
      active: false, // Too busy with his next big idea
      stats: {
        wins: 20,
        losses: 100,
        doves: 25,
        handicap: 1.5 // All style, no substance
      }
    },
    {
      id: '14',
      name: 'Kelly Kapoor',
      nickname: 'The Drama Queen',
      email: 'kelly@dundermifflin.com',
      active: true,
      stats: {
        wins: 50,
        losses: 50,
        doves: 10,
        handicap: 1.2 // Depends if Ryan is watching
      }
    }
  ],
  loading: false,
  error: null
}

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<Omit<Player, 'stats'>>) => {
      state.players.push({
        ...action.payload,
        stats: {
          wins: 0,
          losses: 0,
          doves: 0,
          handicap: 1.0
        }
      })
    },
    updatePlayer: (state, action: PayloadAction<Player>) => {
      const index = state.players.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.players[index] = action.payload
      }
    },
    deletePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.id !== action.payload)
    },
    togglePlayerStatus: (state, action: PayloadAction<string>) => {
      const player = state.players.find(p => p.id === action.payload)
      if (player) {
        player.active = !player.active
      }
    }
  }
})

export const { addPlayer, updatePlayer, deletePlayer, togglePlayerStatus } = playerSlice.actions
export default playerSlice.reducer 