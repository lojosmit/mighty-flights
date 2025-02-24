// Preview before the mayhem begins! 🎯
import React from 'react'
import {
  VStack,
  Box,
  Text,
  Heading,
  SimpleGrid,
  Badge,
  Divider,
  HStack,
} from '@chakra-ui/react'
import { Player } from '../../types/player'

interface MatchPreviewProps {
  config: {
    players: Player[]
    boardCount: number
    roundTime: number
    roundCount: number
  }
}

interface BoardAssignment {
  board: string
  players: {
    team1: Player[]
    team2: Player[]
  }
}

export const MatchPreview = ({ config }: MatchPreviewProps) => {
  // Generate first round pairings
  const generateFirstRound = (): { boards: BoardAssignment[], bench: Player[] } => {
    const players = [...config.players]
    const boards: BoardAssignment[] = []
    const bench: Player[] = []

    // Shuffle players completely randomly using Fisher-Yates algorithm
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]]
    }

    // Fill boards in order, no special logic, just take players as they come
    for (let i = 0; i < config.boardCount; i++) {
      const boardLetter = String.fromCharCode(65 + i) // A, B, C, etc.
      const assignment: BoardAssignment = {
        board: boardLetter,
        players: {
          team1: [],
          team2: []
        }
      }

      // Try to fill 2v2 first
      if (players.length >= 4) {
        assignment.players.team1 = players.splice(0, 2)
        assignment.players.team2 = players.splice(0, 2)
      } 
      // If not enough for 2v2, do 1v1
      else if (players.length >= 2) {
        assignment.players.team1 = [players.splice(0, 1)[0]]
        assignment.players.team2 = [players.splice(0, 1)[0]]
      }
      
      boards.push(assignment)
    }

    // Any remaining players go to bench
    bench.push(...players)

    // Store these pairings in localStorage to be used as the actual first round
    localStorage.setItem('firstRoundPairings', JSON.stringify({ boards, bench }))

    return { boards, bench }
  }

  const firstRound = generateFirstRound()

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="md" color="brand.primary" textAlign="center">
        Match Configuration Preview
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg="brand.secondary" p={6} borderRadius="xl">
          <Heading size="sm" color="brand.primary" mb={4}>
            Game Settings
          </Heading>
          <VStack align="stretch" spacing={3}>
            <Text color="brand.text">
              Boards: <Badge colorScheme="teal">{config.boardCount}</Badge>
            </Text>
            <Text color="brand.text">
              Round Duration: <Badge colorScheme="teal">{config.roundTime / 60} minutes</Badge>
            </Text>
            <Text color="brand.text">
              Total Rounds: <Badge colorScheme="teal">{config.roundCount}</Badge>
            </Text>
            <Text color="brand.text">
              Game Mode: <Badge colorScheme="purple">
                {config.boardCount === 1 ? 'Standard' : 'Challenger'}
              </Badge>
            </Text>
          </VStack>
        </Box>

        <Box bg="brand.secondary" p={6} borderRadius="xl">
          <Heading size="sm" color="brand.primary" mb={4}>
            Selected Players ({config.players.length})
          </Heading>
          <VStack align="stretch" spacing={2}>
            {config.players.map(player => (
              <Text key={player.id} color="brand.text">
                {player.name} {player.nickname && `"${player.nickname}"`}
              </Text>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>

      <Divider />

      <Box>
        <Heading size="md" color="brand.primary" mb={6}>
          First Round Preview 🎯
        </Heading>
        <SimpleGrid columns={{ base: 1, md: config.boardCount }} spacing={4}>
          {firstRound.boards.map((board) => (
            <Box 
              key={board.board} 
              bg="brand.secondary" 
              p={4} 
              borderRadius="xl"
              border="1px solid"
              borderColor="brand.primary"
            >
              <Heading size="sm" color="brand.accent" mb={3}>
                Board {board.board}
              </Heading>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text color="brand.text" fontWeight="bold">Team 1</Text>
                  {board.players.team1.map(player => (
                    <Text key={player.id} color="brand.text" fontSize="sm">
                      {player.name}
                    </Text>
                  ))}
                </Box>
                <Text color="brand.text" textAlign="center">vs</Text>
                <Box>
                  <Text color="brand.text" fontWeight="bold">Team 2</Text>
                  {board.players.team2.map(player => (
                    <Text key={player.id} color="brand.text" fontSize="sm">
                      {player.name}
                    </Text>
                  ))}
                </Box>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {firstRound.bench.length > 0 && (
          <Box mt={6}>
            <Heading size="sm" color="brand.primary" mb={2}>
              Bench
            </Heading>
            <HStack spacing={4}>
              {firstRound.bench.map(player => (
                <Badge key={player.id} colorScheme="yellow">
                  {player.name}
                </Badge>
              ))}
            </HStack>
          </Box>
        )}
      </Box>

      <Text color="brand.text" textAlign="center" fontSize="sm">
        Ready to start the game? Click "Start Game" below! 🎯
      </Text>
    </VStack>
  )
} 