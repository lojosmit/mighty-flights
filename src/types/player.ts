// All the juicy player types live here! 🎯
export interface PlayerStats {
  wins: number
  losses: number
  doves: number
  handicap: number
  benched: number
  games: number
  lastBenchedRound?: number
  consecutiveWins?: number  // Track consecutive wins for Board A rotation
}

export interface Player {
  id: string
  name: string
  nickname?: string
  email?: string
  stats: PlayerStats
  isActive: boolean
} 