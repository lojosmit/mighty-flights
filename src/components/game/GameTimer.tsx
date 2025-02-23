// The sexiest countdown timer you've ever seen! ⏱️
import React from 'react'
import {
  Box,
  Text,
  IconButton,
  HStack,
  useBoolean,
  Portal,
  useToast,
} from '@chakra-ui/react'
import { 
  FaPlay, 
  FaPause, 
  FaRedo,
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface GameTimerProps {
  initialTime?: number // in seconds
  autoStart?: boolean
  timerRef?: React.RefObject<{
    pause: () => void
    start: () => void
    reset: () => void
  }>
}

export const GameTimer = ({ initialTime = 300, autoStart = false, timerRef }: GameTimerProps) => {
  const [time, setTime] = React.useState(initialTime)
  const [isRunning, setIsRunning] = useBoolean(false)
  const [isFullscreen, setIsFullscreen] = useBoolean(false)
  const [isAudioLoaded, setIsAudioLoaded] = useBoolean(false)
  const hornSound = React.useRef<HTMLAudioElement | null>(null)
  const toast = useToast()

  // Expose timer controls through ref
  React.useImperativeHandle(timerRef, () => ({
    pause: () => setIsRunning.off(),
    start: () => setIsRunning.on(),
    reset: () => {
      setIsRunning.off()
      setTime(initialTime)
    }
  }), [setIsRunning, initialTime])

  // Auto-start timer if prop is true
  React.useEffect(() => {
    if (autoStart) {
      setIsRunning.on()
    }
  }, [autoStart])

  // Initialize audio with error handling
  React.useEffect(() => {
    try {
      hornSound.current = new Audio('/sounds/horn.mp3')
      hornSound.current.addEventListener('canplaythrough', () => {
        setIsAudioLoaded.on()
      })
      hornSound.current.addEventListener('error', (e) => {
        console.warn('Audio failed to load:', e)
        setIsAudioLoaded.off()
      })
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      setIsAudioLoaded.off()
    }

    return () => {
      if (hornSound.current) {
        hornSound.current.removeEventListener('canplaythrough', () => {})
        hornSound.current.removeEventListener('error', () => {})
      }
    }
  }, [])

  // Play sound with error handling
  const playEndSound = async () => {
    if (!hornSound.current || !isAudioLoaded) {
      toast({
        title: "⏰ Time's Up!",
        description: "Sound effect unavailable",
        status: "warning",
        duration: 2000,
      })
      return
    }

    try {
      await hornSound.current.play()
    } catch (error) {
      console.warn('Failed to play sound:', error)
      toast({
        title: "⏰ Time's Up!",
        description: "HORN HORN HORN! 📢",
        status: "info",
        duration: 2000,
      })
    }
  }

  React.useEffect(() => {
    let interval: number | undefined
    if (isRunning && time > 0) {
      interval = window.setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            setIsRunning.off()
            playEndSound()
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => window.clearInterval(interval)
  }, [isRunning, time])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleReset = () => {
    setIsRunning.off()
    setTime(initialTime)
  }

  const TimerDisplay = () => (
    <Box
      bg="brand.secondary"
      p={isFullscreen ? 20 : 6}
      borderRadius="xl"
      position="relative"
      cursor="pointer"
      onClick={() => setIsFullscreen.toggle()}
      transition="all 0.3s"
      _hover={{ transform: 'scale(1.02)' }}
    >
      <Text 
        fontSize={isFullscreen ? "15rem" : "4rem"}
        fontFamily="monospace"
        fontWeight="bold"
        color={time <= 30 ? "red.400" : "brand.primary"}
        textAlign="center"
        sx={{
          WebkitTextStroke: isFullscreen ? "2px black" : "none"
        }}
      >
        {formatTime(time)}
      </Text>

      <HStack 
        spacing={4} 
        justify="center" 
        mt={4}
        opacity={0.8}
        transition="opacity 0.2s"
        _hover={{ opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          aria-label={isRunning ? "Pause" : "Play"}
          icon={isRunning ? <FaPause /> : <FaPlay />}
          onClick={() => isRunning ? setIsRunning.off() : setIsRunning.on()}
          colorScheme={isRunning ? "red" : "green"}
          size={isFullscreen ? "lg" : "md"}
        />
        <IconButton
          aria-label="Reset"
          icon={<FaRedo />}
          onClick={handleReset}
          colorScheme="yellow"
          size={isFullscreen ? "lg" : "md"}
        />
      </HStack>
    </Box>
  )

  return (
    <AnimatePresence>
      {isFullscreen ? (
        <Portal>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <TimerDisplay />
          </motion.div>
        </Portal>
      ) : (
        <TimerDisplay />
      )}
    </AnimatePresence>
  )
} 