// This file defines our kick-ass dark theme for the darts league app 🎯
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      background: '#0B0C10',
      secondary: '#1F2833',
      text: '#C5C6C7',
      primary: '#66FCF1',
      accent: '#45A29E',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.text',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'teal',
      },
    },
  },
}) 