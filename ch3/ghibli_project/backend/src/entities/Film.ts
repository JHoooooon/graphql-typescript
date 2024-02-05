import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Film {
  // Int 타입으로 변환
  // TS 에서 number 타입은 자동으로 Float 으로 변한다.
  // 이를 해결하기 위해 Int 를 명시적으로 선언한다.
  @Field(() => Int, { description: '영화 고유 아이디' })
  id: number;

  @Field({ description: '영화 제목' })
  title: string;

  @Field({ nullable: true, description: '영화 부제목' })
  subtitle?: string;

  @Field({ description: '영화 장르' })
  genre: string;

  @Field({ description: '영화 러닝 타임, minute' })
  runningTime: number;

  @Field({ description: '영화 줄거리 및 설명' })
  description: string;

  // Int 타입으로 변환
  // TS 에서 number 타입은 자동으로 Float 으로 변한다.
  // 이를 해결하기 위해 Int 를 명시적으로 선언한다.
  @Field(() => Int, { description: '제작자 고유 아이디' })
  director_id: number;

  @Field({ description: '포스터 이미지 URL' })
  posterImg: string;

  @Field({ description: '개봉일' })
  release: string;
}
