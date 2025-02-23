// Where the magic fucking happens! 🎯
import React from 'react'
import {
  Box,
  Container,
  Grid,
  VStack,
  Button,
  useToast,
  Center,
  Text,
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { GameTimer } from '../components/game/GameTimer'
import { GameBoard } from '../components/game/GameBoard'
import { RoundInfo } from '../components/game/RoundInfo'
import { RoundPreview } from '../components/game/RoundPreview'
import { RootState } from '../store/store'
import { endRound, endGame, updateBoards } from '../store/slices/gameSlice'
import { recordRoundPairings } from '../store/slices/pairingSlice'
import { generatePairings } from '../utils/pairingLogic'
import { Player } from '../types/player'
import { FaArrowRight } from 'react-icons/fa'
import { BenchDisplay } from '../components/game/BenchDisplay'
import { useNavigate } from 'react-router-dom'

export const Game = () => {
  const game = useSelector((state: RootState) => state.game)
  const pairings = useSelector((state: RootState) => state.pairings)
  const dispatch = useDispatch()
  const toast = useToast()
  const navigate = useNavigate()

  // Redirect if no active game
  React.useEffect(() => {
    if (!game.isActive) {
      toast({
        title: "No Active Game! 🚫",
        description: "Please start a new game from the setup wizard.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
      return
    }
  }, [game.isActive])

  // Only initialize state if game is active
  const [boardResults, setBoardResults] = React.useState<{
    [key: string]: {
      winner: 'team1' | 'team2'
      isDove: boolean
    }
  }>({})
  const [showPreview, setShowPreview] = React.useState(false)
  const [timerAutoStart, setTimerAutoStart] = React.useState(false)
  const timerRef = React.useRef<{
    pause: () => void
    start: () => void
    reset: () => void
  }>(null)

  // Auto-start timer on first round
  React.useEffect(() => {
    if (game.currentRound === 1 && game.isActive) {
      setTimerAutoStart(true)
      // Show a welcome toast for the first round
      toast({
        title: "Game On! 🎯",
        description: "First round starting automatically!",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
    }
  }, [game.currentRound, game.isActive])

  const handleWinnerSelect = (
    boardId: string, 
    winner: 'team1' | 'team2', 
    isDove?: boolean
  ) => {
    const newResults = {
      ...boardResults,
      [boardId]: { winner, isDove: Boolean(isDove) }
    }
    setBoardResults(newResults)

    // Check if all boards have winners and pause timer if they do
    const allBoardsComplete = Object.keys(game.boards).every(
      boardId => newResults[boardId]?.winner
    )

    if (allBoardsComplete && timerRef.current) {
      timerRef.current.pause()
      toast({
        title: "Round Complete! 🎯",
        description: "All boards have reported their winners.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const allBoardsComplete = React.useMemo(() => {
    const boardIds = Object.keys(game.boards)
    return boardIds.length > 0 && 
      boardIds.every(boardId => boardResults[boardId]?.winner)
  }, [boardResults, game.boards])

  const handleNextRound = () => {
    // First save the current round's results
    dispatch(endRound({ boardResults }))
      .unwrap()
      .then((result) => {
        // Get promoted players (winners from lower boards)
        const promotedPlayers = Object.entries(game.boards)
          .filter(([boardId, board]) => {
            const result = boardResults[boardId]
            // Only count promotions from lower boards (B, C, etc.)
            return boardId !== 'A' && result?.winner && board[result.winner]
          })
          .flatMap(([_, board]) => {
            const winner = boardResults[_]?.winner
            return winner ? board[winner] : []
          })

        // Get current board configurations for 1v1 promotion check
        const currentBoards = Object.entries(game.boards).map(([boardId, board]) => ({
          boardId,
          team1: board.team1,
          team2: board.team2
        }))

        // Generate new pairings with the NEXT round number
        const newPairings = generatePairings({
          availablePlayers: game.players,
          boardCount: game.boardCount,
          pairingHistory: pairings.games[pairings.currentGameId!],
          currentRound: result.nextRound, // Use the nextRound from endRound result
          promotedPlayers,
          previousRoundBoards: currentBoards
        })

        // Record the new pairings
        dispatch(recordRoundPairings({
          gameId: pairings.currentGameId!,
          round: result.nextRound,  // Use the NEXT round number
          boardPairings: newPairings.boards.map(board => ({
            boardId: board.boardId,
            team1: board.team1 as [Player, Player?],
            team2: board.team2 as [Player, Player?]
          })),
          benchedPlayers: newPairings.bench
        }))

        // Update the game boards and bench with new pairings
        dispatch(updateBoards({
          boards: newPairings.boards.reduce((acc, board) => ({
            ...acc,
            [board.boardId]: {
              team1: board.team1,
              team2: board.team2
            }
          }), {}),
          bench: newPairings.bench
        }))

        // Reset board results and show preview
        setBoardResults({})
        setShowPreview(true)
        
        // Show promotions/relegations toast
        if (game.boardCount > 1) {
          toast({
            title: "Board Changes! 🔄",
            description: "Teams have been optimally paired based on history!",
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top"
          })
        }
      })
      .catch(error => {
        console.error('Failed to end round:', error)
        toast({
          title: 'Error! 😱',
          description: 'Failed to end round. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      })
  }

  const handleStartRound = () => {
    setShowPreview(false)
    setTimerAutoStart(true)
  }

  const handleGameComplete = () => {
    // Save the final round first
    dispatch(endRound({ boardResults }))
    // Then end the game
    dispatch(endGame())
    toast({
      title: "Game Complete! 🎯",
      description: "What a match! Check out the final stats.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top"
    })
    navigate('/stats')
  }

  // Only render game UI if there's an active game
  if (!game.isActive) {
    return (
      <Center minH="100vh" bg="brand.background">
        <Text color="brand.text" fontSize="xl">
          Redirecting to home... 🏃‍♂️
        </Text>
      </Center>
    )
  }

  return (
    <Box minH="100vh" bg="brand.background">
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6}>
          {/* Timer and Bench Row */}
          <Grid 
            templateColumns={{ base: '1fr', md: '1fr 2fr' }}
            gap={6}
            w="full"
            alignItems="start"
          >
            <GameTimer 
              initialTime={game.roundTime} 
              autoStart={timerAutoStart}
              timerRef={timerRef}
            />
            <BenchDisplay players={game.bench} />
          </Grid>

          {/* Round Info */}
          <RoundInfo 
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
          />

          {/* Game Boards */}
          <Box w="full">
            <Grid 
              templateColumns={{
                base: '1fr',
                md: 'repeat(auto-fit, minmax(400px, 1fr))'
              }}
              gap={6}
              w="full"
              mx="auto"
            >
              {Object.entries(game.boards).map(([boardId, board]) => (
                <Box 
                  key={boardId}
                  minW="400px"
                  h="400px"  // Fixed height for consistency
                >
                  <GameBoard 
                    boardId={boardId}
                    team1={board.team1}
                    team2={board.team2}
                    currentRound={game.currentRound}
                    onWinnerSelect={(winner, isDove) => 
                      handleWinnerSelect(boardId, winner, isDove)
                    }
                  />
                </Box>
              ))}
            </Grid>
          </Box>

          {/* Next Round / Complete Game Button */}
          {allBoardsComplete && (
            <Button
              colorScheme="teal"
              size="lg"
              rightIcon={<FaArrowRight />}
              onClick={game.currentRound < game.totalRounds ? handleNextRound : handleGameComplete}
            >
              {game.currentRound < game.totalRounds ? 'Next Round' : 'Complete Game'}
            </Button>
          )}
        </VStack>
      </Container>

      {/* Round Preview Modal */}
      <RoundPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onStart={handleStartRound}
        roundNumber={game.currentRound}
        boards={game.boards}
        bench={game.bench}
      />
    </Box>
  )
} 