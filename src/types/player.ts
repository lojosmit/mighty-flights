// All the juicy player types live here! 🎯
export interface PlayerStats {
  consecutiveWins: number
  benched: number
  lastBenchedRound?: number
  totalWins: number
  totalLosses: number
}

export interface Player {
  id: string
  name: string
  nickname?: string
  email?: string
  stats: PlayerStats
  isActive: boolean
} 