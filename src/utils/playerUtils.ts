import { Player } from '../types/player'

export const createPlayer = (name: string): Player => ({
  id: crypto.randomUUID(),
  name,
  isActive: true,
  stats: {
    consecutiveWins: 0,
    benched: 0,
    lastBenchedRound: undefined,
    totalWins: 0,
    totalLosses: 0
  }
}) 