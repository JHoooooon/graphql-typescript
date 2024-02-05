# GraphQL, 타입스크립트 생태계

> `GraphQL` 은 특정 데이터 소스에 종속되거나 특정 프로그래밍 언어에 국한되는  
> 기술이 아니다.
> `GraphQL` 은 다양한 언어로 만들어진 구현체를 어럿 가지고 있다.
>
> `GraphQL API` 서비스를 구성할때 취하는 접근 방식은 크게 두가지로 나뉜다.

## 스키마 주도 방식

`SDL`(`Schema Definition Language`) 로 `Schema` 를 먼저 구성한뒤, 그에 해당하는 리졸버를 개발하는 순서로 나아간다.

```ts
const typedefs = `

// Film 타입 정의
type Film {
  id: Int!
  title: String!
  director: Director!
}

// Director 타입 정의
type Director {
  id: Int!
  name: String!
}

// root Query 타입 정의
type Query {
  film(filmId: Int!): Film
  films(): [Film]
}

// input 타입 정의
input FilmInput {
  title: String!
  director: Director!
}

// root Mutation 타입 정의
type Mutation {
  createFilm(filmDTO: FilmInput): Film
}
`;
```

```ts
// resolver 함수 정의
const resolvers = {
  // Query resolver 함수
  Query: {
    // film 함수 정의
    film: (parent, args, context, info) => {
      // Film 에서 findOne 을 사용하여 찾은 film 데이터 리턴
      return Film.findOne(args.filmId);
    },
    films: (parent, args, cotnext, info) => {
      // Films 에서 모든 films 찾아서 리턴
      return Films.findAll();
    },
  },
  // 뮤테이션 resolver 함수 정의
  Mutation: {
    // createFilm 정의
    createFilm: async (parent, args, context, info) {
      // args 에서 title, director 구조분해할당
      const { title, director } = args;
      // newFilm 으로 생성된 film 반환
      const newFilm = await Films.create({
        title,
        director
      })
      // 반환된 film 을 save 하여 db 에생성
      await Films.save(newFilm);
      // 생성된 newFilm 반환
      return newFilm;
    },
  }
}


```

이에대한 장점과 단점을 다음처럼 알려준다.

**_장점_**

- 스키마 주도 개발 접근 방식은 `GraphQL` 개발 방식의 기본으로 간주
- 기본적은 `GraphQL` 문법을 그대로 활용할수 있어 편리
- `SDL` 은 그 자체로 의미를 가지므로, 숙련되지 않은 개발자 혹은 비개발자가 확인하여도 대부분 알아볼 수 있다
- 스키마 정의는 데이터 모델로서 프런트와 백엔드를 아우르는 모든 팀 구성원의 의사소통 도구로 사용될수 있다
- 스키마 정의는 `API` 문서의 역할을 할수 있다

**_단점_**

- 스키마 정의에는 리졸버가 포함되지 않는다. 따라서 `GraphQL` 서비스는 스키마 정의만  
  으로는 구현할 수 없다. 타입, 쿼리, 뮤테이션 등에 대한 리졸버 함수를 따로 구성해야 한다.

- 리졸버와 스키마간에 함수가 따로 구성되므로 이둘이 명확하게 일치한다는 보장이 없다.
  언제나 스키마와 리졸버 간 동기화에 대해 고민해야 한다

- 많은 기능을 가지는 서버의 경우 스키마가 하나의 방대한 덩어리가 된다. 이를 해결하기
  위한 기술을 따로 구성하여야 한다

- 스키마를 여러 파일에 나누어 모율화하는 작업이 코드 주도 접근법에 비해 상대적으로
  더 어렵다.

## 코드 주도 방식

코드 주도 개발 접근법에서는 `SDL` 로 스키마를 정의하지 않고 프로그래밍 언어로  
스키마를 구성한다.

`TypeGraphQL`

```ts
import { ObjectType, Field, Int } from "type-graphql";

// type Recipe {
//   id: Int!
//   title: String!
//   description: String
// }

@ObjectType()
export class Recipe {
  @Field((type) => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;
}
```

아래는 `Query` 와 `Mutation` 에 대한 `Resolver` 를 정의한다

`TypeGraphQL`

