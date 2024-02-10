import { BackgroundProps, Box, Flex } from '@chakra-ui/react'
import Navbar from './nav/Navbar'

interface CommonLayoutProps {
  bg?: BackgroundProps['bg'],
  children: React.ReactNode,
}

const CommonLayout = ({ children, bg }: CommonLayoutProps) => {
  return (
    <div>
      <Flex>
        <Navbar/>
      </Flex>
      <Box
        px={{ base: 4 }}
        pt={24}
        mx="auto"
        maxW="940px"
        minH="100vh"
        w="100%"
        bg={bg}
      >
        {children}
      </Box>
    </div>
  )
}

export default CommonLayout