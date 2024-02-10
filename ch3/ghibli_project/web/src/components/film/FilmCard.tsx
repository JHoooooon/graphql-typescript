import {
  AspectRatio,
  Box,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Film } from '../../generated/graphql';
import { Link } from 'react-router-dom';

interface FilmCardProps {
  film: Film;
}

const FilmCard = ({ film }: FilmCardProps) => {
  return (
    <LinkBox as="article" my={6}>
      <Box maxW="300px" w="full" rounded="md" px={{ base: 1, md: 3 }} pt={3} overflow="hidden">
        <AspectRatio ratio={2 / 3}>
          <Image src={film.posterImg} />
        </AspectRatio>
      </Box>
      <Stack mt={2}>
        <LinkOverlay as={Link} to={`/film/${film.id}`}>
          <Heading color={useColorModeValue('gray.700', 'white')} fontSize={'xl'} fontFamily={'body'}>
            {film.title}
          </Heading>
        </LinkOverlay>
        <Text fontSize="sm" color="gray.500" isTruncated>
          {film.subtitle ? film.subtitle : <>&nbsp;</>}
        </Text>
      </Stack>
      <Stack spacing={0} fontSize={'sm'} mt={2}>
        <Text
          as="time"
          dateTime={film.release}
          isTruncated
          color={'gray.500'}
        >{`${film.release} . ${film.runningTime} 분`}</Text>
        <Text isTruncated>{film.director.name}</Text>
      </Stack>
    </LinkBox>
  );
};

export default FilmCard;
