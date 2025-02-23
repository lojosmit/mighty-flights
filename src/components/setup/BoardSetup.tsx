// Board setup - where the magic begins! 🎯
import React from 'react'
import {
  VStack,
  Text,
  Heading,
  HStack,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
} from '@chakra-ui/react'
import { FaMinus, FaPlus } from 'react-icons/fa'

interface BoardSetupProps {
  boardCount: number
  onUpdate: (count: number) => void
}

export const BoardSetup = ({ boardCount, onUpdate }: BoardSetupProps) => {
  const handleIncrement = () => {
    onUpdate(Math.min(boardCount + 1, 4))
  }

  const handleDecrement = () => {
    onUpdate(Math.max(boardCount - 1, 1))
  }

  return (
    <VStack spacing={6}>
      <Heading size="md" color="brand.primary">
        Number of Boards
      </Heading>

      <Box
        bg="brand.secondary"
        p={6}
        borderRadius="xl"
        w="full"
        maxW="400px"
      >
        <VStack spacing={4}>
          <HStack spacing={4} justify="center" w="full">
            <IconButton
              aria-label="Decrease boards"
              icon={<FaMinus />}
              onClick={handleDecrement}
              isDisabled={boardCount <= 1}
              colorScheme="red"
              size="lg"
            />
            <NumberInput
              value={boardCount}
              onChange={(_, value) => onUpdate(Math.min(Math.max(value, 1), 4))}
              min={1}
              max={4}
              size="lg"
              w="100px"
              textAlign="center"
            >
              <NumberInputField 
                textAlign="center" 
                fontSize="2xl"
                fontWeight="bold"
                color="brand.primary"
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <IconButton
              aria-label="Increase boards"
              icon={<FaPlus />}
              onClick={handleIncrement}
              isDisabled={boardCount >= 4}
              colorScheme="green"
              size="lg"
            />
          </HStack>

          <Text color="brand.text" textAlign="center">
            {boardCount === 1 ? (
              "Standard mode - Single board gameplay"
            ) : (
              "Challenger mode - Multi-board with promotions"
            )}
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
} 