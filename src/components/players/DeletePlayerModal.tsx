// The saddest modal in the app 😢
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { deletePlayer } from '../../store/slices/playerSlice'

interface DeletePlayerModalProps {
  isOpen: boolean
  onClose: () => void
  playerId: string
  playerName: string
}

export const DeletePlayerModal = ({ isOpen, onClose, playerId, playerName }: DeletePlayerModalProps) => {
  const dispatch = useDispatch()
  const toast = useToast()

  const handleDelete = () => {
    try {
      dispatch(deletePlayer(playerId))
      toast({
        title: 'Player deleted! 👋',
        description: `${playerName} has been removed from the league.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error deleting player 😢',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="brand.secondary">
        <ModalHeader color="red.400">Delete Player 😢</ModalHeader>
        
        <ModalBody>
          <VStack spacing={4}>
            <Text color="brand.text">
              Are you sure you want to delete <Text as="span" color="brand.primary" fontWeight="bold">{playerName}</Text>?
            </Text>
            <Text color="brand.text" fontSize="sm">
              This action cannot be undone. All their stats and records will be permanently deleted.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            _hover={{ bg: 'red.600' }}
          >
            Delete Player
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 