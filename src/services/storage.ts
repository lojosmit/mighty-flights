// Local storage service for persisting game data 🗄️

const STORAGE_KEYS = {
  PLAYERS: 'mf_players',
  GAME_STATE: 'mf_game_state',
  MATCH_HISTORY: 'mf_match_history'
} as const

export const storage = {
  getItem<T>(key: keyof typeof STORAGE_KEYS): T | null {
    const item = localStorage.getItem(STORAGE_KEYS[key])
    return item ? JSON.parse(item) : null
  },

  setItem<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value))
  },

  removeItem(key: keyof typeof STORAGE_KEYS): void {
    localStorage.removeItem(STORAGE_KEYS[key])
  }
} 