```ts
import { Recipe } from "./Recipe";
import { Resolver, Query, Mutation } from "type-graphql";

// resolver 클래스 생성
@Resolver(Recipe)
class RecipeResolver {
  constructor(private recipeService: RecipeService) {}

  @Query((returns) => Recipe)
  async recipe(@Arg("id") id: string) {
    // do something
  }

  @Mutation((returns) => Recipe)
  async addRecipe(
    @Arg("newRecipeData") newRecipeData: NewRecipeInput
  ): Promise<Recipe> {
    // do something
  }
}
```

개별 `Recipe` 를 조회하는 `recipe` 쿼리와 새로운 `Recipe` 를 등록하는
`addRecipe` 뮤테이션을 `@Query`, `@Mutation` 데커레이터를 통해 구성할 수 있다.

**_장점_**

- 코드 자동완성, 타입체크 등과 같은 `IDE` 기능과 데커레이터, 반복문 등 프로그래밍  
  언어의 기능을 사용하여 개발이 편리

- 스키마 변경은 리졸버 변경과 동일하게 따라가므로, 스키마와 리졸버를 동기화해줘야  
  하는 번거로움이 없이, 실수를 줄여준다.

**_단점_**

- 프레임워크 또는 라이브러리의 도움 없이 구현하기에는 시간이 많이 든다

- `JSON` 과 비슷한 `GraphQL SDL` 문법과는 동떨어진 형태로 작업이 진행된다.

## 데이터베이스

> `GraphQL` 은 어떤 특정 데이터베이스에 종속적이지 않다.
> `PostgreSQL`, `MySQL`, `DynamoDB`, `MongoDB`, `Elasticsearch` 등등 어떠한  
> 데이터베이스 서비스와도 함께 사용할 수 있다

### ORM

`ORM`(`Object Relational Mapping`) 은 프로그램상 객체와 데이터베이스의  
데이터를 매칭해주는 기술을 말한다.

여러가지가 있는데, 여기서는 `TypeORM` 과 코드 주도 접근을 구현해주는
`TypeGraphQL` 을 사용한다.

> 둘의 통합성이 높아서 사용하기 좋다고 한다.

이는 다음처럼 사용한다.

```ts
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
class Recipe extends BaseEntity {
  @Field((type) => Int)
  @PrimaryGenertatedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column()
  description?: string;
}
```

> `DB` 와 `GraphQL` 타입 정의는 하나의 파일에서 관리하는것이 효율적이다.

만약, `GraphQL API` 상 외부 노출이 안되는 컬럼은, `@Column` 만 명시하고,  
`@Field` 는 명시하지 않으면 된다.

```ts
@ObjectType()
@Entity()
class Recipe extends BaseEntity {
  @Field((type) => Int)
  @PrimaryGenertatedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column()
  description?: string;

  @Column()
  someSecertField: string;
}
```

선언된 `DB` 모델을 통해, `Resolver` 클래스에서 바로 데이터베이스 오브젝트로  
접근할 수 있다.

```ts
import { Resolver, Query, Mutation } from "type-graphql";
import { Recipe } from "./recipe";

// constructor 에 따로 class field 값으로 주지 않았는데
// 책에서는 this.Recipe 형식으로 접근한다
// 책의 오탈자인지는 봐야 하겠지만, 현재 내 생각으로는
// 이상해서 그냥 Recipe 을 사용해 db 를 사용한다.
@Resolver(Recipe)
class RecipeResolver {
  @Query((returns) => Recipe)
  async recipe(@Arg("id") id: number) {
    const recipe = await Recipe.findOne(id);
    return recipe;
  }

  @Mutation((returns) => Recipe)
  async addRecipe(
    @Arg("newRecipeData") newRecipeData: NewRecipeInput
  ): Promise<Recipe> {
    return Recipe.save({ data: newRecipeData });
  }
}
```

## GraphQL 클라이언트

`GraphQL` 클라이언트는 프런트엔드측에서 서버측으로 `GraphQL` 쿼리와  
뮤테이션등을 수비게 전송하고, 응답받은 데이터를 효율적으로 관리할 수 있도록  
돕는다.

