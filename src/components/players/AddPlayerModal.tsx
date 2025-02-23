import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Switch,
  useToast,
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { addPlayer } from '../../store/slices/playerSlice'
import { v4 as uuidv4 } from 'uuid' // We'll need to install this

interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PlayerFormData {
  name: string
  nickname: string
  email: string
  active: boolean
}

const initialFormData: PlayerFormData = {
  name: '',
  nickname: '',
  email: '',
  active: true,
}

export const AddPlayerModal = ({ isOpen, onClose }: AddPlayerModalProps) => {
  const [formData, setFormData] = React.useState<PlayerFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const dispatch = useDispatch()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create new player with unique ID
      const newPlayer = {
        id: uuidv4(),
        ...formData,
      }

      dispatch(addPlayer(newPlayer))

      toast({
        title: 'Player added! 🎯',
        description: `${formData.name} is ready to throw some darts!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Reset form and close modal
      setFormData(initialFormData)
      onClose()
    } catch (error) {
      toast({
        title: 'Error adding player 😢',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="brand.secondary" as="form" onSubmit={handleSubmit}>
        <ModalHeader color="brand.primary">Add New Player 🎯</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color="brand.text">Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                bg="whiteAlpha.100"
                border="none"
                _focus={{ 
                  boxShadow: "0 0 0 2px #66FCF1",
                  bg: "whiteAlpha.200" 
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.text">Nickname</FormLabel>
              <Input
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="Triple Twenty Terror"
                bg="whiteAlpha.100"
                border="none"
                _focus={{ 
                  boxShadow: "0 0 0 2px #66FCF1",
                  bg: "whiteAlpha.200" 
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.text">Email (Optional)</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                bg="whiteAlpha.100"
                border="none"
                _focus={{ 
                  boxShadow: "0 0 0 2px #66FCF1",
                  bg: "whiteAlpha.200" 
                }}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel color="brand.text" mb="0">
                Active Player
              </FormLabel>
              <Switch
                name="active"
                isChecked={formData.active}
                onChange={handleChange}
                colorScheme="teal"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="teal"
            isLoading={isSubmitting}
            loadingText="Adding..."
          >
            Add Player
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 