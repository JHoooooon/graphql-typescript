import { useQuery } from "@apollo/client";
import { gql } from "../../generated"
import { FilmsQueryVariables } from "../../generated/graphql";

const useFilmsQuery = (variables?: FilmsQueryVariables) => {
  const films = gql(`query Films($limit: Int, $cursor: Int) {\n  films(limit: $limit, cursor: $cursor) {\n    cursor\n    films {\n      id\n      title\n      subtitle\n      runningTime\n      director_id\n      release\n      director {\n        id\n        name\n      }\n      posterImg\n      description\n      genre\n    }\n  }\n}`);

  const { data, error, loading, fetchMore } = useQuery(films, { variables });
  return {data ,error, loading, fetchMore };
}

export default useFilmsQuery