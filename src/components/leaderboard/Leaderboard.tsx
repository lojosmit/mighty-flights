// The wall of fame! 🏆
import React from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaCrown, FaMedal, FaTrophy, FaInfoCircle } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { LeaderboardEntry } from '../../store/slices/leaderboardSlice'

const MotionTr = motion(Tr)

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <FaCrown color="#FFD700" /> // Gold
    case 2:
      return <FaTrophy color="#C0C0C0" /> // Silver
    case 3:
      return <FaMedal color="#CD7F32" /> // Bronze
    default:
      return null
  }
}

const getHandicapColor = (handicap: number) => {
  if (handicap === 1.0) return 'gray.500'
  if (handicap <= 1.2) return 'green.400'
  if (handicap <= 1.4) return 'yellow.400'
  return 'red.400'
}

export const Leaderboard = () => {
  const { entries, seasonNumber, lastUpdated } = useSelector(
    (state: RootState) => state.leaderboard
  )

  const headerBg = useColorModeValue('brand.secondary', 'gray.700')
  const rowHoverBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')

  return (
    <Box w="full" overflowX="auto">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" px={4}>
          <Text color="brand.text" fontSize="sm">
            Season {seasonNumber}
          </Text>
          <Text color="brand.text" fontSize="sm">
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </Text>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr bg={headerBg}>
              <Th color="brand.primary">Rank</Th>
              <Th color="brand.primary">Player</Th>
              <Th color="brand.primary" isNumeric>Base Points</Th>
              <Th color="brand.primary" isNumeric>
                <HStack justify="flex-end" spacing={1}>
                  <Text>Handicap</Text>
                  <Tooltip 
                    label="Handicap multiplier for points. Top 2 players: 1.0x, Ranks 3-4: 1.1x, etc."
                    placement="top"
                  >
                    <Box as="span">
                      <FaInfoCircle size="0.8em" />
                    </Box>
                  </Tooltip>
                </HStack>
              </Th>
              <Th color="brand.primary" isNumeric>Adjusted Points</Th>
              <Th color="brand.primary" isNumeric>Games</Th>
              <Th color="brand.primary" isNumeric>Wins</Th>
              <Th color="brand.primary" isNumeric>Doves</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.map((entry: LeaderboardEntry, index: number) => (
              <MotionTr
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                _hover={{ bg: rowHoverBg }}
              >
                <Td>
                  <HStack>
                    <Text color="brand.text">{entry.seasonStats.rank}</Text>
                    {getRankIcon(entry.seasonStats.rank || 0)}
                  </HStack>
                </Td>
                <Td>
                  <HStack>
                    <Text color="brand.text">{entry.name}</Text>
                    {entry.seasonStats.doves >= 3 && (
                      <Badge colorScheme="yellow" fontSize="xs">
                        🕊️ Dove Master
                      </Badge>
                    )}
                  </HStack>
                </Td>
                <Td isNumeric color="brand.text">
                  {entry.seasonStats.basePoints}
                </Td>
                <Td isNumeric>
                  <Text color={getHandicapColor(entry.seasonStats.handicap)}>
                    {entry.seasonStats.handicap.toFixed(1)}x
                  </Text>
                </Td>
                <Td isNumeric color="brand.primary" fontWeight="bold">
                  {entry.seasonStats.points}
                </Td>
                <Td isNumeric color="brand.text">
                  {entry.seasonStats.gamesPlayed}
                </Td>
                <Td isNumeric color="brand.text">
                  {entry.seasonStats.wins}
                </Td>
                <Td isNumeric>
                  <HStack justify="flex-end" spacing={1}>
                    <Text color="brand.text">{entry.seasonStats.doves}</Text>
                    {entry.seasonStats.doves > 0 && <Text>🕊️</Text>}
                  </HStack>
                </Td>
              </MotionTr>
            ))}
          </Tbody>
        </Table>

        {entries.length === 0 && (
          <Box 
            textAlign="center" 
            py={8}
            color="brand.text"
          >
            No players in the leaderboard yet. Time to play some games! 🎯
          </Box>
        )}
      </VStack>
    </Box>
  )
} 