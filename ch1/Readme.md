# GraphQL 사용하기

> 관계형 데이터베이스를 조작하는 쿼리 언어인 `SQL` 에서는 `CRUD` 가 차례대로  
> `INSERT`, `SELECT`, `UPDATE`, `DELETE` 에 해당한다.
>
> `REST API` 에서는 차례대로 `POST`, `GET`, `PUT(PATCH)`, `DELETE` 의
> `HTTP` 메서드를 통해 데이터에 대한 조작 정보를 표현한다.
>
> 그러나 `GraphQL` 에서는 쿼리와 뮤테이션 타입이 `CRUD` 데이터 조작에 대한 정보를  
> 나타낸다.

## 쿼리

`GraphQL` 은 리졸버를 통해 어떠한 데이터 소스라도 함께 사용할 수 있도록  
설계 되어있다

> 따라서, 기존 `API` 서비스를 `GraphQL` 로도 제공할수 있다.

책에서는 설명을 위해 `SpaceX GraphQL` 을 사용한다.

```gql
query {
  launches {
    mission_name
    launch_year
    launch_date_utc
  }
}
```

`SpaceX` 의 `launches` 데이터중 `mission_name`, `launch_year`,
`launch_date_utc` 필드를 쿼리한다.

```json

{
  "data": {
    "launches": [
      {
        "mission_name": "FalconSat",
        "launch_year": "2006",
        "launch_date_utc": "2006-03-24T22:30:00.000Z"
      },
      ...
    ]
  }
}

```

이처럼 출력된다.
이후, `rocket.rocket_name` 필드가 필요하면 다음처럼 추가적 작성도 가능하다

```gql
query {
  launches {
    mission_name
    launch_year
    launch_date_utc
    rocket {
      rocket_name
    }
  }
}
```

```json

{
  "data": {
    "launches": [
      {
        "mission_name": "FalconSat",
        "launch_year": "2006",
        "launch_date_utc": "2006-03-24T22:30:00.000Z",
        "rocket": {
          "rocket_name": "Falcon 1"
        }
      },
      ...
    ],
  }
}

```

다음처럼 `client` 에서 `query` 문을 통해 데이터를 쉽게 쿼리 가능하다.

## 인자와 변수

데이터중 3개만 요청하기 위해서는 `인자` 값을 사용한다.

```gql
query fincThreeLaunches {
  launches(limit: 3) {
    mission_name
    launch_year
    launch_date_utc
    rocket {
      rocket_name
    }
  }
}
```

```json
{
  "data": {
    "launches": [
      {
        "mission_name": "FalconSat",
        "launch_year": "2006",
        "launch_date_utc": "2006-03-24T22:30:00.000Z",
        "rocket": {
          "rocket_name": "Falcon 1"
        }
      },
      {
        "mission_name": "DemoSat",
        "launch_year": "2007",
        "launch_date_utc": "2007-03-21T01:10:00.000Z",
        "rocket": {
          "rocket_name": "Falcon 1"
        }
      },
      {
        "mission_name": "Trailblazer",
        "launch_year": "2008",
        "launch_date_utc": "2008-08-03T03:34:00.000Z",
        "rocket": {
          "rocket_name": "Falcon 1"
        }
      }
    ]
  }
}
```

쿼리 인자를 사용하여 `limit` 값을 지정할 수 있다.
위의 `launches` 의 인자값은 다음과 같다.

```ts

Query.launches(
find: LaunchFind,  // LaunchFind type 을 통해 launches 를 찾는다
limit: Int, // 제한 갯수
offset: Int,  // offset 갯수
order: String, // order 값
sort: String // sort 값
): [Launch] // Launch 배열 반환

```

이러한 인자값은 하드코딩하기 보다는 `변수` 를 사용하여 동적으로 변경하기가  
좋다.

```gql

query findThreeLaunchs($limit: Int = 5) {
  launches(limit: $limit) {
    mission_name
    launch_year
  }
}

--- variables ---

{
  "limit": 3
}

```

```json
{
  "data": {
    "launches": [
      {
        "mission_name": "FalconSat",
        "launch_year": "2006"
      },
      {
        "mission_name": "DemoSat",
        "launch_year": "2007"
      },
      {
        "mission_name": "Trailblazer",
        "launch_year": "2008"
      }
    ]
  }
}
```

