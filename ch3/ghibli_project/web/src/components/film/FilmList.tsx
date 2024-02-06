import { Box, SimpleGrid, Skeleton } from '@chakra-ui/react';
import useFilmsQuery from '../../hooks/queries/useFilmsQuery';
import FilmCard from './FilmCard';
import Scroller from '../common/scroller';

export default function FilmList() {
  const LIMIT = 6;
  const { data, loading, error } = useFilmsQuery({
    cursor: 1,
    limit: LIMIT,
  });

  if (loading) return <p>...loading</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <Scroller>
      <SimpleGrid columns={[2, null, 3]} spacing={[2, null, 10]}>
        {loading && new Array(6).fill(0).map((x) => <Skeleton key={x} height="400px" />)}
        {!loading &&
          data &&
          data.films.films.map((film) => (
            <Box key={film.id}>
              <FilmCard film={film} />
            </Box>
          ))}
      </SimpleGrid>
    </Scroller>
  );
}
