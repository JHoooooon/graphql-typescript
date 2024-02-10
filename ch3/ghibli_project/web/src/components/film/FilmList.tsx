import { Box, SimpleGrid, Skeleton } from '@chakra-ui/react';
import FilmCard from './FilmCard';
import Scroller from '../common/scroller';
import { useCallback } from 'react';
import useFilmsQuery from '../../common/hooks/queries/useFilmsQuery';

export default function FilmList() {
  // 패칭할 데이터 LIMIT 
  const LIMIT = 6;
  // films 쿼리
  const { data, loading, error, fetchMore } = useFilmsQuery({
    cursor: 1,
    limit: LIMIT,
  });

  // Scroller 의 onEnter 함수 
  const onEnter = useCallback(() => {
    if (data) {
      // fetchMore 실행
      fetchMore({
        variables: {
          limit: LIMIT,
          cursor: data.films.cursor,
        },
      });
    }
  }, [data, fetchMore]);

  if (loading) return <p>...loading</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <Scroller onEnter={onEnter} isLoading={loading} lastCursor={data?.films.cursor}>
      <SimpleGrid columns={[2, null, 3]} spacing={[2, null, 10]}>
        {loading && new Array(LIMIT).fill(0).map((x) => <Skeleton key={x} height="400px" />)}
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
