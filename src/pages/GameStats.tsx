// Where we celebrate the fucking legends! 🏆
import React from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  SimpleGrid,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Tooltip,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/store'
import { motion } from 'framer-motion'
import { FaInfoCircle } from 'react-icons/fa'

const getHandicapColor = (handicap: number) => {
  if (handicap === 1.0) return 'gray.500'
  if (handicap <= 1.2) return 'green.400'
  if (handicap <= 1.4) return 'yellow.400'
  return 'red.400'
}

const HandicapChange = ({ oldHandicap, newHandicap }: { oldHandicap: number, newHandicap: number }) => {
  // If either handicap is undefined, show a neutral badge
  if (oldHandicap === undefined || newHandicap === undefined) {
    return <Badge colorScheme="gray" ml={2}>No Change</Badge>
  }

  const diff = +(newHandicap - oldHandicap).toFixed(1)
  const color = diff > 0 ? 'orange' : diff < 0 ? 'green' : 'gray'
  const sign = diff > 0 ? '+' : ''
  
  return (
    <Badge colorScheme={color} ml={2}>
      {oldHandicap.toFixed(1)} → {newHandicap.toFixed(1)} ({sign}{diff})
    </Badge>
  )
}

export const GameStats = () => {
  const game = useSelector((state: RootState) => state.game)
  const leaderboard = useSelector((state: RootState) => state.leaderboard.entries)
  const navigate = useNavigate()

  return (
    <Box minH="100vh" bg="brand.background">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              textAlign="center"
              color="brand.primary"
              bgGradient="linear(to-r, brand.primary, brand.accent)"
              bgClip="text"
            >
              Game Complete! 🎯
            </Heading>
          </motion.div>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
            <Box bg="brand.secondary" p={4} borderRadius="xl" textAlign="center">
              <Text fontSize="2xl" color="brand.primary">{game.gameStats.roundsPlayed}</Text>
              <Text color="brand.text">Rounds Played</Text>
            </Box>
            <Box bg="brand.secondary" p={4} borderRadius="xl" textAlign="center">
              <Text fontSize="2xl" color="brand.primary">{game.gameStats.doves}</Text>
              <Text color="brand.text">Total Doves</Text>
            </Box>
            <Box bg="brand.secondary" p={4} borderRadius="xl" textAlign="center">
              <Text fontSize="2xl" color="brand.primary">{game.players.length}</Text>
              <Text color="brand.text">Players</Text>
            </Box>
            <Box bg="brand.secondary" p={4} borderRadius="xl" textAlign="center">
              <Text fontSize="2xl" color="brand.primary">{game.boardCount}</Text>
              <Text color="brand.text">Boards Used</Text>
            </Box>
          </SimpleGrid>

          <Box w="full" overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="brand.primary">Player</Th>
                  <Th color="brand.primary" isNumeric>Base Points</Th>
                  <Th color="brand.primary" isNumeric>
                    <HStack justify="flex-end" spacing={1}>
                      <Text>Handicap</Text>
                      <Tooltip 
                        label="Handicap multiplier for points. Top 2 players: 1.0x, Ranks 3-4: 1.1x, etc. Arrows show handicap changes after this game."
                        placement="top"
                      >
                        <Box as="span">
                          <FaInfoCircle size="0.8em" />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </Th>
                  <Th color="brand.primary" isNumeric>Adjusted Points</Th>
                  <Th color="brand.primary" isNumeric>Wins</Th>
                  <Th color="brand.primary" isNumeric>Doves</Th>
                  <Th color="brand.primary" isNumeric>Games</Th>
                  <Th color="brand.primary" isNumeric>Benched</Th>
                </Tr>
              </Thead>
              <Tbody>
                {game.players.map((player) => {
                  const leaderboardEntry = leaderboard.find(entry => entry.id === player.id)
                  const oldHandicap = game.initialHandicaps?.[player.id] || 1.0
                  const newHandicap = leaderboardEntry?.stats?.handicap || 1.0
                  console.log(`${player.name} handicap change:`, { 
                    oldHandicap, 
                    newHandicap,
                    diff: +(newHandicap - oldHandicap).toFixed(1)
                  })
                  
                  const basePoints = player.stats.wins + player.stats.doves
                  const adjustedPoints = Math.round(player.stats.wins * newHandicap) + player.stats.doves

                  return (
                    <Tr key={player.id}>
                      <Td color="brand.text">
                        <HStack>
                          <Text>{player.name}</Text>
                          {player.stats.doves >= 3 && (
                            <Badge colorScheme="yellow" fontSize="xs">🕊️ Dove Master</Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td isNumeric color="brand.text">{basePoints}</Td>
                      <Td isNumeric>
                        <HStack justify="flex-end" spacing={0}>
                          <Text color={getHandicapColor(newHandicap)}>
                            {newHandicap.toFixed(1)}x
                          </Text>
                          <HandicapChange 
                            oldHandicap={oldHandicap} 
                            newHandicap={newHandicap}
                          />
                        </HStack>
                      </Td>
                      <Td isNumeric color="brand.primary" fontWeight="bold">
                        {adjustedPoints}
                      </Td>
                      <Td isNumeric color="brand.text">{player.stats.wins}</Td>
                      <Td isNumeric color="brand.text">{player.stats.doves}</Td>
                      <Td isNumeric color="brand.text">{player.stats.wins + player.stats.losses}</Td>
                      <Td isNumeric color="brand.text">{player.stats.benched || 0}</Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>

          <Button
            colorScheme="teal"
            size="lg"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </VStack>
      </Container>
    </Box>
  )
} 