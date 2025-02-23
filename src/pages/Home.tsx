import React from 'react'
// The most epic darts homepage you've ever fucking seen! 🎯
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUsers, FaGamepad, FaTrophy } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { IconType } from 'react-icons'
import { motion } from 'framer-motion'
import { ParticleBackground } from '../components/effects/ParticleBackground'
import { AnimatedStatBox } from '../components/stats/AnimatedStatBox'

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
  onClick: () => void;
}

const MotionBox = motion(Box)

const FeatureCard = ({ icon, title, description, onClick, delay }: FeatureCardProps & { delay: number }) => (
  <MotionBox
    bg="brand.secondary"
    p={6}
    borderRadius="xl"
    cursor="pointer"
    onClick={onClick}
    _hover={{ transform: 'scale(1.05)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <VStack spacing={4}>
      <Icon as={icon} boxSize={8} color="brand.primary" />
      <Text fontSize="xl" fontWeight="bold" color="brand.text">
        {title}
      </Text>
      <Text color="brand.text" textAlign="center">
        {description}
      </Text>
    </VStack>
  </MotionBox>
)

export const Home = () => {
  const navigate = useNavigate()

  return (
    <Box 
      position="relative" 
      minH="100vh"
      overflow="hidden"
      bg="brand.background"
    >
      <ParticleBackground />
      <Container 
        maxW="container.xl" 
        py={10} 
        position="relative"
        zIndex={1}
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={8} textAlign="center" mb={20}>
            <Heading
              size="2xl" 
              bgGradient="linear(to-r, brand.primary, brand.accent)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Welcome to Mighty Flights
            </Heading>
            <Text fontSize="2xl" color="brand.text">
              Ready to throw some fucking amazing darts? 🎯
            </Text>
          </VStack>
        </motion.div>

        {/* Feature Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={20}>
          <FeatureCard
            icon={FaGamepad}
            title="Quick Setup"
            description="Set up your game in seconds with our intuitive wizard"
            onClick={() => navigate('/setup')}
            delay={0.2}
          />
          <FeatureCard
            icon={FaUsers}
            title="Player Management"
            description="Manage your players and track their stats"
            onClick={() => navigate('/players')}
            delay={0.4}
          />
          <FeatureCard
            icon={FaTrophy}
            title="Leaderboard"
            description="Check out the season rankings"
            onClick={() => navigate('/leaderboard')}
            delay={0.6}
          />
        </SimpleGrid>

        {/* Stats Section */}
        <Box textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="xl" mb={10} color="brand.primary">
              League Statistics
            </Heading>
          </motion.div>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <AnimatedStatBox label="Total Games" value={420} />
            <AnimatedStatBox label="Active Players" value={69} />
            <AnimatedStatBox label="Doves Thrown" value={13} />
            <AnimatedStatBox label="Bullseyes" value={1337} />
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  )
} 