`limit: Int = 5` 는 `default` 값으로 `5` 를 준다.
이말은 `limit: 3` 을 주지 않으면 `5` 개를 기본값으로 출력하는것이다.

```gql

query findThreeLaunchs($limit: Int = 5) {
  launches(limit: $limit) {
    mission_name
    launch_year
  }
}

--- variables ---

{ } // 변수값을 아무것도 주지 않았다
```

```json
// 5 개가 출력되는것을 볼 수 있다.
{
  "data": {
    "launches": [
      {
        "mission_name": "FalconSat",
        "launch_year": "2006"
      },
      {
        "mission_name": "DemoSat",
        "launch_year": "2007"
      },
      {
        "mission_name": "Trailblazer",
        "launch_year": "2008"
      },
      {
        "mission_name": "RatSat",
        "launch_year": "2008"
      },
      {
        "mission_name": "RazakSat",
        "launch_year": "2009"
      }
    ]
  }
}
```

## Directives

> 요청받은 변수에 따라 필드를 포함하거나 포함하지 않는 등, 응답의 구조와
> 형태를 동적으로 바꿀수 있을까? `Directive`(`지시어'`) 를 사용하면 가능하다.

지시어 사용을 위해 `스타워즈 API` 를 사용한다.

```gql

query findFilm($filmId: ID!) {
  film(id: $filmId) {
    director
    title
    releaseDate
    producers
  }
}

--- variabels ---

{
  "filmId": "ZmlsbXM6MQ=="
}

```

```json
{
  "data": {
    "film": {
      "id": "ZmlsbXM6MQ==",
      "director": "George Lucas",
      "title": "A New Hope",
      "releaseDate": "1977-05-25",
      "producers": ["Gary Kurtz", "Rick McCallum"]
    }
  }
}
```

이를 통해 `디렉터`, `제목`, `개봉날짜`, `프로듀서` 의 정보를 볼수 있다.
`$withProducers` 인자를 사용하여, `true` 인 경우에만 `producers` 필드를  
표시하도록 해본다.

> 기본값은 false 이다.

```gql

query findFilm($filmId: ID!, $withProducers: Boolean = false) {
  film(id: $filmId) {
    director
    title
    releaseDate
    producers @include(if: $withProducers)
  }
}

--- variabels ---

{
  "filmId": "ZmlsbXM6MQ==",
}


```

```json
{
  "data": {
    "film": {
      "id": "ZmlsbXM6MQ==",
      "director": "George Lucas",
      "title": "A New Hope",
      "releaseDate": "1977-05-25"
    }
  }
}
```

> `$withProducers` 가 `true` 일때

```gql

query findFilm($filmId: ID!, $withProducers: Boolean = false) {
  film(id: $filmId) {
    director
    title
    releaseDate
    producers @include(if: $withProducers)
  }
}

--- variabels ---

{
  "filmId": "ZmlsbXM6MQ==",
  "withProducers": true,
}


```

```json
{
  "data": {
    "film": {
      "id": "ZmlsbXM6MQ==",
      "director": "George Lucas",
      "title": "A New Hope",
      "releaseDate": "1977-05-25",
      "producers": ["Gary Kurtz", "Rick McCallum"]
    }
  }
}
```

`producers` 값이 포함된것을 볼수있다.
보통 `GraphQL` 에서 제공하는 `directive` 는 `@include`, `@skip` 이 있다.

## Fragment

> `fragment` 는 반복되는 필드의 목록을 묶는 단위이다.

이렇게 `fragment` 를 만들고 재사용하면 복잡성을 낮출수 있다.

```gql
query {
  launches(sort: "launch_year", order: "DESC") {
    launch_year
    rocket {
      rocket_name
      rocket {
        ...RocketDetail
      }
    }
  }
  rockets {
    ...RocketDetail
  }
}

fragment RocketDetail on Rocket {
  name
  company
  boosters
  height {
    feet
    meters
  }
}
```

```json

  "data": {
    "launches": [
      {
        "launch_year": "2006",
        "rocket": {
          "rocket_name": "Falcon 1",
          "rocket": {
            "name": "Falcon 1",
            "company": "SpaceX",
            "boosters": 0,
            "height": {
              "feet": 73,
              "meters": 22.25
            }
          }
        }
      },
      ...
    ]
  }
```

