// Where legends are born and stats are tracked! 📊
import React from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  useDisclosure,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { PlayerCard } from '../components/players/PlayerCard'
import { AddPlayerModal } from '../components/players/AddPlayerModal'
import { ParticleBackground } from '../components/effects/ParticleBackground'

export const PlayerManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchQuery, setSearchQuery] = React.useState('')
  const players = useSelector((state: RootState) => state.players.players)

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box position="relative" minH="100vh" bg="brand.background">
      <ParticleBackground />
      <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heading color="brand.primary">Player Management</Heading>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                onClick={onOpen}
                size="lg"
              >
                Add Player
              </Button>
            </motion.div>
          </Box>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="brand.primary" />
              </InputLeftElement>
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="brand.secondary"
                border="none"
                _focus={{ boxShadow: "0 0 0 2px #66FCF1" }}
              />
            </InputGroup>
          </motion.div>

          {/* Player Grid */}
          {filteredPlayers.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PlayerCard player={player} />
                </motion.div>
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={10}>
              <Text color="brand.text" fontSize="xl">
                No players found. Add some players to get started! 🎯
              </Text>
            </Box>
          )}
        </VStack>
      </Container>

      <AddPlayerModal isOpen={isOpen} onClose={onClose} />
    </Box>
  )
} 