// Time to set the pace! ⏱️
import React from 'react'
import {
  VStack,
  Button,
  ButtonGroup,
  Text,
  Heading,
} from '@chakra-ui/react'

interface TimeSetupProps {
  roundTime: number
  onUpdate: (time: number) => void
}

const timeOptions = [
  { label: '10 sec', value: 10 }, // DEBUG OPTION - Remove in production!
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '20 min', value: 1200 },
]

export const TimeSetup = ({ roundTime, onUpdate }: TimeSetupProps) => {
  return (
    <VStack spacing={6}>
      <Heading size="md" color="brand.primary">
        Round Duration
      </Heading>

      <ButtonGroup spacing={4}>
        {timeOptions.map(option => (
          <Button
            key={option.value}
            colorScheme={roundTime === option.value ? 'teal' : 'gray'}
            onClick={() => onUpdate(option.value)}
            size="lg"
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      <Text color="brand.text">
        Each round will last {roundTime / 60} minutes
      </Text>
    </VStack>
  )
} 