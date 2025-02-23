import React, { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Navbar } from './components/layout/Navbar'
import { Home } from './pages/Home'
import { SetupWizard } from './pages/SetupWizard'
import { Game } from './pages/Game'
import { Players } from './pages/Players'
import { GameStats } from './pages/GameStats'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { RootState } from './store/store'
import { initializeLeaderboard } from './store/slices/leaderboardSlice'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Box minH="100vh" bg="brand.background">
        <Navbar />
        <Box as="main">
          <Home />
        </Box>
      </Box>
    ),
  },
  {
    path: '/players',
    element: (
      <Box minH="100vh" bg="brand.background">
        <Navbar />
        <Box as="main">
          <Players />
        </Box>
      </Box>
    ),
  },
  {
    path: '/setup',
    element: (
      <Box minH="100vh" bg="brand.background">
        <Navbar />
        <Box as="main">
          <SetupWizard />
        </Box>
      </Box>
    ),
  },
  {
    path: '/game',
    element: (
      <Box minH="100vh" bg="brand.background">
        <Navbar />
        <Box as="main">
          <Game />
        </Box>
      </Box>
    ),
  },
  {
    path: '/stats',
    element: (
      <Box minH="100vh" bg="brand.background">
        <Navbar />
        <Box as="main">
          <GameStats />
        </Box>
      </Box>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <Box minH="100vh" bg="brand.background">
        <Navbar />
        <Box as="main">
          <LeaderboardPage />
        </Box>
      </Box>
    ),
  },
])

export const App = () => {
  const dispatch = useDispatch()
  const players = useSelector((state: RootState) => state.players.players)

  // Initialize leaderboard with active players when app starts
  useEffect(() => {
    const activePlayers = players.filter(player => player.active)
    console.log('🎮 Initializing app with active players:', activePlayers.length)
    dispatch(initializeLeaderboard(activePlayers))
  }, [dispatch, players])

  return <RouterProvider router={router} />
} 