import { Arg, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { Film } from '../entities/Film';
import ghibliData from '../data/ghibli';
import { Director } from '../entities/Director';

@ObjectType()
class PagenatedFilms {
  @Field(() => [Film])
  films: Film[];

  @Field(() => Int, { nullable: true })
  cursor?: Film['id'] | null;
}

// @Resolver 데커레이터를 사용
@Resolver(Film)
export class FilmResolver {
  // @Query 데커레이터를 사용하여
  // 쿼리 가능하게 변경
  @Query(() => PagenatedFilms)
  films(
    @Arg('limit', () => Int, { nullable: true, defaultValue: 6 }) limit: number,
    @Arg('cursor', () => Int, { nullable: true, defaultValue: 1 }) cursor: Film['id'],
  ): PagenatedFilms {
    // limit 값이 최소 6 임을 고정
    const realLimit = Math.min(6, limit);

    // cursor 값이 없다면 films 에 빈배열 반환
    if (!cursor) return { films: [] };

    // cursor index 를 가진 films 의 index 를 찾기
    const cursorDataIndex = ghibliData.films.findIndex((f) => f.id === cursor);

    // cursorDataIndex 가 -1 이라면 빈배열 반환
    if (cursorDataIndex === -1) {
      return { films: [] };
    }

    // 데이터를 자르고 result 에 할당
    const result = ghibliData.films.slice(cursorDataIndex, cursorDataIndex + realLimit);

    // 다음 커서가 있는지 확인
    const nextCursor = result[result.length - 1].id + 1;
    const hasNext = ghibliData.films.findIndex((f) => f.id === nextCursor) > -1;

    return {
      cursor: hasNext ? nextCursor : null,
      films: result,
    };
  }

  @FieldResolver(() => Director)
  director(@Root() parentFilm: Film): Director | undefined {
    return ghibliData.directors.find((dr) => dr.id === parentFilm.director_id);
  }

  @Query(() => Film, { nullable: true })
  film(@Arg('filmId', () => Int) filmId: number): Film | undefined {
    return ghibliData.films.find((x) => x.id === filmId);
  }
}
