// Player cards that look so good, you'll want to collect them all! 🎴
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tooltip,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { Player } from '../../types/player'
import { EditPlayerModal } from './EditPlayerModal'
import { DeletePlayerModal } from './DeletePlayerModal'

interface PlayerCardProps {
  player: Player
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure()
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure()

  const winRate = ((player.stats.wins / (player.stats.wins + player.stats.losses)) * 100 || 0).toFixed(1)

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Box
        bg="brand.secondary"
        p={6}
        borderRadius="xl"
        boxShadow="xl"
        position="relative"
        overflow="hidden"
      >
        {/* Status Badge */}
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme={player.active ? "green" : "red"}
        >
          {player.active ? "Active" : "Inactive"}
        </Badge>

        {/* Player Info */}
        <VStack align="stretch" spacing={4}>
          <Box>
            <Heading size="md" color="brand.primary">
              {player.name}
            </Heading>
            {player.nickname && (
              <Text color="brand.accent" fontSize="md" fontStyle="italic">
                "{player.nickname}"
              </Text>
            )}
          </Box>
          {player.email && (
            <Text color="brand.text" fontSize="sm">
              {player.email}
            </Text>
          )}

          {/* Stats */}
          <StatGroup>
            <Stat>
              <StatLabel color="brand.text">Wins</StatLabel>
              <StatNumber color="green.400">{player.stats.wins}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="brand.text">Losses</StatLabel>
              <StatNumber color="red.400">{player.stats.losses}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="brand.text">Win Rate</StatLabel>
              <StatNumber color="brand.primary">{winRate}%</StatNumber>
            </Stat>
          </StatGroup>

          {/* Additional Stats */}
          <HStack justify="space-between">
            <Tooltip label="Times achieved a complete whitewash victory 🔥" aria-label="Doves explanation">
              <Text color="brand.text">
                Doves: {player.stats.doves} 🕊️
              </Text>
            </Tooltip>
            <Text color="brand.text">Handicap: {player.stats.handicap}x</Text>
          </HStack>

          {/* Actions */}
          <HStack justify="flex-end" pt={2}>
            <IconButton
              aria-label="Edit player"
              icon={<EditIcon />}
              onClick={onEditOpen}
              variant="ghost"
              colorScheme="teal"
            />
            <IconButton
              aria-label="Delete player"
              icon={<DeleteIcon />}
              onClick={onDeleteOpen}
              variant="ghost"
              colorScheme="red"
            />
          </HStack>
        </VStack>
      </Box>

      <EditPlayerModal 
        isOpen={isEditOpen} 
        onClose={onEditClose} 
        player={player} 
      />
      <DeletePlayerModal 
        isOpen={isDeleteOpen} 
        onClose={onDeleteClose} 
        playerId={player.id} 
        playerName={player.name}
      />
    </motion.div>
  )
} 