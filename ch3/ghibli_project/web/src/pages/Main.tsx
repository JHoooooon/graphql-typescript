import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import FilmList from '../components/film/FilmList'

const Main = () => {
  return (
    <Box>
      <Heading size='lg'>최고의 장면을 찾아보세요</Heading>
      <FilmList />
    </Box>
  )
}

export default Main