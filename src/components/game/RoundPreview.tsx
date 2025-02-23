// Preview the next round's epic matchups! 🎯
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  SimpleGrid,
  Box,
  Text,
  VStack,
  Badge,
  HStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Player } from '../../types/player'
import { PairingMatrix } from './PairingMatrix'

interface TeamAssignment {
  team1: Player[]
  team2: Player[]
}

interface RoundPreviewProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
  roundNumber: number
  boards: {
    [key: string]: TeamAssignment
  }
  bench: Player[]
}

export const RoundPreview = ({
  isOpen,
  onClose,
  onStart,
  roundNumber,
  boards,
  bench,
}: RoundPreviewProps) => {
  const MotionBox = motion(Box)

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl" 
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="brand.secondary" color="brand.text">
        <ModalHeader>
          <Text
            fontSize="2xl"
            bgGradient="linear(to-r, brand.primary, brand.accent)"
            bgClip="text"
            textAlign="center"
          >
            Round {roundNumber} Matchups 🎯
          </Text>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              {Object.entries(boards).map(([boardId, board]) => (
                <MotionBox
                  key={boardId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  bg="whiteAlpha.100"
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="brand.primary"
                >
                  <Text fontSize="lg" color="brand.primary" mb={3}>
                    Board {boardId}
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontWeight="bold" mb={1}>Team 1</Text>
                      {board.team1.map(player => (
                        <Text key={player.id} fontSize="sm">
                          {player.name}
                        </Text>
                      ))}
                    </Box>
                    <Text textAlign="center">vs</Text>
                    <Box>
                      <Text fontWeight="bold" mb={1}>Team 2</Text>
                      {board.team2.map(player => (
                        <Text key={player.id} fontSize="sm">
                          {player.name}
                        </Text>
                      ))}
                    </Box>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>

            {bench.length > 0 && (
              <Box w="full">
                <Text fontWeight="bold" mb={2}>
                  Bench Squad
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {bench.map(player => (
                    <Badge
                      key={player.id}
                      colorScheme="yellow"
                      p={2}
                      borderRadius="md"
                    >
                      {player.name}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            <PairingMatrix players={[
              ...Object.values(boards).flatMap(board => [...board.team1, ...board.team2]),
              ...bench
            ]} />
          </VStack>
        </ModalBody>

        <ModalFooter gap={4}>
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
            flex={1}
          >
            Back
          </Button>
          <Button
            colorScheme="teal"
            onClick={onStart}
            size="lg"
            flex={1}
          >
            Start Round
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 