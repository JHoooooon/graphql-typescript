# 🔥 프로젝트 준비

> 책에서는 지브리 작품 이미지를 볼 수 있는 사이트를 만든다.
>
> 참고로, 책 내용이 현재 버전과 많이 다르다.
> 그래서 참고는 하되, 다르게 설정 및 세팅한다.
> 책에서는 `docker compose` 까지는 사용안하지만, 여기서는
> `docker compose` 로 세팅한다.

- 회원가입 로그인
- user 는 영화목록을 확인
- user 는 특정 영화의 명장면 목록을 확인
- user 는 명장면에 "좋아요" 를 누르고, 감상평 작성가능 (로그인 상태)
- user 는 프로필 사진 업로드 가능 (로그인 상태)
- 알림 기능으로 특정 유저에게 알림을 실시간으로 보냄

여기서 `DB` 는 `mysql` 을 사용하며, `redis` 를 사용한다.

일단 `dockerFiles` 를 작성한다.

```yaml
version: "3.1"

services:
  web:
    build:
      context: "../"
      dockerfile: "dockerFiles/web/dockerFile.dev"
    ports:
      - 3000:3000
    volumes:
      - ../web/:./
  backend:
    build:
      context: "../"
      dockerfile: "dockerFiles/backend/dockerFile.dev"
    ports:
      - 8000:8000
    volumes:
      - ../backend/:./
  db:
    image: mariadb
    container_name: mariadb
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: root
    ports:
      - 3306:3306
  redis:
    image: redis
    container_name: redis
    restart: always
    ports:
      - 6379:6379
```

나머지는 `dockerFiles/` 폴더안에 `dockerFile.dev` 를 사용하여 작성했다

그리고 `client` 를 `create-react-app` 을 사용하여 만들고, `backend` 를 작성한다.
여기서 `apollo server` 가 업데이트 된것으로 보인다.

이로인해 책의 코드와는 다르므로, 다음과 설치 및 작성한다

```sh

npm i express @apollo/server graphql reflect-metatdata ts-node typescript;
npm i -D @types/express  @types/node nodemon;

```

🥲 여기서 중요한점은 `ts-node` 가 정상작동을 하지 않는다는 것이다.
이는 [CommonJS vs native ECMAScript](https://typestrong.org/ts-node/docs/imports) 에 해당 내용이 있다.

대략적으로 말하자면 `ts-node` 는 `default` 로 `module: CommonJS` 를 사용한다.
이때 다음과 같이 설정하라고 한다

`package.json`

```json

{
  ...
  "type":  "commonjs", // default 가 commonjs 이니 명시적으로 설정안해도 된다.
  ...
}

```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "CommonJS"
  }
}
```

반면에 `Native ECMAScript Modules` 를 사용하고 싶다면, 다음처럼 설정한다

> `ESM loader hook` 은 `NodeJS` 에서 아직은 실험적이다

`package.json`

```json
{
  "type": "module"
}
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "ESNext" // or ES2015, ES2020
  },
  "ts-node": {
    "esm": true
  }
}
```

**_:angel: 그런데 실행되지 않는다... 👼_**
**_아~ 하늘로 승천할것만 같아 :angel:~~ 그분이 보이네...._**

💢 `code: 'ERR_UNKNOWN_FILE_EXTENSION` 에러가 발생했는데,
해당 오류코드를 `docs` 에서 찾아보니 다음과 같이 설명되어있었다.

`Docs` 상에서는 `LTS` 는 사용가능하도록 지원한다고는 하는데,
새로운 `NodeJS` 버전에 따라 중단 또는 변경될수 있다며 경고한다.

> `Our ESM loader is not installed.
Solution: Use ts-node-esm, ts-node --esm, or add "ts-node": {"esm": true} to your tsconfig.json. Docs`

