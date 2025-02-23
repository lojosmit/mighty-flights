import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
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
    global: (props: any) => ({
      body: {
        bg: 'brand.background',
        color: 'brand.text',
      },
    }),
  },
}) 