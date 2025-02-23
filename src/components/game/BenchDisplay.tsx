// The chill zone where players take a breather! 🪑
import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { Player } from '../../types/player'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface BenchDisplayProps {
  players: Player[]
}

export const BenchDisplay = ({ players }: BenchDisplayProps) => {
  const gameState = useSelector((state: RootState) => state.game)

  const getBenchInfo = (player: Player) => {
    return {
      total: player.stats.benched || 0,
      lastRound: player.stats.lastBenchedRound || 0,
      consecutiveCount: player.stats.lastBenchedRound === gameState.currentRound - 1 ? 2 : 1
    }
  }

  return (
    <Box
      bg="whiteAlpha.100"
      p={4}
      borderRadius="xl"
      border="1px solid"
      borderColor="brand.primary"
      w="full"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color="brand.primary">
          Bench Squad 🪑
        </Text>

        {(!players || players.length === 0) ? (
          <Text color="brand.text" fontSize="lg" textAlign="center">
            No players benched this round 🎯
          </Text>
        ) : (
          <VStack spacing={2} align="stretch">
            {players.map(player => {
              const benchInfo = getBenchInfo(player)
              const isConsecutive = benchInfo.consecutiveCount > 1
              return (
                <Box
                  key={player.id}
                  bg={isConsecutive ? "red.900" : "whiteAlpha.50"}
                  p={3}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={isConsecutive ? "red.500" : "whiteAlpha.200"}
                >
                  <HStack justify="space-between">
                    <HStack>
                      <Text color="brand.text" fontSize="lg">
                        {player.name}
                      </Text>
                      {isConsecutive && (
                        <Tooltip label="Warning: Player was benched in consecutive rounds!">
                          <Badge colorScheme="red">
                            ⚠️ Consecutive
                          </Badge>
                        </Tooltip>
                      )}
                    </HStack>
                    <HStack spacing={2}>
                      <Tooltip label={`Total times benched this game`}>
                        <Badge colorScheme="purple" fontSize="sm">
                          Total: {benchInfo.total}x
                        </Badge>
                      </Tooltip>
                      {benchInfo.lastRound > 0 && (
                        <Tooltip label={`Last benched in round ${benchInfo.lastRound}`}>
                          <Badge 
                            colorScheme={isConsecutive ? "red" : "blue"} 
                            fontSize="sm"
                          >
                            Last: R{benchInfo.lastRound}
                          </Badge>
                        </Tooltip>
                      )}
                    </HStack>
                  </HStack>
                </Box>
              )
            })}
          </VStack>
        )}
      </VStack>
    </Box>
  )
} 