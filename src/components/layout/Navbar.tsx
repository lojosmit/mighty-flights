// The navigation bar of champions! 🏆
import React from 'react'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FaHome, FaUsers, FaGamepad, FaTrophy, FaBars } from 'react-icons/fa'

export const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()

  const links = [
    { name: 'Home', to: '/', icon: <FaHome /> },
    { name: 'Players', to: '/players', icon: <FaUsers /> },
    { name: 'New Game', to: '/setup', icon: <FaGamepad /> },
    { name: 'Leaderboard', to: '/leaderboard', icon: <FaTrophy /> },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <Box bg="brand.secondary" px={4} position="sticky" top={0} zIndex={100}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Box 
            as={RouterLink} 
            to="/" 
            color="brand.primary" 
            fontWeight="bold" 
            fontSize="xl"
          >
            Mighty Flights 🎯
          </Box>
        </HStack>

        {/* Desktop Navigation */}
        <HStack
          as="nav"
          spacing={4}
          display={{ base: 'none', md: 'flex' }}
        >
          {links.map((link) => (
            <Button
              key={link.name}
              as={RouterLink}
              to={link.to}
              leftIcon={link.icon}
              variant={isActive(link.to) ? 'solid' : 'ghost'}
              colorScheme={isActive(link.to) ? 'teal' : 'gray'}
              size="sm"
            >
              {link.name}
            </Button>
          ))}
        </HStack>

        {/* Mobile Navigation */}
        <Box display={{ base: 'block', md: 'none' }}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Open menu"
              icon={<FaBars />}
              variant="ghost"
            />
            <MenuList bg="brand.secondary">
              {links.map((link) => (
                <MenuItem
                  key={link.name}
                  as={RouterLink}
                  to={link.to}
                  icon={link.icon}
                  bg={isActive(link.to) ? 'whiteAlpha.200' : 'transparent'}
                  _hover={{ bg: 'whiteAlpha.300' }}
                >
                  {link.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  )
} 