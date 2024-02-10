import { useQuery } from '@apollo/client';
import { gql } from '../../../generated';
import { FilmQueryVariables } from '../../../generated/graphql';

const useFilmQuery = (variables: FilmQueryVariables) => {
  const film = gql(
    `query film($filmId: Int!) {\n  film(filmId: $filmId) {\n    id\n    title\n    subtitle\n    description\n    genre\n    runningTime\n    posterImg\n    release\n    director {\n      id\n      name\n    }\n  }\n}`,
  );

  const { data, error, loading } = useQuery(film, { variables });
  return { data, error, loading };
};

export default useFilmQuery;