`Rocket` 정보중에 사용할 `field` 만을 `fragment` 를 사용하여 정의한다.
해당 `fragment` 는 `RocketDetail` 이며 `on` 절을 사용하여, `Rocket` 정보임을  
알려준다.

이는 동일한 정보를 중복해서 작성하지 않고 `fragment` 를 사용하여 재사용함을  
알수 있다.

## Mutation

> `GraphQL` 의 데이터 조작하는 요청 방법이 뮤테이션이다.

`Mutation` 은 `REST` 처럼 `POST`, `PUT(PATCH)`, `DELETE` 가 나누어져 있지 않다.
오직 `Mutation` 상에서 `CRUD` 중 `CUD` 를 사용할수 있다.

```gql

mutaion CreateReviewForEposode(
  $ep: Episode!, $review: ReviewInput!
) {
  createReview(episode: $ep, reivew: $review) {
    stars
    commentary
  }
}

```

이렇게 생성하고, 해당 `review` 의 `starts` 와 `commentary` 를 반환하는
뮤테이션이다.

> 위의 뮤테이션은 `startwars api` 를 사용하는 뮤테이션이다.
> 가상의 서버에 요청하는것이므로 이 뮤테이션 실행을 하더라도, 해당 리뷰는 생성되지 않는다.

## 스키마와 타입

> `GraphQL` 의 근간은 강력항 타입 시스템에서 출발한다

강력한 타입 시스템으로 `API` 를 제공하는 쪽과 사용하는 쪽 모두 타입에 대한  
정보를 공유하고 사용가능하다.

> `GraphQL` 쿼리는 모두 특정 오브젝트로부터 필드를 선택하는 과정이다. 필드가  
또 다른 오브젝트라면 필드가 더이상 하위 필드를 가지지 않을때 까지 다시 필드를  
선택하는 과정이 반복된다.

`GraphQL` 스키마의 가장 기본은 `Object` 이다.
`Object` 는 `field` 의 모음이며, 하위 `Object` 를 포함하거나, `Scala` 가 포함될  
수있다.

`Scala` 는 `String`, `Float`, `Int`, `Boolean`, `ID` 등이 있다
`!` 는 필수 `field` 일 경우 표시한다.
`[field]` 는 `field` 를 가진 배열을 나타낸다.

```gql

type Character {
  name: String!
  // [Episode!] 는 Episode 타입이 포함된 배열을 말하며, 해당 배열은 빈배열일수 없다.
  // [Episode!]! 는 빈값일수 없음을 나타낸다
  appearsIn: [Episode!]!
} 

type Episode {
  name: String!
}

```

`Object` 는 0 개 이상의 인자를 가진 `field` 가 있을수 있다.

> 마치 함수타입을 선언하는것과 같아 보인다.

```gql

type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}

```

`name`, `id` 는 필수값이지만 인자가 없고, `length` 는 필수값은 아니지만,
인자가 1개 있음을 볼 수 있다

해당 인자인 `unit` 은 `!` 가 없으므로, 선택적인 인자로 정의되어 있다
쿼리시 해당 인자를 입력하지 않아도 쿼리가 가능하다.

### 쿼리와 뮤테이션 타입

> `GraphQL` 스키마에서 쿼리와 뮤테이션 타입은 특별하다.
> 이 두 타입은 모든 `GraphQL` 쿼리의 진입점으로서 정의된 타입이다.
>
> 지금가지 작성한 모든 쿼리는 `Query` 라는 오브젝트로 부터, 뮤테이션의 경우
> `Mutation` 오브젝트로 부터 시작했음을 기억해야 한다.
>
> 이와 같이 모든 `GraphQL` 스키마는 쿼리와 뮤테이션을 포함한다
> 이를 `SDL` 로 작성해보면 다음과 같다

```gql

schema {
  query: Query
  mutaion: Mutation
}

```

```gql

type Query {
  hero: Charecter
  droid(id: ID!): Droid
}

```

위를 보면 `query: Query` 이다.
모든 쿼리는 `Query` 라는 오브젝트 안의 `field` 들이다.
이는 `Mutation` 도 동일하게 작동한다

> 다른 오브젝트들과는 크게 다를것은 없다. 그저 필드를 가진 오브젝트일 뿐이다

### Scala

스칼라는 하위 `field` 를 가지지 않는 데이터 자체이다.

```gql

query {
  hero {
    name
    appersIn
  }
}

```

