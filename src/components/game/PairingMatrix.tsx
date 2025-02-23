// The sexy pairing history matrix! 📊
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
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Player } from '../../types/player'

interface PairingMatrixProps {
  players: Player[]
}

export const PairingMatrix = ({ players }: PairingMatrixProps) => {
  const pairings = useSelector((state: RootState) => state.pairings)
  const currentGameId = pairings.currentGameId
  const currentGame = currentGameId ? pairings.games[currentGameId] : null

  const getCellColor = (count: number) => {
    if (count === 0) return 'gray.700'
    if (count === 1) return 'green.500'
    if (count === 2) return 'yellow.500'
    return 'red.500'
  }

  if (!currentGame) return null

  console.log('🎲 [PairingMatrix] Rendering matrix for players:', players.map(p => p.name))
  console.log('🎲 [PairingMatrix] Current pairing counts:', currentGame.pairingCounts)

  return (
    <VStack spacing={4} w="full" bg="whiteAlpha.100" p={6} borderRadius="xl" border="1px solid" borderColor="brand.primary">
      <Text fontSize="xl" fontWeight="bold" color="brand.primary">
        Pairing History Matrix 🤝
      </Text>
      <Box overflowX="auto" w="full" sx={{
        '&::-webkit-scrollbar': { height: '8px' },
        '&::-webkit-scrollbar-track': { bg: 'whiteAlpha.100' },
        '&::-webkit-scrollbar-thumb': { bg: 'brand.primary', borderRadius: 'full' }
      }}>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th></Th>
              {players.map(player => (
                <Th 
                  key={player.id} 
                  color="brand.text" 
                  textAlign="center" 
                  px={4} 
                  height="120px"
                  verticalAlign="bottom"
                  sx={{
                    '& > div': {
                      transform: 'rotate(-45deg) translateX(-10px)',
                      width: 'max-content',
                      transformOrigin: 'bottom left',
                      marginBottom: '10px'
                    }
                  }}
                >
                  <div>{player.name}</div>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {players.map(player1 => (
              <Tr key={player1.id}>
                <Th color="brand.text">{player1.name}</Th>
                {players.map(player2 => {
                  const count = player1.id === player2.id ? null : currentGame.pairingCounts[player1.id]?.[player2.id] || 0
                  return (
                    <Td 
                      key={player2.id} 
                      textAlign="center" 
                      p={2} 
                      minW="40px"
                      bg={count !== null ? getCellColor(count) : 'transparent'}
                      opacity={count === 0 ? 0.3 : 1}
                      borderRadius="md"
                    >
                      {count !== null && (
                        <Tooltip label={`${player1.name} + ${player2.name}: Paired ${count} times`}>
                          <Text color="white" fontWeight="bold" fontSize="lg">{count}</Text>
                        </Tooltip>
                      )}
                    </Td>
                  )
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Text fontSize="sm" color="brand.text">
        🟦 Never Paired | 🟩 Once | 🟨 Twice | 🟥 Three+ Times
      </Text>
    </VStack>
  )
} 