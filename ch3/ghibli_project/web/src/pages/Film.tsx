import { Box, Spinner, Text } from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import useFilmQuery from '../common/hooks/queries/useFilmQuery';
import FilmDetail from '../components/film/FilmDetail';
import FilmCutList from '../components/film-cut/FilmCutList';

interface FilmPageParams {
  filmId: string;
  [key: string]: string | undefined;
}

const Film = () => {
  const { filmId } = useParams<FilmPageParams>();
  const { data, error, loading } = useFilmQuery({ filmId: parseInt(filmId as string) });
  return (
    <>
      {loading && <Spinner />}
      {error && <Text>페이지를 표시할 수 없습니다</Text>}
      <Box>
        {filmId && data?.film ? (
          <>
            <FilmDetail film={data.film} />
            <Box mt={12}>
              <FilmCutList filmId={data.film.id} />
            </Box>
          </>
        ) : (
          <Text>페이지를 표시할 수 없습니다.</Text>
        )}
      </Box>
    </>
  );
};

export default Film;
