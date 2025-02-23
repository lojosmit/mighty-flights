// Where the real action happens! 🎯
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Player } from '../../types/player'

interface GameBoardProps {
  boardId: string
  team1: Player[]
  team2: Player[]
  onWinnerSelect?: (winner: 'team1' | 'team2', isDove?: boolean) => void
  currentRound: number
}

export const GameBoard = ({ 
  boardId, 
  team1, 
  team2, 
  onWinnerSelect,
  currentRound 
}: GameBoardProps) => {
  const [winner, setWinner] = React.useState<'team1' | 'team2' | null>(null)
  const [isDove, setIsDove] = React.useState(false)

  React.useEffect(() => {
    setWinner(null)
    setIsDove(false)
  }, [currentRound])

  const handleWinnerSelect = (team: 'team1' | 'team2') => {
    setWinner(team)
    onWinnerSelect?.(team, isDove)
  }

  const TeamSection = ({ players, teamNumber }: { players: Player[], teamNumber: 1 | 2 }) => (
    <Box flex="1">
      <Text color="brand.text" mb={2} fontSize="lg">
        Team {teamNumber}
      </Text>
      <VStack spacing={2} align="stretch">
        {players.map(player => (
          <Box
            key={player.id}
            bg="whiteAlpha.100"
            px={4}
            py={3}
            borderRadius="md"
          >
            <Text color="white" fontSize="md">
              {player.name}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  )

  return (
    <Box
      bg="rgba(30, 41, 59, 0.8)"
      h="full"
      p={6}
      borderRadius="xl"
      position="relative"
      display="flex"
      flexDirection="column"
    >
      <Badge
        position="absolute"
        top={4}
        right={4}
        bg="rgba(147, 51, 234, 0.3)"
        color="white"
        px={3}
        py={1}
        borderRadius="full"
        fontSize="sm"
      >
        BOARD {boardId}
      </Badge>

      <Box flex="1" mb={6}>
        <HStack spacing={4} align="flex-start" h="full">
          <TeamSection players={team1} teamNumber={1} />
          <Box alignSelf="center">
            <Text 
              color="gray.500" 
              fontSize="xl" 
              fontWeight="bold"
            >
              vs
            </Text>
          </Box>
          <TeamSection players={team2} teamNumber={2} />
        </HStack>
      </Box>

      {!winner ? (
        <VStack spacing={3} mt="auto">
          <HStack spacing={2} w="full">
            <Button
              bg="rgba(74, 222, 128, 0.2)"
              color="rgb(74, 222, 128)"
              onClick={() => handleWinnerSelect('team1')}
              flex={1}
              h="48px"
              _hover={{
                bg: "rgba(74, 222, 128, 0.3)"
              }}
            >
              Team 1 Wins
            </Button>
            <Button
              bg="rgba(74, 222, 128, 0.2)"
              color="rgb(74, 222, 128)"
              onClick={() => handleWinnerSelect('team2')}
              flex={1}
              h="48px"
              _hover={{
                bg: "rgba(74, 222, 128, 0.3)"
              }}
            >
              Team 2 Wins
            </Button>
          </HStack>
          <Button
            variant="outline"
            borderColor="yellow.500"
            color="yellow.500"
            onClick={() => setIsDove(!isDove)}
            isActive={isDove}
            w="full"
            h="48px"
            _hover={{
              bg: "rgba(234, 179, 8, 0.2)"
            }}
            _active={{
              bg: "rgba(234, 179, 8, 0.3)"
            }}
          >
            Dove 🕊️
          </Button>
        </VStack>
      ) : (
        <Box
          bg={isDove ? "rgba(234, 179, 8, 0.2)" : "rgba(74, 222, 128, 0.2)"}
          color={isDove ? "yellow.500" : "green.500"}
          p={4}
          borderRadius="md"
          textAlign="center"
          fontSize="lg"
          fontWeight="bold"
          mt="auto"
        >
          {winner === 'team1' ? 'Team 1' : 'Team 2'} Wins!
          {isDove && ' 🕊️'}
        </Box>
      )}
    </Box>
  )
} 