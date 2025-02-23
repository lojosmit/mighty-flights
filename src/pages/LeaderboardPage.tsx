// The hall of legends! 🏆
import React from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  useToast,
  HStack,
  Text,
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { Leaderboard } from '../components/leaderboard/Leaderboard'
import { resetSeason } from '../store/slices/leaderboardSlice'
import { FaTrophy, FaRedo } from 'react-icons/fa'
import { motion } from 'framer-motion'

export const LeaderboardPage = () => {
  const dispatch = useDispatch()
  const toast = useToast()

  const handleResetSeason = () => {
    if (window.confirm('Are you sure you want to reset the season? This cannot be undone!')) {
      dispatch(resetSeason())
      toast({
        title: "Season Reset! 🔄",
        description: "All player stats have been reset for the new season.",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
    }
  }

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
              display="flex"
              alignItems="center"
              gap={4}
            >
              <FaTrophy />
              Mighty Flights Leaderboard
              <FaTrophy />
            </Heading>
          </motion.div>

          <HStack justify="flex-end" w="full">
            <Button
              leftIcon={<FaRedo />}
              colorScheme="red"
              variant="outline"
              onClick={handleResetSeason}
              size="sm"
            >
              Reset Season
            </Button>
          </HStack>

          <Leaderboard />

          <Box textAlign="center" color="brand.text" fontSize="sm">
            <Text>Top 2 players maintain 1.0x handicap</Text>
            <Text>Every 2 ranks below add +0.1 to handicap</Text>
            <Text>🕊️ Master title earned with 3+ dove wins</Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 