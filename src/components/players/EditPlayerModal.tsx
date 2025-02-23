import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
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
import { updatePlayer } from '../../store/slices/playerSlice'
import { Player } from '../../types/player'

interface EditPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  player: Player
}

export const EditPlayerModal = ({ isOpen, onClose, player }: EditPlayerModalProps) => {
  const [formData, setFormData] = React.useState(player)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const dispatch = useDispatch()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedPlayer = {
        ...player,
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        active: formData.active
      }
      
      dispatch(updatePlayer(updatedPlayer))
      
      toast({
        title: 'Player updated! 🎯',
        description: `${formData.name}'s details have been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error updating player 😢',
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
        <ModalHeader color="brand.primary">Edit Player 🎯</ModalHeader>
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="brand.text">Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.nickname || ''}
                onChange={handleChange}
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
                value={formData.email || ''}
                onChange={handleChange}
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
            loadingText="Updating..."
          >
            Update Player
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 