이는 `hero` 를 요청하는 쿼리이다.
`GraphQL` 에서 기본적으로 제공하는 `scala` 는 총 5개이다

`Int`: 32bit 정수
`Float`: 부동소수점
`String`: UTF-8 문자열
`Boolean`: `true` or `false`
`ID`: 고유 식별자를 나타내는 값, `String` 타입이기는 하다

기본적으로 제공되는 스칼라 타입 이외에도, 추가적으로 필요한 스칼라값을  
사용자 정의로 만들 수 있다

### Enum

`Enum` 은 스칼라중 하나로, 제한된 몇가지 값의 모음이다.

```gql

enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}

```

`enum` 을 다루는 방법은 각 언어에 맞는 방식으로 제공한다.

### Interface

`interface` 는 추상 데이터 타입으로, `Object` 의 `field` 의 정의를 해둔,  
`blue print`(`청사진`) 와 같다.

```gql

interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}

type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearseIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}

```

보면 알겠지만, 인터페이스에 정의된 `field` 뿐만 아니라, 여분의 `field` 도  
정의 가능하다.

하지만 다음과 같은 상황이라고 하면 문제가 될법하다

```gql
type Query {
  hero(episodie: Episode!): Character
}

query findHero($ep: Episode!) {
  hero(episode: $ep) {
    name
    primaryFunction // 이는 Droid 에만 있다
    totalCredits // 이는 Human 에만 있다
    starships // 이는 Human 에만 있다
  }
}
```

위 같은 경우 `Character` 타입이지만, 이를 상속받은
`Human` 과 `Droid` 의 타입으로 나누어진다.

이렇게 구분된 여분의 `field` 값을 가져올수 있도록 한다면, `inline fragmant` 를  
사용하여 처리한다.

```gql

query findHero($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      totlaCredits
      starships
    }
  }
}

```

이는 다음과 같다

- `hero` 가 `Droid` 인 경우 `primaryFunction` 필드가 쿼리된다
- `hero` 가 `Human` 인 경우 `totalCredits` 필드와 `starships` 필드가 쿼리된다

이를 기반으로 선택적으로 쿼리하게 된다.

### Union

`typescript` 처럼 `union` 타입을 정의할 수 있다.
이는 `or` 연산자처럼, 처리된다

```gql

union SearchResult = Human | Droid | Starship

```

이를 사용하여 `SearchResult` 는 `Human` 또는 `Droid` 또는 `Starship` 이 될 수 있다.
이러한 경우, 각 타입이 3가지의 경우의수로 나누어지므로, `inline fragmant` 를  
사용하여 접근해야 한다.

```gql

type Query {
  search(text: String!): SearchResult
}

query search {
  search(text: 'an') {
    __typename
    ... on Human {
      name
      height
    }
    ... on Driod {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}

```

`__typename` 은 `resolve` 된 `field` 가 어떤 타입인지를 나타내는 특별한  
데이터 타입이라고 한다.

이는 다음과 같이 출력된다

```json

{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Han Solo",
        "height": 1.8
      },
      {
        "__typename": "Human",
        "name": "Leia Organa",
        "height": 1.5
      },
      {
        "__typename": "Starship",
        "name": "T1E Advanced X1",
        "length": 9.2
      },
    ]
  }
}

```

`__typename` 상에 어떠한 타입인지 나타낸다.

### Input

`Input` 타입은 필드에 대한 인자를 타입으로 정의한 것이다

> 주로 복잡한 데이터를 생성하기 위한 복잡한 인자가 필요한 경우나, 동일한 인자가  
여러번 반복되는 경우에 사용된다

```gql

input ReviewInput {
  stars: Int!
  commentary: String
}

```

뮤테이션에서 인자로 `input` 타입 오브젝트를 사용하는 예제는 다음과 같다

```gql

mutation CreateReviewForEpisode (
  $ep: Episode!,
  $review: ReviewInput!
) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}

```

위는 `Episode` 에 `review` 를 생성하는 `mutation` 이다.

`createReview` 인 `resolver field` 는 `review` 에 접근하여 `stars` 와  
`commentary` 로 리뷰를 생성한다.

## GraphQL 실행

