import { Query, Resolver } from 'type-graphql';
import { Film } from '../entities/Film';
import ghibliData from '../data/ghibli';

// @Resolver 데커레이터를 사용
@Resolver(Film)
export class FilmResolver {
  // @Query 데커레이터를 사용하여
  // 쿼리 가능하게 변경
  @Query(() => [Film])
  films(): Film[] {
    return ghibliData.films;
  }
}
