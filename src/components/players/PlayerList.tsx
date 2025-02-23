// The list of all our badass players! 🎯
import React from 'react'
import {
  VStack,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { PlayerCard } from './PlayerCard'
import { AddPlayerModal } from './AddPlayerModal'

export const PlayerList = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const players = useSelector((state: RootState) => state.players.players)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <VStack spacing={6} w="full">
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

      <Button
        leftIcon={<AddIcon />}
        colorScheme="teal"
        onClick={onOpen}
        alignSelf="flex-end"
      >
        Add New Player
      </Button>

      <SimpleGrid 
        columns={{ base: 1, md: 2, lg: 3 }} 
        spacing={6}
        w="full"
      >
        {filteredPlayers.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </SimpleGrid>

      <AddPlayerModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  )
} 