> `GraphQL` 은 스키마 및 타입 정의만으로는 실제 데이터를 올바르게 호출할 수 없다.
`GraphQL` 은 타입 정의와 일치하는 실제 데이터를 조회, 조작 하는 구현체가 뒤에  
단에 필요하다
>
> 이 과정을 `resolver` 라는 이름의 함수 모음이다.

스키마는 다음과 같다

```gql

type Query {
  human(id: ID!): Human
}

type Human {
  name: String
  appearsIn: [Episode]
  starships: [Starship]
}

type Episode {
  NEWHOPE
  EMPIRE
  JEDI
}

type Starship {
  name: String
}

```

`human` 을 쿼리할 수 있다.

> 쿼리시 연쇄적으로 리졸버 함수를 호출한다
> 필드가 오브젝트가 아닌 스칼라가 될 때까지 리졸버 함수는 계속 더 깊은
> 계층까지 호출된다.

```gql

query {
  human(id: 1002) {
    name
    appersIn
    starships {
      name
    }
  }
}

```

1. `root` 필드인 쿼리를 시작점으로 리졸버 함수 호출이 시작된다
2. `query` 필드 바로 아래인 `human` 필드 리졸버 함수가 `id` 인자와 함께 호출한다.
이로인해 반환값은 `Human` 이 되어야 한다.

이로 인한 `resolver` 는 다음과 같다고 한다

```gql

const resolver = {
  Query: {
    human(obj, args, context, info) {
      return context.db.loadHumanById(args.id).then(
        userData => new Human(userData)
      )
    }
  }
}

```

`human` 리졸버 함수의 각 인자값의 내용은 다음과 같다

| 인자 | 설명 |
| :--- | :--- |
| `obj` | 이전(상위) 오브젝트를 의미 |
| `args` | 전달된 인자 |
| `context` | 모든 리졸버에 공통적으로 제공되는 중요한 문맥 정보 모음이다. <br/> `DB` 데이터 엑세스 오브젝트<br/> 요청자의 로그인 정보<br/> 캐시 DB 엑세스 오브젝트<br/> 등 요청과 독립적으로 구성되어 사용되는 자원들이 포함될 수 있다<br/>`context` 에 어떠한 정보가 유통될지는 개발자에게 달려있으므로 어느 것이든 추가될 수 있다.|
| `info` | 현재 실행되고 있는 작업(`query`, `mutation`) 에 대한 스키마 필드에 대한 정보를 가지고 있는 객체이다 |

이 코드에서 `human` 리졸버 함수는 `context` 에 존재하는 데이터베이스 접근  
오브젝트를 통해 `loadHumanById` 라는 비동기 메서드를 호출했고, `then` 을 통해  
`userData` 를 사용하여 `Human` 으로 재구성하여 반환한다.

이후 `Human` 오브젝트의 각 필드의 리졸버를 호출해 데티어를 가져오기 시작한다.

```gql

const resolver = {
  Query: {
    human(obj, args, context, info) {
      return context.db.loadHumanById(args.id).then(
        userData => new Human(userData)
      )
    }
  },
  Human: {
    name(obj, args, context, info) {
      return obj.name;
    },
    appearsIn(obj, args, context, info) {
      return obj.appearsIn;
    },
    starships(obj, args, context, info) {
      const { starshipIDs } = obj;
      return context
        .db
        .findStarshipByIds(starshipIDs)
        .then(ship => {
          return ship.map(
            ship => new Starship(shipdata)
          )
        });
    },
  },
  Starship: {
    name(obj, args, context, info) {
      return obj.name
    }
  }
}

```

`type Human` 에 맞추어 각 `field` 마다 `resolver` 함수를 생성해서 반환하는것을  
볼수 있다.

> `Human` 오브젝트가 리졸브된 뒤, `GraphQL` 은 타입 시스템을 통해 `Human`  
오브젝트가 어떤 필드를 갖고 있는지 미리 알고 있다.
>
> 순차적으로, `name`, `appearsIn`, `starships` 필드의 리졸버를 호출하기 시작한다.
> 그럼 `new Human` 을통해 생성된 `Human` 인스턴스는 `resolver.Human` 에서 접근하며,
> `Human` 리졸버 함수에서 반환된 `starships` 역시, `Starship` 타입의 리졸버
> 함수에서 각 `Starship` 인스턴스의 속성을 접근한다.
>
> 이후 `grahpql-in-action` 이라는 책을 통해서 개념적인 지식을 좀더 살펴볼 생각이다.

