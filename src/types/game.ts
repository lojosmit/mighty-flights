import { Player } from './player'

export interface TeamAssignment {
  team1: Player[]
  team2: Player[]
  winner?: 'team1' | 'team2'
  isDove?: boolean
}

export interface BoardResults {
  [key: string]: {
    winner: 'team1' | 'team2'
    isDove?: boolean
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