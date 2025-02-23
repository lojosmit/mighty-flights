// Round setup - let's set the pace! 🎯
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

interface RoundSetupProps {
  roundCount: number
  onUpdate: (count: number) => void
}

export const RoundSetup = ({ roundCount, onUpdate }: RoundSetupProps) => {
  const handleIncrement = () => {
    onUpdate(Math.min(roundCount + 1, 20))
  }

  const handleDecrement = () => {
    onUpdate(Math.max(roundCount - 1, 1))
  }

  return (
    <VStack spacing={6}>
      <Heading size="md" color="brand.primary">
        Number of Rounds
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
              aria-label="Decrease rounds"
              icon={<FaMinus />}
              onClick={handleDecrement}
              isDisabled={roundCount <= 1}
              colorScheme="red"
              size="lg"
            />
            <NumberInput
              value={roundCount}
              onChange={(_, value) => onUpdate(Math.min(Math.max(value, 1), 20))}
              min={1}
              max={20}
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
              aria-label="Increase rounds"
              icon={<FaPlus />}
              onClick={handleIncrement}
              isDisabled={roundCount >= 20}
              colorScheme="green"
              size="lg"
            />
          </HStack>

          <Text color="brand.text" textAlign="center">
            {roundCount === 1 ? (
              "Quick game - Single round"
            ) : (
              `${roundCount} rounds - Let's make it count! 🔥`
            )}
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
} 