// The sexiest stats you've ever seen! 📊
// Making those numbers go BRRRRR! 📈
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

interface AnimatedStatBoxProps {
  label: string
  value: number
  duration?: number
}

export const AnimatedStatBox = ({ label, value, duration = 2.5 }: AnimatedStatBoxProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300 }
      }}
    >
      <Box
        bg="brand.secondary"
        p={6}
        borderRadius="xl"
        boxShadow="lg"
        transition="all 0.3s"
        _hover={{
          boxShadow: "2xl",
          transform: "translateY(-2px)"
        }}
      >
        <VStack spacing={2}>
          <Text
            fontSize="4xl"
            fontWeight="bold"
            bgGradient="linear(to-r, brand.primary, brand.accent)"
            bgClip="text"
          >
            <CountUp 
              end={value} 
              duration={duration}
              separator=","
              useEasing={true}
            />
          </Text>
          <Text 
            color="brand.text" 
            fontSize="lg"
            opacity={0.9}
          >
            {label}
          </Text>
        </VStack>
      </Box>
    </motion.div>
  )
} 