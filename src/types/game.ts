import { Player } from './player'

export interface TeamAssignment {
  team1: Player[]
  team2: Player[]
  winner?: 'team1' | 'team2'
  isDove?: boolean
  score?: {
    team1: number
    team2: number
  }
}

export interface GameState {
  isActive: boolean
  currentRound: number
  totalRounds: number
  roundTime: number
  boardCount: number
  players: Player[]
  boards: {
    [key: string]: TeamAssignment
  }
  bench: Player[]
  roundHistory: {
    [round: number]: {
      boards: {
        [key: string]: TeamAssignment
      }
      bench: Player[]
    }
  }
  gameStats: {
    doves: number
    totalGames: number
    roundsPlayed: number
  }
} 