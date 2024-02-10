import { FieldMergeFunction, FieldReadFunction } from '@apollo/client';
import { PagenatedFilms } from '../../generated/graphql';
import { KeyArgsFunction, KeySpecifier } from '@apollo/client/cache/inmemory/policies';

// FieldPolicyObj 인터페이스는 FieldMergeFunction 과 FieldReadFunction
// 타입을 가진 객체이다
interface FieldPolicyObj {
  keyArgs: KeySpecifier | KeyArgsFunction | false;
  merge?: FieldMergeFunction;
  read?: FieldReadFunction;
}

// PagenatedFilms 타입을 제네릭으로 받는 함수
export const filmsPagenatedFieldPolicy = <T extends PagenatedFilms>(): FieldPolicyObj => {
  return {
    // 페이지 네이션은
    // 특정 필드로 따로 캐시되어 저장될 필요가 없다
    keyArgs: false,
    // TypePolicy 에서 사용할 merge 함수
    merge(existing: T | undefined, incoming: T) {
      console.log(existing, incoming)
      return {
        cursor: incoming.cursor, // 다음 cursor
        films: existing ? [...existing.films, ...incoming.films] : incoming.films, // films 배열
      };
    },
  };
};