`HTTP Cache` 를 활용하기 힘든 `GraphQL` 특성상 자체 캐시 스토어를 통해  
해결했다 이를 통해 서버와 통신하는 기능을 렌더링을 최소화할수 있도록  
하는 강력한 캐시기능을 제공한다.

대표적으로 `Reply`, `Apollo` 클라이언트, `Urql` 등이 있다

### `GraphQL` 클라이언트 없이 `GraphQL` 요청하기

`GraphQL` 클라이언트에 대해서 알아보기전에, 먼저 클라이언트 라이브러리 없이
`GrraphQL` 에 접근해보는 방식을 알아볼 필요가 있다.

> 책에서 아래는 실제 동작하지 않으며, `GraphQL` 이 `HTTP` 상 동작하는 점에 대한
> 이해를 돕기위한 의사 코드라 한다. 참고용이다.

```ts
async function fetchGraphQL(queryText: string, variables?: any) {
  const res = await fetch(`http://some-graphql-api.com/graphql`, {
    method: `POST`,
    headers: {
      Authrization: `bearer ${secerts.My_ACCESS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: queryText,
      variables,
    }),
  });
  return await res.json();
}

export default fetchGraphQL;
```

```tsx
import { setState, useEffect } from "React";
import fetchGraphQL from "./fetchGraphQL";

// graphQL query 문
const grpahqlDoc = `
  query User {
    users {
      name
    }
  }
`;

const App = () => {
  // query 의 결과를 저장하는 name state
  const [name, setName] = useState("");
  // 비동기로 인해 데이터를 받아오는 중임을 알리는 loading state
  const [loading, setLoading] = useState("");
  // 오류 발생시 err state
  const [error, setError] = useState("");

  // 컴포넌트 마운트 렌더링 이후에 최초실행
  useEffect(() => {
    // async 함수를 사용하기 위해 IIFE 사용
    (async () => {
      // setLoading 에 true 할당
      // 이는 로딩중임을 나타냄
      setLoading(true);
      // 이상없을시 try 실행 아니면 catch 실행
      try {
        // data 를 구조분해할당
        const { data } = await fetchGraphQL(graphqlDoc);
        // 로딩이 완료되었으므로 false 할당
        setLoading(false);
        // 받은 데이터를 setName 에 할당
        setName(data);
      } catch (err) {
        // error 발생시 로딩이 완료되었으므로 false 할다아
        setLoading(false);
        // error.message 를 할당
        setError(err.message);
        // 콘솔을 출력
        console.error(err);
      }
    })();
  }, []);

  // loading 중일때 리턴
  if (loading) return "Loading...";
  // loading 이 false 이고 name 이 할당되지 않았으며, error 가 존재하면
  // error 값 리턴
  if (!loading && !name && error) return <span>{error}</span>;
  // 그외에는 제대로 처리되었으니, name 값 리턴
  return (
    <div className="app">
      <p>{name}</p>
    </div>
  );
};
```

이는 `react-query` 의 동작과 비슷한 점이 있다
대략 `GraphQL` 요청 함수에 대한 데이터 요청에 대한 원리를 설명하기 위해서는
적합해 보인다.

먼저 책에서는 `HTTP` 캐싱 기능을 활용할수 없으며, 내부적인 캐시 로직이 없어
비효율적인 요청이 지속된다고 한다.

> `HTTP` 캐싱이란?
>
> 이전에 가져온 리소스들을 재사용함으로써 성능을 향상시키는 `HTTP` 에 구현된
> 방식을 말한다.
>
> 이를 보통 `web cache` 라고도 하는데, `latency`(`대기시간`) 및 `Network Traffic` 을
> 줄여줌으로써 리소스를 보여주는데 필요한 시간을 단축시켜준다.
>
> 이를 처리하기 위해 리소스의 복사본을 저장하고 있다가 요청시에 그것을 제공하는
> 방법으로 이를 처리한다.
> 만약 `web cache` 가 자신의 저장소내에 요청한 리소스를 가지고 있다면, 요청을
> 가로채 원래의 서버로 부터 리소스를 다시 다운로드하는 대신, 리소스의 복사본을
> 반환한다.
>
> 이는 서버의 부하를 완하하고, 클라이언트에 더 가까이(`server 보다 더 가까운곳에 저장소를 둔다.`) 있으므로 성능이 향상된다.
>
> 이는 `resource` 가 변하기전까지는 기존의 `resource` 를 반환한다고 보면 된ㄷ다.
> 캐시는 크게 `private` 와 `shared` 캐시 두가지로 분류된다.
>
> - `shared` 캐시는 한명 이상의 사용자가 재사용할 수 있도록 응답을 저장하는 캐시를
>   말한다.
>   흔히 여러 사용자들에 의해 재사용되는 `resource` 을 저장하는 것이다.
>   `ISP` 상에서 많은 사용자들을 서비스하기 위해 지역 네트쿼크 기반의 일부분으로서
>   웹 프록시를 설치해두었다고 하자, 이로 인해, 조회가 많이 되는 리소스들은 몇번이고
>   재사용되므로, 네트워크 트래픽과 레이턴시를 줄여준다.
>
> - `private` 캐시는 한명의 사용자만 사용하는 캐시를 말한다.
>   이는 `Browser` 상의 `chaching` 으로 사용되는것이 대표적이다.
>   브라우저 캐시는 사용자에 의하여 `HTTP` 를 통해 다운로드된 모든 문서를 가진다.
>   이 캐시는 서버에 대한 추가적인 요청 없이 뒤로가기나 앞으로 가기, 저장, 소스보기등  
>   을 위해 방문했던 문서들을 사용할 수 있도록 해준다.
>
> `HTTP` 캐싱은 선택적이지만, 캐시된 리소스를 재사용하는것은 보통 바람직한 일이다.
> 하지만 `HTTP` 캐시들은 일반적으로 `GET` 에 대한 응답만을 캐싱하며, 다른 메서드들
> 은 제외될 것이다.
> `primary cache key` 는 요청 메서드 그리고 대상 `URI` 로 구성된다.
> 일반적인 캐싱 엔트리의 형태는 다음과 같다
>
> - **검색(`retrieval`) 요청의 성공적인 결과** :
>   `HTML` 문서, 이미지 혹은 파일과 같은 리소스를 포함하는 `GET` 요청에 대한
>   `200` 응답
>
> - **영구적인 리다이렉트** :
>   `301` 응답
>
> - **오류응답** :
>   `404` 응답
>
> - **완전하지 않은 결과** :
>   `206` (`Partial Content`)응답
>
> - **캐시키로 사용하기 적절한 무언가가 정의된 경우의 `GET` 이외의 응답**
>
> 캐시 앤트리는 요청의 컨텐츠 혐상(`Content Negotiation`)의 대상인 경우, 두번째 키에 의해 구별되는 여러개의 저장된 응답들로 구성될 수 있다.

위의 내용을 보면 `HTTP` 캐싱 같은 경우에 `resource` 에 대한 변화를 이야기 한다.
이는 `grpahQL` 특성상 쿼리문으로 인해 동적일수 있으므로 캐시하는 시점과
무효화해야 하는 시점을 결정하기 어렵다는 점으로 말하는듯 하다.

`GraphQL` 클라이언트들은 이런 문제를 해결하기 위한 목적으로 설계되었다고 한다.
다음은 제공하는 기능들이다.

- 원격 데이터 관리 캐시 시스템
- 동일한 요청의 반복 제거
- 만료된 데이터 재요청
- `React`, `Vue` 등 프런트엔드 라이브러리를 위한 `Hook` 및 바인딩 제공
- 파일 업로드 기능 제공
- 요청 실패시 재요청 기능
- 개발 편의를 위한 `DevTools`

## GraphQL 클라이언트의 캐시 방법

`REST` 의 경우, 각 리소스는 엔드포인트에 따라 명확히 구분할 수 있다.
엔드포인트는 고유한 식별자로 사용되어 `HTTP` 캐싱을 통해 동일한 데이터인지
식별 가능하도록 한다.

이를 통해 캐시를 사용할지, 새로운 데이터를 사용할지 쉽게 판단할수 있다
하지만 `GraphQL` 은 단일 엔드포인트를 통해 제공되며 요청 객체의 쿼리스트링이나
바디 데이터를 통해 리소스를 구분하므로, 고유 엔드포인트만으로는 개시 여부를
식별하기 쉽지 않다.

이를 해결하기 위해 두가지 방법을 사용한다

**_문서캐시_**

문서 캐싱 방식에서 캐시의 키로 사용되는 값은 `query` 문자열과 `variables` 인자이다
단순하게 표현하면 `query{user{name}}:1` 과 같은 키를 생성하고, 해당 키에 해당하는
응답값을 매치하여 캐시로 구성한다.

캐시의 최신화는 `__typename` 메타필드를 확인하여 실행한다
이는 `__typename` 을 가진 `mutation` 이 발생할 경우, 업데이트가 필요한 상태로
인지한다.이후 캐시에서 만료된정보를 제거한후 새롭게 호출하는 방식이다.

이를 통해 해당 캐시된 정보에 대한 최신화가 이루어진다.
정적 컨텐츠에 의존하는 사이트와 같은 경우에는 문서 캐싱방법으로도 충분하다.

하지만 앱이 복잡해짐에 따라, 관리하는 데이터와 상태가 매우 복잡해지므로,
데이터 간 상호관계 및 종속성에 따른 새로운 캐시 방법이 필요하다.

**_정규화된 캐시_**

이 방법은 문서 내의 쿼리로 부터 내려오는 모든 타입에 대한 캐시를 따로
정규화하여 저장한다.

> 정규화란? 각 타입별 데이터를 전체 데이터로 부터 떼어내어, 단일 층에서 존재하도록
> 만드는 과정을 의미한다. 정규화는 `타입`, `키`, `관계`를 기반으로 진행되며, 쿼리 문서의 모든 내용을 참조한다.

해당 내용은 좀더 살펴보는게 좋을듯 싶다

## DataLoader

흔히 `N + 1` 이라는 문제는 `GraphQL` 과 `ORM` 을 사용할때 발생하는 문제이다.

```ts
const typeDefs = gql`
  type Query {
    human(id: ID!): Human
  }

  type Human {
    name: String
    appearsIn: [Episode]
    starships: [Starship]
  }

  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
  }

  type Starship {
    name: String
  }
