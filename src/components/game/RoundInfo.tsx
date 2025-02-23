// Round info display with all the juicy details! 📊
import React from 'react'
import {
  Box,
  HStack,
  Text,
  Progress,
  Badge,
} from '@chakra-ui/react'

interface RoundInfoProps {
  currentRound: number
  totalRounds: number
}

export const RoundInfo = ({ currentRound, totalRounds }: RoundInfoProps) => {
  const progress = (currentRound / totalRounds) * 100

  return (
    <Box 
      bg="brand.secondary" 
      p={4} 
      borderRadius="xl"
      w="full"
    >
      <HStack justify="space-between" mb={2}>
        <Text color="brand.text" fontSize="lg">
          Round <Badge colorScheme="teal">{currentRound}</Badge> of {totalRounds}
        </Text>
        <Badge colorScheme="purple">
          {Math.round(progress)}% Complete
        </Badge>
      </HStack>
      <Progress 
        value={progress} 
        colorScheme="teal" 
        borderRadius="full"
        bg="whiteAlpha.100"
        size="sm"
      />
    </Box>
  )
} 