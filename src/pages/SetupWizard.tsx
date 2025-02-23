// The wizard where the magic fucking happens! 🧙‍♂️
import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Heading,
  Text,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { ParticleBackground } from '../components/effects/ParticleBackground'
import { PlayerSelection } from '../components/setup/PlayerSelection'
import { BoardSetup } from '../components/setup/BoardSetup'
import { TimeSetup } from '../components/setup/TimeSetup'
import { RoundSetup } from '../components/setup/RoundSetup'
import { MatchPreview } from '../components/setup/MatchPreview'
import { useDispatch } from 'react-redux'
import { startGame } from '../store/slices/gameSlice'
import { Player } from '../types/player'
import { AppDispatch } from '../store/store'

const steps = [
  { title: 'Select Players', description: 'Choose who\'s playing' },
  { title: 'Board Setup', description: 'Configure game boards' },
  { title: 'Round Time', description: 'Set time per round' },
  { title: 'Round Count', description: 'Set number of rounds' },
  { title: 'Preview', description: 'Review and start' },
]

interface GameConfig {
  players: Player[]
  boardCount: number
  roundTime: number
  roundCount: number
}

export const SetupWizard = () => {
  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 0,
    count: steps.length,
  })
  const [gameConfig, setGameConfig] = React.useState<GameConfig>({
    players: [],
    boardCount: 1,
    roundTime: 300, // 5 minutes in seconds
    roundCount: 10,
  })
  const navigate = useNavigate()
  const toast = useToast()
  const dispatch = useDispatch<AppDispatch>()

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      try {
        await dispatch(startGame({
          players: gameConfig.players,
          totalRounds: gameConfig.roundCount,
          roundTime: gameConfig.roundTime,
          boardCount: gameConfig.boardCount
        })).unwrap()

        toast({
          title: 'Game On! 🎯',
          description: 'Let the darts fly!',
          status: 'success',
          duration: 2000,
        })
        navigate('/game')
      } catch (error) {
        console.error('Failed to start game:', error)
        toast({
          title: 'Oops! 😅',
          description: 'Failed to start the game. Please try again.',
          status: 'error',
          duration: 3000,
        })
      }
    } else {
      goToNext()
    }
  }

  const handlePlayerSelection = (selectedPlayers: Player[]) => {
    setGameConfig(prev => ({
      ...prev,
      players: selectedPlayers
    }))
  }

  const handleBoardCountChange = (count: number) => {
    setGameConfig(prev => ({
      ...prev,
      boardCount: count
    }))
  }

  const handleRoundTimeChange = (time: number) => {
    setGameConfig(prev => ({
      ...prev,
      roundTime: time
    }))
  }

  const handleRoundCountChange = (count: number) => {
    setGameConfig(prev => ({
      ...prev,
      roundCount: count
    }))
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <PlayerSelection
            selectedPlayers={gameConfig.players}
            onUpdate={handlePlayerSelection}
          />
        )
      case 1:
        return (
          <BoardSetup
            boardCount={gameConfig.boardCount}
            onUpdate={handleBoardCountChange}
          />
        )
      case 2:
        return (
          <TimeSetup
            roundTime={gameConfig.roundTime}
            onUpdate={handleRoundTimeChange}
          />
        )
      case 3:
        return (
          <RoundSetup
            roundCount={gameConfig.roundCount}
            onUpdate={handleRoundCountChange}
          />
        )
      case 4:
        return (
          <MatchPreview
            config={gameConfig}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box position="relative" minH="100vh" bg="brand.background">
      <ParticleBackground />
      <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch">
          <Heading 
            textAlign="center" 
            color="brand.primary"
            bgGradient="linear(to-r, brand.primary, brand.accent)"
            bgClip="text"
          >
            Game Setup 🎯
          </Heading>

          <Stepper index={activeStep} colorScheme="teal">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber>{index + 1}</StepNumber>}
                    active={<StepNumber>{index + 1}</StepNumber>}
                  />
                </StepIndicator>

                <Box flexShrink='0'>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          <Box py={8}>
            {renderStep()}
          </Box>

          <HStack justify="space-between" pt={4}>
            <Button
              variant="ghost"
              onClick={goToPrevious}
              isDisabled={activeStep === 0}
            >
              Previous
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? 'Start Game' : 'Next'}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
} 