`;
```

```ts
const reolver = {
  Query: {
    async human(obj, args, context, info) {
      // 오직 한번만 쿼리한다
      const human = await context.db.FindHumanById(args.id);
      return new Human(human);
    },
  },
  Human: {
    startships(obj, args, context, info) {
      // 배열로 각 starship 을 N 번 쿼리한다.
      return obj.starshipIDs.map( id => context.db
        .loadStarshipByID(id).then(shipData => new Starship(shipData));
    },
  },
};
```

```gql
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
```

이는 다음과 같이 `ORM` 에서 다음과 같이 쿼리된다.

```sql

select * from Human where id = ?; -- 1회
select * from Starship where id = ?; -- n회

```

`resolver` 함수에 의해 처음에 `human` 에 대한 `query` 가 이루어지고,
이후, `posts` 에 대한 `query` 가 반복되서 호출된다.

그리고 이를 합친 내용을 `query` 로써 클라이언트에게 보내는 로직이다.
이는 `resolver` 와 `ORM` 특성상 각각 따로 처리되는 부분이므로 어쩔수 없는 부분이다.

만약 이를 쿼리로 처리하고 싶다면, 간단하게, `where in (...)` 방식을 사용하거나
`join` 을 사용하여, `query` 하는 방법으로도 가능하다 말한다.

하지만, 이는 `ORM` 에서 사용가능한 문법을 하용하기 보다는, `SQL` 에
더 의존한 기법인듯하다...

> 물론, `TypeORM` 같은경우 `QueryBuilder` 를제공하므로, 자유롭게 처리가능하다.

이에대한 해법으로, 한번에 처리가능하도록 `Batching(일괄처리)` 및 캐싱 기능을 포함한
라이브러리인 `DataLoader` 가 있다.

이는 리졸버 수정없이 `N + 1` 을 해결해준다.

> 동작원리는 `tick` 으로 실행되며, `key` 로 받은 데이터 요청을 일괄로 처리해주는
라이브러리다.
>
> 이는 리졸버를 따로 수정할필요없이 `N + 1` 문제를 해결해준다.
