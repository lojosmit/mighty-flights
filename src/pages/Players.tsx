// Where legends are managed! 🎯
import React from 'react'
import {
  Box,
  Container,
  VStack,
  Button,
  Heading,
} from '@chakra-ui/react'
import { FaPlay } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { PlayerList } from '../components/players/PlayerList'

export const Players = () => {
  const navigate = useNavigate()

  return (
    <Box minH="100vh" bg="brand.background">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Heading 
            color="brand.primary"
            bgGradient="linear(to-r, brand.primary, brand.accent)"
            bgClip="text"
          >
            Player Management 🎯
          </Heading>

          <Button
            colorScheme="teal"
            size="lg"
            onClick={() => navigate('/setup')}
            leftIcon={<FaPlay />}
          >
            Start New Game
          </Button>

          <PlayerList />
        </VStack>
      </Container>
    </Box>
  )
} 