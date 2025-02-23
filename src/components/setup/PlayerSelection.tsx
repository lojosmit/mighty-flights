// Where we pick our champions! 🎮
import React from 'react'
import {
  Box,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  useToast,
  Heading,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { RootState } from '../../store/store'
import { Player } from '../../types/player'

interface PlayerSelectionProps {
  selectedPlayers: Player[]
  onUpdate: (players: Player[]) => void
}

export const PlayerSelection = ({ selectedPlayers, onUpdate }: PlayerSelectionProps) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const players = useSelector((state: RootState) => state.players.players)
  const toast = useToast()

  const filteredPlayers = players.filter(player => 
    player.active && player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlayerClick = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      onUpdate(selectedPlayers.filter(p => p.id !== player.id))
      toast({
        title: 'Player removed 👋',
        description: `${player.name} removed from the game`,
        status: 'info',
        duration: 2000,
        position: 'bottom-right',
      })
    } else {
      onUpdate([...selectedPlayers, player])
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="brand.primary" />
        </InputLeftElement>
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="whiteAlpha.100"
          border="none"
          _focus={{ 
            boxShadow: "0 0 0 2px #66FCF1",
            bg: "whiteAlpha.200" 
          }}
        />
      </InputGroup>

      <Box>
        <Heading size="md" color="brand.primary" mb={4}>
          Active Players ({selectedPlayers.length} selected)
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <AnimatePresence>
            {filteredPlayers.map(player => {
              const isSelected = selectedPlayers.find(p => p.id === player.id)
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box
                    p={4}
                    bg={isSelected ? 'brand.accent' : 'brand.secondary'}
                    color={isSelected ? 'brand.background' : 'brand.text'}
                    borderRadius="lg"
                    cursor="pointer"
                    onClick={() => handlePlayerClick(player)}
                    transition="all 0.2s"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bg: isSelected 
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                      _before: {
                        bg: isSelected 
                          ? 'rgba(0, 0, 0, 0.2)' 
                          : 'rgba(102, 252, 241, 0.1)',
                      }
                    }}
                  >
                    <Text 
                      fontWeight="bold"
                      color={isSelected ? 'brand.background' : 'brand.text'}
                    >
                      {player.name}
                    </Text>
                    {player.nickname && (
                      <Text 
                        fontSize="sm" 
                        opacity={0.8}
                        color={isSelected ? 'brand.background' : 'brand.text'}
                      >
                        "{player.nickname}"
                      </Text>
                    )}
                    <Text 
                      fontSize="sm" 
                      mt={2}
                      color={isSelected ? 'brand.background' : 'brand.text'}
                    >
                      Win Rate: {((player.stats.wins / (player.stats.wins + player.stats.losses)) * 100 || 0).toFixed(1)}%
                    </Text>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      >
                        🎯
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </SimpleGrid>
      </Box>
    </VStack>
  )
} 