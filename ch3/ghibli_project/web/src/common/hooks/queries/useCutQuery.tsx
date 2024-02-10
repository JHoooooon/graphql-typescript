import { gql } from '../../../generated'
import { useQuery } from '@apollo/client';
import { CutsQueryVariables } from '../../../generated/graphql';

const useCutQuery = (variables: CutsQueryVariables) => {
  const cuts = gql(`query cuts($filmId: Int!) {\n  cuts(filmId: $filmId) {\n    id\n    src\n  }\n}`);

  const { data, error, loading, fetchMore } = useQuery(cuts, { variables })

  return { data, error, loading, fetchMore }
}

export default useCutQuery