해결책이 아니다.
이 내용은 이미 앞서 본 🕶️ [CommonJS vs native ECMAScript](https://typestrong.org/ts-node/docs/imports) 에 나와있다.

그렇다면, `NodeJS` 상에서 `ESM loader hooks` 가 실험적이기 때문에 생긴 에러인가?

👍 [ERR_UNKNOWN_FILE_EXTENSION on Node v20.0.0 #1997](https://github.com/TypeStrong/ts-node/issues/1997) 에서 같은 증상의 글을 찾았다.

현재 이분은 `node v20` 을 사용하고 있으며, `tsconfig.json` 에
`"ts-node": { "esm": true }` 했음에도 `ERR_UNKNOWN_FILE_EXTENSION` 가 발생했다.

현재 이 `github/issue` 상에서는 `Node v20` 에서 지속적으로 같은 증상이 나타나며
이를 해결하기위해 `node --loader` 를 사용하여 우회하여 사용했다고 한다.

이를 위해 `node start:dev` 를 다음처럼 변경한다.

`package.json`

```json
{
  "scripts": {
    "start:dev": "nodemon --watch 'src/**/*.ts' --exec 'node --loader ts-node/esm' src/index.ts"
  }
}
```

동작해보면 `ExperimentalWarning` 에러가 나오는데, 아직 실험적 기능이라 경고문구가  
나오는듯 하다.

`package.json`

```json
{
  "scripts": {
    "start:dev": "nodemon --no-warnings=ExperimentalWarning --watch 'src/**/*.ts' --exec 'node --loader ts-node/esm' src/index.ts"
  }
}
```

위처럼 변경하여 해당 경구문구가 나오지 않도록 한다.
이는 `production` 환경에서 사용하지 않으며, `development` 환경에서만 사용하므로  
문제가 될것은 많이 없다.

개발 모드에서도 문제가 된다면, 다른 우회방법으로 넘어가야 하겠지만...

> 다른 방법으로는, `tsc` 로 컴파일한후, `node` 를 사용해 컴파일한 `index.js` 를  
> 실행하는 우회방법도 존재한다.
>
> `ts-node` 가 `v20` 에서는 어쩔수없이 사용해야할 것 같다.
> 아니면 `v18` 이나 `v19` 에서는 작동하는 모양이니, `nvm` 으로 다운그레이드 해도  
> 된다.

이제 `server` 부분을 작성하자.

`server/app.ts`

```ts
import express from "express";

const app = express();
app.set("PORT", process.env.PORT || 8000);
app.use(express.json());

export default app;
```

`server/index.ts`

```ts
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import app from "./app";

async function bootStrap() {
  const server = new ApolloServer({
    typeDefs: `
      type Query{
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => `hello world`,
      },
    },
  });

  try {
    await server.start();

    app.use("/graphql", expressMiddleware(server));
    app.listen(app.get("PORT"), () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`
          server started on => http://localhost:${app.get("PORT")} 
          graphql playground => http://localhost:${app.get("PORT")}/graphql
        `);
      } else {
        console.log(`
          Production server Started... 
        `);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

bootStrap();
```

이제 대략 준비는 마쳤다.

```sh

docker compose up -d;

```

제대로 동작하는것을 볼 수 있다.

## 📝 코딩 스타일 및 규칙 적용

일관된 코드를 작성하는것은 중요하다
이는 팀단위로 진행하는 프로젝트를 일관된 규칙을 통해 작성되므로 통일성있으며,
이해하기 어려운 코드의 작성 빈도를 줄여준다

`ESLint` 는 코딩규칙을 정의하고, 정의된 규칙에 따라 코드를 정적으로 분석하여
문제를 찾아내거나, 에디터상에서 에러로 표시할 수 있다

`linting` 을 통해 `CLI` 상에서 자동으로 코드를 수정하도록 할 수도 있다

`Prettier` 는 코드 포맷터이다.
문장의 길이나 문자으이 끝에 세미콜론을 붙이는지와 같은 코드 스타일에 대한
몇가지 규칙을 정한뒤, 해당 스타일대로 코드를 자동으로 포맷팅 해준다.

이 2개를 `Typescript` 상에서 사용하기 위해서는 약간의 설정이 필요하다.

```sh

# eslint 와 prettier 를 설치한다
npm i eslint prettier;

# 많이 사용되는 eslint 규칙중 airbnb 에서 만든 스타일가이드를 사용할것이다
npm i eslint-config-airbnb;

# 이제 `TS` 에서 사용가능하도록 `parser` 와 `plugin` 을 설치한다
# @typescript-eslint/parser: TS 구문분석에 필요
# @typescript-eslint/plugin: TS 에 특정한 ESLint 규칙을 제공
npm i @typescript-eslint/parser @typescript-eslint/plugin;

# prettier 와 eslint 를 함께 사용하기 위해 의존 모듈을 추가적으로 설치한다.
# eslint-config-prettier: prettier 에서 사용하는 코드 스타일에 관한 ESLint 규칙을
#                         비활성화
# eslint-plugin-prettier: prettier 에서 인식하는 스타일 오류를 ESLint 오류로
#                         출력해주는 플러그인
npm i eslint-config-prettier eslint-plugin-prettier;

# import/export 구문에서 발생하는 잠재적 이슈를 체크
npm i eslint-plugin-import;

# react 관련 플러그인
# eslint-plugin-react: react 관련 규칙 제공
# eslint-plugin-react-hooks: react hooks 관련 규칙 제공
# eslint-plugin-jsx-a11y: react 에서 접근성 관련 규칙 제공
npm i eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y;

```

`.prettierrc`

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "semi": true,
  "useTabs": false
}
```

`eslint` 를 세팅하면서, `ESM` 과 `CJS` 와의 충돌이 발생하는 듯하다.
현재 `CJS` 로 변경하면서, 제대로 동작은 되게 만들었지만, 이부분에 대해서
정리할 필요가 보인다.

`eslint` 가 현재 `V8.53.0` 에서 `Formetting rules` 를 `deprecated` 해버렸다.

> `ESLint` 를 관리하는데 문제가 점점 커짐에 따라 유지하기 어렵다 판단한듯하다
> `ESLint` 에서 이러한 `rules` 를 사용하고 싶다면, `@stylistic` 패키지를
> 따로 설치하거나, `Formatter` 를 따로 사용하라고 한다.
>
> 이는 `ESLint v10.0.0` 까지 삭제되지 않을것이라고 한다.

추가적으로 `@stylistic/eslint-plugin` 을 설치하고 세팅한다.

```sh
npm i -D @stlylistic/eslint-plugin

```

```js
const config = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "airbnb",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["react", "react-hooks", "@typescript-eslint", "@stylistic"],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    "@stylistic/max-len": [
      "error",
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
        ignorePattern: "^import\\s.+\\sform\\s.+;$",
      },
    ],
    "@stylistic/linebreak-style": 0,
    "no-use-before-define": 0,
    camelcase: 1,
    "max-classes-per-file": 0,
    "class-methods-use-this": 0,
    "import/prefer-default-export": 0,
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
        jsx: "never",
        tsx: "never",
      },
    ],
    "no-underscore-dangle": 0,
    "no-console": 0,
    "react/jsx-filename-extension": [
      2,
      { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    ],
    "react/require-default-props": 0,
    "react/jsx-props-no-spreading": 1,
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
    // typescript
    "@typescript-eslint/no-use-before-define": 2,
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  ignorePatterns: ["generated/**/*.ts"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", "jsx", "tsx"],
      },
    },
  },
};

module.exports = config;
```

> 추가적으로, 책에서 나온 `graphql`, `apollo server`, `type-graphql` 의  
> 버전이 다르다.
>
> 현재 `@apollo/server` 는 `graphql@16.8.0` 이상을 사용하지만,
> `type-graphql@1.1` 은 `grqphql@15.5.0` 을 사용한다.
>
> `type-graphql@1.1` 이 안정화 버전인듯하며, `graphql@16.8.0` 을 지원하는
> `2.0` 은 `beta` 버전인듯하다.
>
> `graph@16.8.0` 에 대한 `peer dependency` 를 위해 `type-graphql@2.0.0-beta.6` 을
> 설치한다.
>
> `Alpha` 버전이 아닌, 베타 버전이므로, 사용시에는 큰 문제는 없을듯 싶다.

### :bricks: Schema 설계

이렇게 작성후 `entities` 폴더를 만들고 `grpahql` 에 사용한 `field` 및 `type` 을
작성한다.

`entities/Film.ts`

```ts
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Film {
  // Int 타입으로 변환
  // TS 에서 number 타입은 자동으로 Float 으로 변한다.
  // 이를 해결하기 위해 Int 를 명시적으로 선언한다.
  @Field(() => Int, { description: "영화 고유 아이디" })
  id: number;

  @Field({ description: "영화 제목" })
  title: string;

  @Field({ nullable: true, description: "영화 부제목" })
  subtitle?: string;

  @Field({ description: "영화 장르" })
  genre: string;

  @Field({ description: "영화 러닝 타임, minute" })
  runningTime: number;

  @Field({ description: "영화 줄거리 및 설명" })
  description: string;

  // Int 타입으로 변환
  // TS 에서 number 타입은 자동으로 Float 으로 변한다.
  // 이를 해결하기 위해 Int 를 명시적으로 선언한다.
  @Field(() => Int, { description: "제작자 고유 아이디" })
  director_id: number;

  @Field({ description: "포스터 이미지 URL" })
  posterImg: string;

  @Field({ description: "개봉일" })
  release: string;
}
```

일단 추가적으로 작성하기전에 `DOCS` 에서 제공하는 `Type and Fields` 부터
훑어본다.

---

### Types and Fields

> `TypeGraphQL` 에서 사용되는 `field` 및 `type` 에 대해서 알 필요가 있다
> 이는 [Types and Field](https://typegraphql.com/docs/types-and-fields.html) 를 보며 정리해둔다.

`TypeGraphQL` 은 `Typescript classes` 를 `GrpahQL Schema` 를 자동 생성해준다.
데커레이터와 마법같은 약간의 `reflection` 을 사용하여, 스키마에 대한 `files` 그리고 `interface` 를 정의할 필요가 없다.

다음의 예시를 본다.

```ts
// ObjectType 데커레이터는 class 가 `GraphQL SDL` 또는
// `graphql-js` 의 `GraphQLObjectType` 에 대한 타입임을 알게 표시해준다.
@ObjectType()
class Recipe {
  // Field 데커레이터는 class 프로퍼티를 `Typescript reflection system`
  // 에 대한 메타데이터 수집에 사용하며, `GraphQL field` 를 맵핑해준다.
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  ratings: Rate[];

  @Field()
  averageRating: number;
}
```

간단한 유형의 경우 `Typescript Type` 들 (`string` or `boolean` 같은..) 만으로
충분하다.

하지만 `Typescript reflection` 제한에 의해 제네릭 타입들에 대한 정보를 제공할
필요가 있다 (`Array` 또는 `Promise` 같은...)

그래서 `Rate[]` 타입을 선언하려면, 명시적으로 `array types` 에 대한 구문을
사용한다

이는 다음처럼 한다.

```ts
@ObjectType()
class Recipe {
  @Field()
  id: string;

  @Field()
  title: string;

  // 명시적으로 Rate 로 이루어진 배열임을 알려준다.
  // 만약, 중첩된 배열이라고 하면 다음처럼 하면 된다.
  // type => [[Int]]
  // 이는 중첩된 Int 를 가진 이중배열임을 뜻한다.
  @Field((type) => [Rate])
  ratings: Rate[];

  @Field()
  averageRating: number;
}
```

`function` 구문을 사용해야 하며, 간단하게 `{ type: Rate }` 설정 객체를 사용하지 않는지 의문이 생길수 있다.

이는 `function` 구문을 사용하여 `circular dependencies` 문제를 해결하기 때문이다.

> 이에 대해서는 따로 더이상 언급하는 바가 없다. 지연평가를 사용하여 `circular dependencies` 를 해결한다고는 하는데, 이부분은 나중에 더 살펴볼 문제인듯하다.

`shorthand` 구문으로 `@Filed(() => Rate)` 처럼 사용가능하다

기본적으로, 모든 필드는 `non-nullable` 이지만, `buildSchema` 에서  
`nullableByDefault: ture` 옵션을 사용하여 `nullable` 로 변경할수 있다

아직, `ratings` 가 정의되어있지 않므로, `avarageRating` 같은 프로퍼티는
`nullable` 할것이다. 이제 이 `avarageRating` 프로퍼티에 `optional 연산자`(`?:`)
를 사용하고, 데커레이터 파라미터에 `{ nullable: true }` 를 전달한다.

```ts
@ObjectType()
class Recipe {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field((type) => [Rate])
  ratings: Rate[];

  // 이 field 는 nullable 이도록 설정한다.
  @Field({ nullable: true })
  averageRating?: number;
}
```

`array` 인 경우 더 자세하게 정의할 필요가 있다
`{nullable: true | false}` 은 오직 전체 `array`(`[Item!]` or `[Item!]!`) 에  
적용된다. 그래서 `sparse array`(희소배열: `undefined` 가 포함된 배열) 일 경우
`nallable: "items"`(`[Item]!` 과 같다.) 혹은, `nallable: "itemsAndList"`(`[Item]` 과 같다) 을 통해 `null` 허용 여부를 제어할 수 있다

정리하면 아래 표와같다

| 옵션                           | SDL 생성 타입 | 설명                                                                                  |
| :----------------------------- | :------------ | :------------------------------------------------------------------------------------ |
| `{ nullable: true }`           | `[Item!]`     | `array` 가 `null` 일수 있지만,<br/>`array` 내용은 `Item` 이어야만함                   |
| `{ nullable: false }`          | `[Item!]!`    | `array` 가 `null` 을 허용하지 않으며,<br/>`array` 내용은 `Item` 이어야만 함           |
| `{ nullable: "items" }`        | `[Item]!`     | `array` 가 `null` 을 허용하지 않으며,<br/>`array` 내용은 `null` 허용(`희소배열 허용`) |
| `{ nullable: "itemsAndList" }` | `[Item]`      | `array` 및 `array` 내용 모두 `null` 허용                                              |

다음은 `@Field(() => [[Item]], { nullable: ? })` 인 중첩배열일 경우의 예시이다.

| 옵션                           | SDL 생성 타입 | 설명                                                                                  |
| :----------------------------- | :------------ | :------------------------------------------------------------------------------------ |
| `{ nullable: true }`           | `[[Item!]!]`  | 전체리스트만 적용(`null` 또는 `[Item!]! 허용`)                                        |
| `{ nullable: false }`          | `[[Item!]!]!` | 전체리스트만 적용(`null` 미허용)                                                      |
| `{ nullable: "items" }`        | `[[Item]]!`   | `array` 가 `null` 을 허용하지 않으며,<br/>`array` 내용은 `null` 허용(`희소배열 허용`) |
| `{ nullable: "itemsAndList" }` | `[[Item]]`    | `array` 및 `array` 내용 모두 `null` 허용                                              |

> 이는 배열 사용시 명확하게 구분하고 작성해야 할것 같다..

`id` 프로퍼티에는 `type => ID` 를, `value` 프로퍼티에는 `type => Int` 를  
전달하는것을 볼 수 있다

이는 `reflection metatdata` 가 추정한 `type` 을 `overwirte`(`덮어씌우기`) 한다.

`GraphQL` 에서 제공하는 5개의 `scalars` 를 보자.

| SDL 스칼라 타입  | 설명         |
| :--------------- | :----------- |
| `GrahpQLInt`     | 정수         |
| `GrahpQLFloat`   | Float        |
| `GrahpQLID`      | ID           |
| `GrahpQLString`  | UFT-8 문자열 |
| `GrahpQLBoolean` | 불린값       |

`type-graphql` 에서 이에 대응하는 스칼라 타입은 총 5개이다

| 스칼라 대응 타입 | SDL 스칼라 타입  |
| :--------------- | :--------------- |
| `Int`            | `GrahpQLInt`     |
| `Float`          | `GrahpQLFloat`   |
| `ID`             | `GrahpQLID`      |
| `String`         | `GrahpQLString`  |
| `Boolean`        | `GrahpQLBoolean` |

`GraphQLString` 과 `GraphQLBoolean` 에 대응하는 스칼라 타입을 굳이 작성안해도
된다. `type-graphql` 이 자동적으로 반영하기 적합한 타입이기에 때문이다

> 그냥, 타입스크립트 `class` 의 필드에 `type` 을 지정하면, 알아서 유추해준다.

```ts
@ObjectType()
class User {
  @Field()
  name: string; // 자동으로 GraphQLString 으로 반영

  @Field()
  isMerried: boolean; // 자동으로 GraphQLBoolean 으로 반영
}
```

> 하지만 예외는 존재한다
> 명시적으로 사용해야 하는경우는 다음처럼 `GET computed` 함수를 사용해야
> 하는 경우가 있다

```ts
@ObjectType()
class SampleObject {
  @Field((type) => String, { nullable: true })
  // TS reflected type is `Object` :(
  get optionalInfo(): string | undefined {
    if (Math.random() > 0.5) {
      return "Gotcha!";
    }
  }
}
```

반면에 `GraphQLInt`, `GrahpQLFloat`, `GrahpQLID` 는 스칼라 타입을 필수적으로
명시하는게 좋다.

```ts
// import the aliases
import { ID, Float, Int } from "type-graphql";

@ObjectType()
class MysteryObject {
  @Field((type) => ID)
  readonly id: string;

  @Field((type) => Int)
  notificationsCount: number;

  @Field((type) => Float)
  probability: number;
}
```

왜 이렇게 `type => Int` 를 사용하여 타입을 지정해주는가?
이는 간단하다.

`javascript` 가 내부적으로 `부동소수점` 을 사용하여 숫자를 처리하기 때문이다
이는 `javascript` 특성상 `Int` 에 대한 타입이 없으며, 모든 숫자를 `부동소수점`으로
처리하는데 문제가 있다.

반면 `GraphQL` 은 `Int` 와 `Float` 이 명확하게 구분되어있므로, 이를 명식적으로
표현해주는것이 좋다

> `type-graphql` 에서는 `type => Int` 가 없으며, 타입이 `number` 이면
> 자동적으로 `GraphQLFloat` 으로 처리된다.
>
> 그럼 굳이 명시적으로 `type => Float` 을 사용할 필요가 없지 않을까?
> 이는 실수를 줄이기 위해 명시하는게 좋다는 개인적이 생각이다.

`type => ID` 역시 `typescript` 상에서 `string` 타입인것을 볼 수 있다.
`GraphQLID` 타입이 존재하므로, 직접 명시하는것이다.
명시하지 않으면 자동적으로 `GraphQLString` 이 반영된다.

이 외에도 `type-grapyql` 에서는 `Date Scalars` 를 제공한다.
이는 `type-graphql` 에서 `Date` 타입에 대한 내장 `scalar` 이다.

| 스칼라 이름 | 설명                |
| :---------- | :------------------ |
| `timestamp` | 타임스템프          |
| `isoDate`   | `ISO` 포멧의 `date` |

이는 `type-graphql` 패키지에서 `GraphQLISODataScalar`, `GraphQLTimestempScalar` 로
제공된다.

`default` 로 `Date` 타입에 `isoDate` 포멧을 사용하고있으며, 변경하고 싶다면 `buildSchema` 옵션에서 변경한다.

```ts
import { buildSchema } from "type-graphql";

const schema = await buildSchema({
  resolvers,
  dateScalarMode: "timestamp", // "timestamp" or "isoDate"
});
```

이처럼 하면, 명시적 선언이 필요가 없다

```ts
@ObjectType()
class User {
  @Field()
  registrationDate: Date;
}
```

> `buildSchema` 에 대해서는 추가적으로 살펴봐야겠다.

이외에 직접 `Schema` 를 생성하는 `guide` 가 존재하는데
[Scalars](https://typegraphql.com/docs/0.17.5/scalars.html) 에서 더 살펴보도록 하겠다.

---

이제 대략적인 `TypeGraphQL` 에서 사용하는 `Scalar` 에 대해서 알아보았다.
이제 `resolver` 를 구성하도록 한다

### Resolver 구성

`Film` 오브넥트 타입에 대한 리졸버를 구성한다.

```ts
import { Query, Resolver } from "type-graphql";
import { Film } from "../entities/Film";
import ghibliData from "../data/ghibli";

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
```

리졸버 구성으로는 별것없다
일단 이에대한 [TypeGraphQL Resolvers](https://typegraphql.com/docs/resolvers.html) 를 살펴보도록 한다.

---

#### ✴️ Resolvers

`TypeGraphQL` 은 쉽게 `queries` 와 `mutations` 그리고 `field` 에대한 `resolver` 를
쉼게 생성할수 있도록 허용한다.

> 이는 마치 `Java` 의 `Spring`, `.NET` 의 `Web API`, `Typescript` 의 `routing-controllers` 같은 프레임워크의 `REST` 컨르롤러와 비슷하다.

##### Queries and Mutations

`resolver` 를 생성하기 위해 `@Resolver()` 데커레이터를 사용한다.
이 클래스는 전통적인 `REST` 프레임워크 컨트롤러처럼 행동한다.

```ts
@Resolver()
class RecipeResolver {}
```

`TypeGraphQL` 에서는 `DI` 프레임워크를 사용할수 있으며, `resolver` 클래스안에
저장할 `data store` 를 사용할수 있다.
여기서는 `data store` 를 직접 만들고 사용한다.

> `DI` 구성방법에 대해서는 추가적으로 `Docs` 를 살펴보아야 할것같다.
> `Nest` 처럼 구성한다면 굉장히 편할것 같다.

```ts
@Resolver()
class RecipeResolver {
  // fake data store
  private recipesCollection: Recipe[] = [];

  // mutation 및 queries 를 핸들링할 `class method` 를 생성한다
  // 다음은 `recipes` 쿼리이다.
  // `async` 이므로 `reflection metadata` 는 `Promise` 타입을 리턴하며,
  // `resolve` 시 `[Recipe]` 타입의 배열을 반환할것이다.
  // @Query 데커레이터는 반환타입을 알려주는 역할을 한다.
  @Query((returns) => [Recipe])
  async recipes() {
    // do someting
  }
}
```

##### 🚩 Arguments

일반적으로 `TypeGraphQL` 은 두가지 방법으로 `arguments` 를 허용한다

`@Arg` 데커레이터를 사용하며, `inline arguments` 사용시에, 문자열 인자는
`SDL` 에서 `query` 및 `mutation` 에서 **사용될 인수의 이름을 정의**한다

- **_:mag_right: inline argmunent_**
  `@Arg` 데커레이터를 메서드에직접 사용하는방법이다.
  이 방법의 약점은 `decorator parameter` 안에 인수이름을 반복해야 한다는 것이다.
  (`reflection system` 의 제한으로 인해 반복할수 밖에 없다고 한다..)<br/>
  `GraphQL` 스키마에 반영될 `defaultValue` 옵션을 사용하여 기본값 전달이 가능하다

```ts
@Resolver()
class RecipeResolver {
  // ...
  @Query((returns) => [Recipe])
  async recipes(
    @Arg("servings", { defaultValue: 2 }) servings: number,
    @Arg("title", { nullable: true }) title?: string
  ): Promise<Recipe[]> {
    // ...
  }
}
```

- :mag*right: \*\*\_Arguments 정의클래스*\*\*
  `inline argument` 는 인자타입이 `2` ~ `3` 개 정도면 괜찮다.
  하지만, 그보다 더 많다면 `resolver` 메서드 정의가 비대해진다.<br/>
  이를 해결하기 위해 `arguments` 정의 클래스를 사용한다.
  `@ArgType()` 데커레이터를 선언하여 `Object` 타입 클래스를 생성할수 있다

```ts
@ArgsType()
class GetRecipesArgs {
  @Field((type) => Int, { nullable: true })
  skip?: number;

  @Field((type) => Int, { nullable: true })
  take?: number;

  @Field({ nullable: true })
  title?: string;
}
```

여기서 사용할 `Arguments 정의 클래스` 는 활용성이 매우 좋다
`class-validator` 를 사용하여, 검증을 할수있으며, `helper field` 및 `helper method`
작성도 가능하다.

```ts
import { Min, Max } from "class-validator";

@ArgsType()
class GetRecipesArgs {
  @Field((type) => Int, { defaultValue: 0 })
  @Min(0)
  skip: number;

  @Field((type) => Int)
  @Min(1)
  @Max(50)
  take = 25;

  @Field({ nullable: true })
  title?: string;

  // Helpers - index calculations
  get startIndex(): number {
    return this.skip;
  }
  get endIndex(): number {
    return this.skip + this.take;
  }
}
```

> :boom: `DOCS` 에서는 `args or input classes` 에 `constructor` 정의를
> 엄격하게 금지한다고 설명한다. 이는 `TypeGraphQL` 이 내부적으로
> `arg or input classes` 를 `instance` 화 시키기 때문이다.
>
> 실제로 아래의 코드를 보면 `instance` 화 시킨 `object` 에서
> `destructuring` 하는것을 볼 수 있다.

```ts
@Resolver()
class RecipeResolver {
  // ...
  @Query((returns) => [Recipe])
  async recipes(@Args() { title, startIndex, endIndex }: GetRecipesArgs) {
    // Example implementation
    let recipes = this.recipesCollection;
    if (title) {
      recipes = recipes.filter((recipe) => recipe.title === title);
    }
    return recipes.slice(startIndex, endIndex);
  }
}
```

이를 통해 깔끔한 `Args` 생성이 가능해졌다.
이는 `SDL` 에서 다음처럼 정의된다.

```gql
type Query {
  recipes(skip: Int = 0, take: Int = 25, title: String): [Recipe!]
}
```

##### 🚩 Input types

`mutation` 에서도 `Args` 를 받을수있다. 그러나 일반적으로 `mutation` 은
`Input` 타입을 사용한다.

`TypeGraphQL` 에서는 `Object type` 에 대한 같은 방식으로 `input` 생성이
가능하다. 이를 위해서는 `@InputType()` 데커레이터를 사용한다

또한 `Partial` 타입을 사용하여 원하는 `field` 만을 가져올수 있도록
`implemnts` 가능하다

```ts
@InputType({ description: "New recipe data" })
class AddRecipeInput implements Partial<Recipe> {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;
}
```

그리고 `AddRecipeInput` 은 다음의 `Mutation` 에서 사용한다

```ts
@Resolver()
class RecipeResolver {
  //..
  @Mutation()
  // @Arg('data') 필드에, Input 을 받아 처리한다.
  // @Ctx 는 옵셔널한 인자이며, 유저가 정의한 `Context` 인터페이스를 사용할수있다.
  addRecipe(
    @Arg("data") newRecipeData: AddRecipeInput,
    @Ctx() ctx: Context
  ): Recipe {
    // Example implementation
    const recipe = RecipesUtils.create(newRecipeData, ctx.user);
    this.recipesCollection.push(recipe);
    return recipe;
  }
}
```

이는 `SDL` 에서 다음과 같이 정의된다.

```gql
input AddRecipeInput {
  title: String!
  description: String
}

type Mutation {
  addRecipe(data: AddRecipeInput!): Recipe!
}
```

##### 🚩 Field resolvers

`Query` 그리고 `Mutation` 만 `resolver` 의 타입이 아니다.
종종 `Field resolver` 객체타입을 생성한다.

이러한 `Field resolver` 는 `DB` 로 부터 연관 `data` 를 `retching` 하기 위한
리졸버를 가진다.

`TypeGrpahQL` 에서 `Field resolver` 는 `mutations` 와 `queries` 와 매우 비슷하다.
하지만 몇가지 수정사항이 있다.

```ts
// `Resolver` 데커레이터 표시
@Resolver((of) => Recipe)
// 향상된 `type` 안정성을 위해 `ResolverInterface<Recipe>` 인터페이스를 구현
// 반환 유형이 `Recipe` 클래스의 `avaerageRating` 속성과 일치하는지,
// 첫번째 매개변수가 실제 개체 유형(Recipe 클래스) 인지 확인하는 `helper` 이다.
class RecipeResolver implements ResolverInterface<Recipe> {
  // Queries and Mutations

  // @FieldResolver() 데커레이터 표시
  @FieldResolver()
  // Field resolver 가 될 클래스 메서드 생성
  // 아래는 `Recipe` 의 `Reting` 배열의 평균을 계산하는 `averageRating` 필드이다.
  averageRating(
    // recipe 객체 주입을 위한 @Root 데커레이터로 파라미터 데커레이터 사용
    @Root() recipe: Recipe
  ) {
    const ratingSum = recipe.ratings.reduce((a, b) => a + b, 0);
    return recipe.ratings.length ? ratingsSum / recipe.ratings.length : null;
  }
}
```

여기서 알아두어야 할것은 간단한 `resolver` 나, 별칭으로 동작되는 `deprecated` 필드
같은경우, `ObjectType` 클래스에서 인라인으로 정의할수도 있다.

```ts
@ObjectType()
class Recipe {
  @Field()
  title: string;

  // derpecated 된 name field
  // get computed method 를 사용하여 title field 를 반환한다.
  // class 메서드이므로, 단순하게 this 접근으로 해결된다.
  // inline 메서드로 작성해도 된다.
  @Field({ deprecationReason: "Use `title` instead" })
  get name(): string {
    return this.title;
  }

  @Field((type) => [Rate])
  ratings: Rate[];

  // 간단하게 @Arg 인자를 받아서, ratings field 에 접근하여
  // avarage 를 계산하는 메서드이다.
  // 이 역시 class 메서드이며, 단순하게 this 접근으로 해결된다
  // inline 메서드로 작성해도 된다
  @Field((type) => Float, { nullable: true })
  averageRating(@Arg("since") sinceDate: Date): number | null {
    const ratings = this.ratings.filter((rate) => rate.date > sinceDate);
    if (!ratings.length) return null;

    const ratingsSum = ratings.reduce((a, b) => a + b, 0);
    return ratingsSum / ratings.length;
  }
}
```

위처럼 `class` 내부 `field` 에 접근하여 계산하는 용도면 그냥 `@Field` 로 처리해되
괜찮다.

하지만, 많이 복잡하거나, 부수효과(`DB` 에서 `data` 를 패칭하거나 `API` 요청 같은..)를 가진다면 `Field resolver` 를 사용하여 처리해야 한다.

이는 `DI` 에 이점을 가질수 잇는 방법이며, 실제 `testing` 에 도움을 준다.

```ts
import { Repository } from "typeorm";

@Resolver((of) => Recipe)
class RecipeResolver implements ResolverInterface<Recipe> {
  constructor(
    // Dependency injection
    private readonly userRepository: Repository<User>
  ) {}

  @FieldResolver()
  async author(@Root() recipe: Recipe) {
    // DB 에서 `data` 를 `fetcing` 하므로, 부수효과를 가진 데이터를 활용한다.
    const author = await this.userRepository.findById(recipe.userId);
    if (!author) throw new SomethingWentWrongError();
    return author;
  }
}
```

> 추가적으로, 만약 `resolver object type` 안에 `Field resolver` 의 이름 필드가
> 존재하지 않는다면, `Field resolver` 이름과 함께 스키마 필드가 생성될 것이다.

---

#### 🎥 영화 목록 쿼리

`type-graphql` 을 사용하기 위해 `buildSchema` 로 `schema` 를 만들고,
`ApolloServer` 에 넘긴다

```ts
...
import { buildSchema } from 'type-graphql';
import { FilmResolver } from './resolver/Film';

async function bootStrap() {
  const schema = await buildSchema({
    resolvers: [FilmResolver],
  });
  const server = new ApolloServer({
    schema,
  });
  ...
}
```

이제 앞에서 생성한 `films` 쿼리의 테스트를 위해 서버를 실행해보면
제대로 동작하는것을 볼 수 있다

#### 🤖 클라이언트에서 쿼리 처리

> 이책에서는 `ChakraUI` 를 사용한다.

```sh

npm i @apollo/client graphql

```

그리고 다음과 같이 설정한다

```tsx
import { ChakraProvider, Box, Text, theme } from "@chakra-ui/react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import FilmList from "./components/film/FilmList";

const apolloClient = new ApolloClient({
  // graphql server uri
  uri: "http://127.0.0.1:8000/graphql",
  // apollo client 캐시를 메모리에 캐시
  cache: new InMemoryCache(),
});

export const App = () => (
  // ApolloProvider 에 client 설정
  <ApolloProvider client={apolloClient}>
    <ChakraProvider theme={theme}>
      <Box>
        <Text>Ghibli GraphQL</Text>
        <FilmList />
      </Box>
    </ChakraProvider>
  </ApolloProvider>
);
```

```tsx
import { gql, useQuery } from "@apollo/client";

// gql 을 사용하여 쿼리
const FILMS_QUERY = gql`
  query ExampleQuery {
    films {
      id
      title
      subtitle
    }
  }
`;

export default function FilmList() {
  // 쿼리 데이터를 가져옴
  const { data, loading, error } = useQuery(FILMS_QUERY);

  // loading 일때 리턴
  if (loading) return <p>...loading</p>;
  // error 일때 리턴
  if (error) return <p>{error.message}</p>;

  // 정상적으로 data 를 가져오면 리턴
  return <pre>{JSON.stringify(data, null)}</pre>;
}
```

단순히 이렇게만 했을때, 작동하지 않고 `cors` 오류가 발생했다
이를 해결하기 위해 `server/index.ts` 에 `cors` 를 설정해주어야 한다

```sh

# server/
npm i cors;
npm i -D @types/cors;

```

그리고 `app.use('/graphql')` 에 다음과 같이 `cors` 를 설정한다.

```ts
app.use(
  "/graphql",
  cors({
    origin: "*",
  }),
  expressMiddleware(server)
);
```

이를 통해 모든 `IP` 에서의 접근을 허용하는 `cors` 를 설정했다.
사실, 귀찮아서 이렇게 한것이지, `IP` 허용하는 부분에 대해서는 엄격하게
정해놓는것이 좋다.

여기서 `useQuery` 같은경우 제네릭으로 `type` 을 받아서,
원하는 `data` 타입을 지정하고 사용할수 있다.
이는 더 안전한고 빠른 개발이 가능하게 한다

이를 지원하기 위해 `GraphQL Code Generator` 를 사용하여 `GraphQL` 을
통해 생성된 타입을 사용할수 있도록 한다.

```sh

# 책에서 설치하는 package 들
npm i -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo @graphql-codegen/add

```

:ambulance: 현재 이 패키지는 `@graphql-codegen/client-preset` 을 설치하도록 권장되고 있었다..

[@graphql-codegen/typescript](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript)
[@graphql-codegen/typescript-operations](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations)
[@graphql-codegen/typescript-react-apollo](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-react-apollo)

위에 링크에서 확인 가능하다.
그래서 다음과 같이 설치한다

```sh

npm i -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/add

```

- 💻 [@graphql-codegen/cli](https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config) 는 코드 생성을 위한 `CLI` 이다.
  구성 파일을 사용하여 코드 생성 작업을 할수 있는 툴이다.
  <br/>
- 🥡 [@graphql-codegen/client-preset](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client) 은 선호하는 `GraphQL client` 들과
  완벽하게 통합하기 위해 타입된 `GraphQL` 작업을 제공하는 플러그인 패키지이다.
  <br/>
- ➕ [@graph-codegen/add](https://the-guild.dev/graphql/codegen/plugins/other/add)는 출력파일에 텍스트를 추가하는 플러그인이다.
  출력파일에 `custom code`, `imports`, `comments` 그리고 더 많은 것들을
  추가할수있다.

이를 사용하여 `codegen.yaml` 을 사용하여 설정파일을 작성한다.

```ts
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // 이미 해당 파일이 있다면, 덮어씌우기 위한 설정
  overwrite: true,
  // GraphQL Codegne 이 참조할 서버 주소
  schema: "http://localhost8000/graphql",
  documents: "src/**/*.graphql",
  // 생성할 파일 및 플러그인 preset 설정
  generates: {
    // src/generated/graphql.tsx 로 생성
    "src/generated/graphql.tsx": {
      // preset 은 client
      preset: "client",
      // plugins 는 add 를 사용
      plugins: [
        // eslint 무시하기 위한 주석 설정
        { add: { content: "/* eslint-disable */ " } },
      ],
    },
  },
};

export default config;
```

`web/package.json`

```json
  ...
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    // codegen 을 사용하여 생성
    "codegen": "graphql-codegen --config codegen.ts"
  },
  ...
```

```sh

# codegen 을 실행
npm run codegen;

# ✔ Parse Configuration
# ⚠ Generate outputs
#   ❯ Generate to src/generated/graphql.tsx
#     ✔ Load GraphQL schemas
#     ✖
#       Unable to find any GraphQL type definitions for the following pointers:
#       - src/**/*.graphql
#     ◼ Generate
```

`src/**/*.graphql` 을 찾을수 없다고 나온다.
이는 `documents: "src/**/*.graphql"` 부분에서 아직 `graphql` 쿼리 도크먼트를
생성하지 않았기 때문이다.

`queries/films.graphql`

```ts

query Films {
  films {
    id
    title
    subtitle
  }
}

```

쿼리할 `graphql` 을 생성했다.

```sh

npm run codegen

> web@0.1.0 codegen
> graphql-codegen --config codegen.ts

✔ Parse Configuration
✔ Generate outputs

```

제대로 생성된 것을 볼수있다.

> 💢 책과는 달리 `hooks` 가 자동생성되지 않는다.
> `@graphql-codegen/client-preset` 으로 통합되면서 기존에 제공되던
> `@graphql-codegen/typescript-react-apollo` 에서 제공되던 `withHooks` 가
> 없어진듯 하다.
>
> ❓ [Client preset doesn't generate React hooks for Apollo Client](https://github.com/dotansimha/graphql-code-generator/discussions/9563) 에서 `issue` 로 올린 글이 있었다.
>
> **_`withHooks` 가 없다고 하자_**
>
> > 답변이 왜 제공되야 하느냐며 **왜 `TypedDocumentNode` 를 사용하지 않는지 답문** 하고 있다.. 👼
> >
> > 🥹 **만든 개발자 마음대로가 맞지...** 그래도 만들어줘서 고맙다
>
> `@graphql-codegen/client-preset` 자체에서 굳이 제공할 필요성을 못느끼는 상황인것 같다.
>
> `react` 뿐 아니라 `vue` 도 제공같이 제공한다고하니, 호환성 문제도 있을듯 싶다...
> `@graphql-codegen/client-preset` 을 권장하다고 하니, 그냥 쓰자..
>
> `hooks` 는 그냥 직접 만들자..

`hooks/useFilmsQuery`

```tsx
import { useQuery } from "@apollo/client";
import { gql } from "../../generated";

const useFilmsQuery = () => {
  const films = gql(
    `query Films {\n  films {\n    id\n    title\n    subtitle\n  }\n}`
  );

  const { data, error, loading } = useQuery(films);
  return { data, error, loading };
};

export default useFilmsQuery;
```

`components/films/FilmList.tsx`

```tsx
import useFilmsQuery from "../../hooks/queries/useFilmsQuery";

export default function FilmList() {
  const { data, loading, error } = useFilmsQuery();

  if (loading) return <p>...loading</p>;
  if (error) return <p>{error.message}</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

나머지 내용은 별 내용이 없어서 :racing_car: 패스한닷!!
