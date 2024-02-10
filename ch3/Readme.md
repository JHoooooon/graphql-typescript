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

## 📖 페이지 네이션

페이지네이션은 서버와 클라이언트에서 모두 처리해야 하며
보통은 2가지 방식으로 나뉜다

- 👉 **Offset 기반**
  쿼리 결과에서 이전 목록의 개수를 건너띄고, 이후의 목록을 가져오는방법

```ts
const LIMIT = 10;
const OFFSET = CURRENT_PAGE * LIMIT;

await query(`SELECT * FROM Films LIMIT ?, ?`, [OFFSET, LIMIT]);
// OFFSET = 0, LIMIT = 10 -> 처음부터 10개 쿼리
// OFFSET = 10, LIMIT = 10 -> 10 개 오프셋, 오프셋 이후의 10개 쿼리
// ....
```

😡 **단점**

1. `Offset 기반` 의 단점은, 페이지 요청시 데이터 중복발생할수 있다는것이다.
   사용자가 다음페이지는 눌렀는데, 그순간 게시물이 올라갔다고 해보자.
   그럼 이전 페이지의 마지막 게시물은 다음 페이지로 넘어가며,
   중복된 게시물을 보게된다.
   <br/>

2. `DB` 데이터가 많을수록 퍼포먼스 이슈가 있을수 있다는 점이다.
   `offset` 은 지정한 개수만큼 자르고, 이후 목록을 반환하는 방식이다.
   이는 지정한 개수가 크면 클수록 `DB` 에 부담이 될 수 있다.

- 👉 **Cusor 기반**
  쿼리 결과의 마지막 `data` 의 `id` 를 기점으로 하여, 나머지 목록을
  요청하는 방법 <br/>
  이는 `offset` 과는 다르게 특정 `id` 와 같은 인덱스를 기준으로 하므로
  전체 `DB` 스캔없이 이후 데이터만 가져오면 된다.<br/>
  이는 데이터가 많아져도 전혀 문제없이 작동한다.

```ts
const LIMIT = 10;
const CURSOR = films[LIMIT].id; // id 값이 숫자이며, autoGenerated 이면
// id 값으로 비교한다.
// 그렇지 않으면, 보통 `Date` 값으로
// 비교한다.

await query(`SELECT * FROM Films WHERE id < ? ORDER BY id DESC limit ? , `, [
  CURSOR,
  LIMIT,
]);
```

이러한 부분에 대한 문제로 인해
요새는 `Cursor 기반` 을 많이 사용하는듯 보인다

이책에서도 `Cursor` 기반으로 코드를 작성한다.

```ts
import {
  Arg,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Film } from "../entities/Film";
import ghibliData from "../data/ghibli";
import { Director } from "../entities/Director";

@ObjectType()
class PagenatedFilms {
  @Field(() => [Film])
  films: Film[];

  @Field(() => Int, { nullable: true })
  cursor?: Film["id"] | null;
}

// @Resolver 데커레이터를 사용
@Resolver(Film)
export class FilmResolver {
  // @Query 데커레이터를 사용하여
  // 쿼리 가능하게 변경
  @Query(() => PagenatedFilms)
  films(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 6 }) limit: number,
    @Arg("cursor", () => Int, { nullable: true, defaultValue: 1 })
    cursor: Film["id"]
  ): PagenatedFilms {
    // limit 값이 최대 6 임을 고정
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
    const result = ghibliData.films.slice(
      cursorDataIndex,
      cursorDataIndex + realLimit
    );

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
}
```

## 📜 무한 스크롤 구현

영화 목록에서는 페이지 네이션보다는 무한스크롤이 더 적합하다.
그러므로 이를 구현한다

---

### :eye: `Intersection Observer API`

무한스크롤 적용시에는 `Intersection Observer API` 가 적격이다.
이는 `HTML5` 에서 제공해주는 `API` 로 `root` 로 지정한 컨테이너 박스가
지정한 교차영역을 넘어서면 `callback` 이 실행되는 원리이다.

```ts
let options = {
  root: document.querySelector("#scrollArea"),
  rootMargin: "0px",
  threshold: 1.0,
};

let observer = new IntersectionObserver(callback, options);
```

- **root**
  뷰포트로 사용되는 `element`
  이 요소는 `observer` 의 `callback` 이 언제 실행될지 제어해주는 역할이다.
  <br/>
- **rootMaring**
  `root` 로 지정한 뷰포트의 여백을 지정한다
  기본값은 `0` 이다
  <br/>
- **threshold**
  `observer` 의 콜백을 호출되는 대상의 가시성을 나타낸다
  이는 백분율이 되는 숫자 또는 배열이다.

```ts
let target = document.querySelector("#listItem");
observer.observe(target);

// observer를 위해 설정한 콜백은 바로 지금 최초로 실행됩니다
// 대상을 관찰자에 할당할 때까지 기다립니다. (타겟이 현재 보이지 않더라도)
```

타겟 요소를 지정한다
그럼 `root` 로 지정한 요소가 뷰포트상에 `threshold` 만큼 보이면
`target` 요소를 `callback` 을 통해 컨트롤한다

`callback` 은 다음과 같다

```ts
let callback = (entries, observer) => {
  entries.forEach((entry) => {
    // 각 엔트리는 관찰된 하나의 교차 변화을 설명합니다.
    // 대상 요소:
    //   entry.boundingClientRect
    //   entry.intersectionRatio
    //   entry.intersectionRect
    //   entry.isIntersecting
    //   entry.rootBounds
    //   entry.target
    //   entry.time
  });
};
```

여기서 `entry` 타입은 [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) 이다.
normalization

> `root` 를 지정했다면, `target` 은 `root` 의 하위요소여야만 한다.

---

> 책에서는 `React-WayPoint` 를 사용하여 구현했다
> 나는 `IntersectionObserver` 를 통해 직접 대략적으로 구현해본다

이를 `Scroller.tsx` 를 통해 구현한다.

```tsx
import React, { useCallback, useEffect, useRef } from "react";
import { FilmsQuery } from "../../generated/graphql";
import { Box } from "@chakra-ui/react";

interface ScrollerProps {
  // 스크롤러를 적용할 children
  children: React.ReactElement;
  // intersectionObjserver 의 callback 에서 실행할
  // 함수
  onEnter: () => void;
  // 다음에 query 할 cursor
  lastCursor: FilmsQuery["films"]["cursor"];
  // data 를 loading 중인지 확인
  isLoading: boolean;
}

const Scroller = ({
  children,
  onEnter,
  isLoading,
  lastCursor,
}: ScrollerProps) => {
  // intersectionObserver 의 target ref
  const target = useRef<HTMLDivElement>(null);

  // intersection observer callback 함수
  const scrollerAction: IntersectionObserverCallback = useCallback(
    (entries) => {
      entries.forEach((entity) => {
        // intersecting 되고 lastCursor 가 있다면
        // onEnter 실행
        if (entity.isIntersecting && lastCursor) {
          onEnter();
        }
      });
    },
    [onEnter, lastCursor]
  );

  useEffect(() => {
    // threshold: 0.8 일때 scrollerAction 실행
    const observer = new IntersectionObserver(scrollerAction, {
      threshold: 0.8,
    });
    // target.current
    if (target.current) {
      // loading 중이라면 unobserve
      // data 를 받아오는중에 작동을 방지
      if (isLoading) {
        observer.unobserve(target.current);
      } else {
        // loading 이 완료되면 observe 실행
        observer.observe(target.current);
      }
    }
    return () => observer.disconnect();
  }, [target, scrollerAction, isLoading]);
  return (
    <>
      {/* children */}
      <div>{children}</div>
      {/* lastCursor 가 있다면, intersectionObserver target 활성화 */}
      {lastCursor && <Box ref={target} h={100} w={"100%"}></Box>}
    </>
  );
};

export default Scroller;
```

현재, `NetWork tab` 에서는 `query` 를 받아오는데, `curser` 가 `13` 이다.
이는 예상한 결과이다.

`Chrome Network Tab graphql 응답값`

```json
{
  "data": {
    "films": {
      "cursor": 13,
      "films": [
        {
          "id": 7,
          "title": "하울의 움직이는 성",
          "subtitle": "소녀가 마법에 걸린 순간 마법사의 성문이 열렸다",
          "runningTime": 119,
          "director_id": 1,
          "release": "2004/12/23",
          "director": {
            "id": 1,
            "name": "미야자키 하야오",
            "__typename": "Director"
          },
          "posterImg": "https://www.ghibli.jp/images/howl.jpg",
          "description": "19세기 말 마법과 과학이 공존하고 있는 세계 앵거리. 소피는 돌아가신 아버지의 모자상점에서 쉴틈없이 일하는 18살 소녀이다. 어느 날 오랫만에 마을로 나간 소피는 우연히 하울을 만나게 된다. 하울은 왕실 마법사로서 핸섬하지만 조금 겁이 많은 청년이다. 황무지 마녀는 두 사람의 사이를 오해, 주문을 걸어 소피를 90살의 늙은 할머니로 만들어 버린다. 가족을 걱정한 소피는 집을 나오게 되고 황무지를 헤매다가 하울이 사는 성에서 가정부로 낯선 생활을 시작한다. 4개의 다리로 걷는 기괴한 움직이는 성 안에서 하울과 소피의 기묘한 사랑과 모험이 시작되는데...",
          "genre": "판타지,애니메이션,모험",
          "__typename": "Film"
        },
        {
          "id": 8,
          "title": "추억의 마니",
          "subtitle": "놀랍고도 비밀스러운 시공을 초월한 판타지",
          "runningTime": 103,
          "director_id": 4,
          "release": "2015/03/19",
          "director": {
            "id": 4,
            "name": "요네바야시 히로마사",
            "__typename": "Director"
          },
          "posterImg": "https://www.ghibli.jp/images/marnie.jpg",
          "description": "12살 소녀 안나는 요양차 방문한 바닷가 마을에서 어디서 본 듯한 낡은 저택을 발견한다. 아무도 살지 않는 듯 보이는 그 곳에서 안나는 금발의 아름다운 소녀 마니를 만나게 된다. 안나는 마니의 초대로 저택의 파티에 참가하지만 신기하게도 다음날 낮에 찾아간 저택은 아무도 살지 않은 폐가가 되어 있다. 그 이후로도 안나와 마니는 함께 시간을 보내지만 알 수 없는 일들이 자꾸 일어난다. 갑자기 마니는 사라져 버리고 낡은 저택에 새롭게 이사온 소녀 사야카는 자신의 방에서 우연히 마니의 일기장을 찾게 된다. 안나와 사야카는 상상조차 할 수 없었던 놀라운 이야기를 발견하게 되는데...",
          "genre": "애니메이션,드라마",
          "__typename": "Film"
        },
        {
          "id": 9,
          "title": "센과 치히로의 행방불명",
          "subtitle": "금지된 세계의 문이 열렸다",
          "runningTime": 124,
          "director_id": 1,
          "release": "2002/06/28",
          "director": {
            "id": 1,
            "name": "미야자키 하야오",
            "__typename": "Director"
          },
          "posterImg": "https://www.ghibli.jp/images/chihiro.jpg",
          "description": "평범한 열 살 짜리 소녀 치히로 식구는 이사 가던 중 길을 잘못 들어 낡은 터널을 지나가게 된다. 터널 저편엔 폐허가 된 놀이공원이 있었고 그곳엔 이상한 기운이 흘렀다. 인기척 하나 없는 이 마을의 낯선 분위기에 불길한 기운을 느낀 치히로는 부모님에게 돌아가자고 조르지만 부모님은 호기심에 들떠 마을 곳곳을 돌아다니기 시작한다. 어느 음식점에 도착한 치히로의 부모님은 그 곳에 차려진 음식들을 보고 즐거워하며 허겁지겁 먹어대다가 돼지로 변해버린다. 겁에 질려 당황하는 치히로에게 낯선 소년 하쿠가 나타나 빨리 이곳을 나가라고 소리치는데...",
          "genre": "애니메이션,가족,판타지",
          "__typename": "Film"
        },
        {
          "id": 10,
          "title": "모노노케 히메",
          "subtitle": "대자연의 수호신 원령공주가 온다",
          "runningTime": 135,
          "director_id": 1,
          "release": "2003/04/25",
          "director": {
            "id": 1,
            "name": "미야자키 하야오",
            "__typename": "Director"
          },
          "posterImg": "https://www.ghibli.jp/images/mononoke.jpg",
          "description": "북쪽의 끝, 에미시족의 마을에 어느 날 갑자기 재앙신이 나타나 마을을 위협한다. 이에 강한 힘을 소유한 에미시족의 후계자인 아시타카는 결투 끝에 포악해진 재앙신을 쓰러트리지만 싸움 도중 오른팔에 저주의 상처를 받고 죽어야 할 운명에 처하게 된다. 결국 재앙신의 탄생 원인을 밝혀 자신의 저주를 없애기 위해 서쪽으로 길을 떠난 아시카타는 여행 중에 지코라는 미스테리한 수도승을 만나 재앙 신이 생겨나게 된 이유가 서쪽 끝에 있는 시시신의 숲과 관련이 깊다는 이야기를 듣게 되고 한시 바삐 서쪽으로 향한다.",
          "genre": "모험,판타지,애니메이션",
          "__typename": "Film"
        },
        {
          "id": 11,
          "title": "귀를 기울이면",
          "subtitle": "설레이는 첫사랑의 기억이 들려온다",
          "runningTime": 111,
          "director_id": 2,
          "release": "2007/12/22",
          "director": {
            "id": 2,
            "name": "콘도 요시후미",
            "__typename": "Director"
          },
          "posterImg": "https://www.ghibli.jp/images/mimi.jpg",
          "description": "중학교 3학년 시즈쿠는 평소 책을 많이 읽는 소녀. 여름방학, 매번 도서카드에서 먼저 책을 빌려간 세이지란 이름을 발견하고 호기심을 갖는다. 어느 날 지하철 안에서 혼자 탄 고양이를 보게 된다. 신기하게 여긴 시즈쿠는 고양이를 따라가다 골동품 가게에 들어가게 되고, 그곳에서 주인 할아버지와 손자를 보게 된다. 그 손자는 다름 아닌 아마사와 세이지, 사춘기의 두 사람은 점차 서로의 사랑에 대해 알게 된다. 시즈쿠는 바이올린 장인을 자신의 장래로 확실히 정한 세이지를 보면서 자신의 꿈과 미래를 진지하게 고민하게 된다. 그 후 이탈리아 연수를 간 세이지가 돌아올 때 까지 작가가 되고자 도전해 보기로 하는데...",
          "genre": "애니메이션,드라마,가족",
          "__typename": "Film"
        },
        {
          "id": 12,
          "title": "폼포코 너구리 대작전",
          "subtitle": "맘고생 심한 너구리들의 인간연구 프로젝트!",
          "runningTime": 119,
          "director_id": 3,
          "release": "2005/04/28",
          "director": {
            "id": 3,
            "name": "다카하타 이사오",
            "__typename": "Director"
          },
          "posterImg": "https://www.ghibli.jp/images/tanuki.jpg",
          "description": "도쿄 근방의 타마 구릉지. 두 무리로 나뉘어 살던 너구리들은 도쿄의 개발 계획인 뉴타운 프로젝트로 인해 그들의 숲이 파괴되자, 이에 대항하기 위해 중지되어 있던 변신술의 부흥과 인간연구 5개년 계획을 추진하기로 합의한다. 또한 시코쿠와 사도 지방에 살고 있는 전설의 장로 등에게도 원군을 청하기로 하고 가위 바위 보 시합을 통해 사자를 보낸다. 너구리들은 외부의 원군이 오기를 기다리며, 변신술 특훈과 변신술을 이용한 게릴라 작전으로 인간들의 개발 계획과 공사를 방해하지만 결국 뉴타운 개발 계획 저지에는 효과가 거의 없다는 것을 깨닫게 된다. 이 때, 그토록 기다리던 전설의 장로 3명이 시코쿠 지방에서 도착하는데...",
          "genre": "모험,애니메이션,판타지",
          "__typename": "Film"
        }
      ],
      "__typename": "PagenatedFilms"
    }
  }
}
```

여기서 문제가 발생한다.

`fetchMore` 를 통해 추가적인 데이터 목록을 얻으려고 하지만
목록 반영이 되지 않는다.

🥹 **뭔가 잘못되었다.**

❗ 이는 `Apollo Client Cache Policy` 에 대한 이해도가 필요하다

**이참에 `Apollo Client` 의 `Cache` 에 대해서 정리해본다**

---

#### 📥 Caching in Apollo Client

> [Caching in Apollo Client](https://www.apollographql.com/docs/react/caching/overview/) 에 나온 내용을 대략적으로 정리해나간다

`Apollo Client` 는 `GraphQL` 쿼리의 결과를 정규화된 로컬 인메모리 캐시로 저장한다

이는 **저장된 쿼리가 존재한다면, 네트워크 요청을 하지 않고 인메모리 캐시에서  
값을 가져온다**

`Apollo Client Cache` 는 고도로 구성가능하다

이는 `Schema` 의 `field`, `Type` 을 사용자 정의에 맞게 커스터마징 가능하고
`GraphQL server`에서 가져오지 않은 로컬 데이터를 저장하고 상호 작용하는데
사용가능하다

##### 🖐️ How is data store?

`Apollo Client` 는 `InMemoryCache` 저장소를 사용하며, 이는
객체의 **Flat lookup table** 로 이루어져 있다

이는 `GraphQL` 쿼리에 대해 리턴된 `Objects` 에 대응되는 `Objects` 이다.

`GraphQL` 에서 반환된 객체는 `flat` 하지 않으며, 이는 다음처럼 구성된다

```json
{
  "data": {
    "person": {
      "__typename": "Person",
      "id": "cGVvcGxlOjE=",
      "name": "Luke Skywalker",
      "homeworld": {
        "__typename": "Planet",
        "id": "cGxhbmV0czox",
        "name": "Tatooine"
      }
    }
  }
}
```

`InMemory` 저장소는 중첩된 에디터를 어떻게 `flat lookup table` 로  
만들수있을까?

이를 위해서 `nomalize` 가 필요하다.

###### 🫓 Data normalization

응답된 `query` 데이터를 받아 `cache` 할때 마다 다음의 과정이 이루어진다

1. 🖊️ **Identify Object**
   캐시는 `query` 응답에 포함된 모든 각 객체를 식별한다
   <br/>

2. 🏭 **Generate cache IDs**
   캐시는 모든 객체를 식별한후 각 개체에 대한 `cache ID` 를 생성한다
   이 `cache ID` 는 `InMemoryCache` 에서 각 객체에 대한 고유한 식별자이다 <br/>
   `Person: cGVvcGxlOjE=`
   `Planet:cGxhbmV0czox`<br/>
   만약, 각 객체에 `cache ID` 가 생성되지 않았다면, 부모 객체안에
   즉각적으로 캐시된다.
   그리고 그 객체는 반드시 부모 객체를 통해 참조해야한다<br/>
   ⚠️ **이는 `cache` 가 반드시 `flat` 하지 않다는것을 의미하기도 한다.**
   <br/>

3. 💱 **Replace object field with references**
   다음으로 캐시는 객체에 포함된 각 필드가지고 해당 값을 객체에 대한 참조로써 값을 변경한다.<br/>
   나중에 다른 `Person` 데이터를 요청했으나, 같은 `homeworld` 를 가진다면,
   `cache` 된 `homeworld` 를 참조한다<br/>
   이러한 동작방식은 `data` 중복을 극단적으로 줄여주며, 서버에 대한 데이터와
   로컬 데이터를 최신상태로 유지하는데 도움이 된다.<br/>
   글로만 보면 애매할수 있다 다음을 보면 바로 이해가 된다<br/>

```json
{
  "__typename": "Person",
  "id": "cGVvcGxlOjE=",
  "name": "Luke Skywalker",
  //------ 이부분을 참조값으로 변경한다 -------
  "homeworld": {
    "__typename": "Planet",
    "id": "cGxhbmV0czox",
    "name": "Tatooine"
  }
}
```

```json
{
  "__typename": "Person",
  "id": "cGVvcGxlOjE=",
  "name": "Luke Skywalker",
  //`homeworld` 필드는 참조를 가지며,
  // 적절하게 `normalize` 된 `Planet` 객체를 가리킨다
  "homeworld": {
    "__ref": "Planet:cGxhbmV0czox"
  }
}
```

> ⚠️ 만약, `cache ID` 생성에 실패한다면, `normalize` 되지 않으며 참조값도
> 없다. 대신에 원래 객체를 할당한다

<!-- markdownlint-disable MD029 -->

4. 📥 **Store nomalized obejcts**
   마지막으로 만들어진 `objects` 들은 `cache` 의 `flat lookup table` 에
   모두 저장된다</br> 하지만 다음과 같은 경우가 발생할 수 있다<br/>
   :paperclip: **Deep Merge**
   들어오는 객체가 존재하는 캐시 객체와`ID` 가 같을때, 해당 객체의 필드는 병합된다<br/>
   📎 **Overwirte**
   만약 들어오는 객체의 필드가 기존의 객체의 필드를 공유한다면, 들어오는
   객체의 필드로 덮어씌어진다<br/>
   📎 **Preservation of field**
   기존의 객체에만 필드가 있거나, 들어오는 객체에만 있는 필드가 있다면
   그 필드는 보존한다

#### :keyboard: Configurating the Apollo Client cache

> [Configurating the Apollo Client cache](https://www.apollographql.com/docs/react/caching/cache-configuration) 의 내용을 정리한다

`cache setup` 과 `configuration` 에 대해서 서술한다
이는 어떻게 `cache` 된 데이터와 상호작용하는지 배울수 있다.

`InMemoryCache` 객체를 생성하는 코드는 다음과 같다

```ts

cont { InMemoryCache, ApolloClient } from '@apllo/client';

const client = new ApolloClient({
  //...other options
  cache: new InMemoryCache(options)
})

```

여기에서 제공되는 `options` 를 살펴본다

##### ✏️ Configuration options

`chche` 설정은 좀더 어플리케이션에 잘 맞도록 `cache` 조작을 해준다
이는 다음과 같은 상황에 사용된다.
<br/>

- 특정 유형의 `cacheID` 포멧을 사용자 정의
  <br/>

- 개별 `fields` 의 검색 및 저장 사용자 정의
  <br/>

- `Fragment matching` 에 대한 다형성 관계 타입 저의
  <br/>

- 클라이언트 쪽 `local state` 관리
  <br/>

이는 다음과 같은 설정옵션이 존재한다.

| name / type                         | description                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **addTypename**<br/>`Boolean`       | 만약 `true` 라면, 캐시는 나가는 모든 객체에 대해<br/>자동적으로 `_typeaname` 필드를 요청한다<br/>이 말은, 작업 정의로 부터 `__typename` 을 생략할수 있다는 의미이기도 하다.<br/><br/>기본값으로 `cache` 는 모든 캐시된 객체에서 `cache ID` 의 한부분으로써<br/> `__typename` 필드를 사용한다. 그래서 이 필드를 항상 가져오는것이 도움이 된다.<br/><br/>`default` 값으로 `true`                                                                                   |
| **resultCaching**<br/>`Boolean`     | 만약 `true` 라면, `data` 가 변경되지 않는한, <br/> 동일한 `query` 는 항상 같은(`===`) 객체로 응답한다<br/>이는 `query` 결과가 변경되었는지 확인하는데 도움이 된다<br/><br/>`default` 값으로 `true`                                                                                                                                                                                                                                                               |
| **resultCachMaxSize**<br/>`number`  | 객체의 개수 제한옵션이며, 이 옵션은 캐시에 대한 반복된 읽기의 속도를 높이기 위해 메모리에 유지된다 <br/><br/>`default` 값으로 `Math.pow(2, 16)`                                                                                                                                                                                                                                                                                                                  |
| **passibleTypes**<br/>`Object`      | 이 객체는 `schema` 타입 사이의 다형성 관계를 정의한다.<br/>그래서 `union` 또는 `interface` 로 캐시된 데이터를 찾을수 있다<br/><br/>이 객체의 각 `key` 는 `union` 또는 `interface` 의 `__typename` 이고<br/> `value` 는 구현된 `interface` 혹은 `union` 에 속한 타입들의 `__typename` 들의 배열이다 <br/><br/> 예시는 [Defining possibleTypes manually.](https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually) 에서 볼수있다. |
| **typePolices**<br/>`Object`        | `Type` 별 캐시 동작을 사용자정의하는 객체이다<br/><br/>각 `Key` 는 사용자정의를 위한 `type` 의 `__typename` 이며, `Value` 는 `TypePolicy` 객체에 대응된다 <br/><br/> [TypePolicy object](https://www.apollographql.com/docs/react/caching/cache-configuration/#typepolicy-fields) 를 살펴보자.                                                                                                                                                                   |
| **dataIdFromObject**<br/>`Function` | 이 함수는 응답 객체를 인자로 가지며, 저장소안에 `data` 가 `normalize` 될때 사용될 고유한 식별자를 리턴한다 <br/><br/>자세한건 [Customizing identifier generation globally](https://www.apollographql.com/docs/react/caching/cache-configuration) 을 보도록 하자                                                                                                                                                                                                  |

> 현재 책에서 사용하는 방식으로 `typePolices` 를 설정하고 있다
> 이부분에 대해서 추가로 정리한다

###### TypePolicy Fields

캐시가 `Schema` 에 지정된 타입과 상호작용을 하기 위해서
`InMemoryCache` 생성자 객체에 `__typename` 문자열이 매핑된 `TypePolicy` 객체를 전달할수 있다

`TypePolicy` 객체는 다음의 필드를 포함한다

```ts
type TypePolicy = {
  // 다음중 하나로 이 타입의 고유 키 정의를 허용한다
  //
  // - 필드이름의 배열(KeySpecifier),
  // - 임의의 문자열을 반환하는 함수(KeyFieldsFunction)
  // - false: false 는 이 타입의 객체를 위해
  //   `normalization` 을 비활성화한다
  keyFields?: KeySpecifier | KeyFieldsFunction | false;

  // 만약 스키마가 `Root Query`, `Mutation`, `Subscription`
  // 타입들에서 어떠한 사용자 정의 __typename 을 사용한다면
  // 아래의 `field` 에 `true` 로 설정한다
  // 이는 이유형이 사용자 정의 유형으로 사용됨을 가리킨다
  queryType?: true; // Root Query
  mutationType?: true; // Mutation
  subscriptionType?: true; // Subscription

  fields?: {
    [fieldName: string]:
      | FieldPolicy<StoreValue>
      | FieldReadFunction<StoreValue>;
  };
};

// Typescriot 3.7 에서 사용된 재귀 타입 별칭이 사용된다
// 실제 유형이지만 다음처럼 사용한다
type KeySpecifier = (string | KeySpecifier)[];

type KeyFieldsFunction = (
  object: Readonly<StoreObject>,
  context: {
    typename: string;
    selectionSet?: SelectionSetNode;
    fragmentMap?: FragmentMap;
  }
) => string | null | void;
```

자!! 이제 타입에 대해서 살짝 맛보았다.
그럼 어떻게 `Customizing` 하는지 보도록 한다

###### 🧰 Customizing the behavior of chaced fields

각 `field` 를 커스터마이즈 할수 있는 `cache` 는 쓰고 읽을수 있다
이를 위해서, `field` 를 위한 `field policy` 를 정의한다.

`field policy` 는 다음을 포함한다

- **`read` 함수**
  `field` 들에 캐시된 값을 읽을때 발생하는 작업을 지정하는 함수
  <br/>

- **`merge` 함수**
  `field` 들에 캐시된 값을 쓰기할때 발생하는 작업을 지정하는 함수
  <br/>

- **`key arguments` 의 배열**
  캐시에 불필요한 중복되는 데이터 저장을 방지하기위해 도움을 주는 배열
  <br/>

각 `field` 정책은 `parent type` 필드에 해당하는 `TypePolicy Object` 내부에
정의된다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Person: {
      fields: {
        name: {
          read(name) {
            // Return the cached name, transformed to upper case
            return name.toUpperCase();
          },
        },
      },
    },
  },
});
```

이 `field policy` 는 `reac function` 이 지정되었으며, `Person.name` 이
쿼리될때마다 캐시가 리턴한다.

**_The read function_**

`field` 에 `read` 함수가 정의되었다면, `Client` 에서 이 `field` 를
쿼리할때마다 `cache` 는 이 함수를 호출한다

`query` 응답에서, 캐시된 필드 값 대신에 이 `field` 에 `read` 함수에서  
리턴한 값으로 채워진다

모든 `read` 함수는 두개의 인자를 전달한다

- **첫번째 인자는 필드에 현재 캐시된 값**이다.(만약 하나만 존재한다면,)
  이는 계산된 값을 리턴하는데 도움을 주기 위해 사용된다

```ts
existing: Readonly<TExisting> | undefined,
```

- 두번째 인자는 객체이며, **필드로 전달된 인자를 포함하며, `helper` 함수 그리고 각 프로퍼티에 접근을 제공하기 위한 객체** 이다.

```ts
interface FieldFunctionOptions {
  // 인메모리 캐시
  cache: InMemoryCache;

  // 변수 적용이후 필드에 전달된 최종 arguments 값,
  // 만약 제공된 `arguments` 가 없다면 이 프로퍼티는 null 이다
  args: Record<string, any> | null;

  // 필드의 네임이다. `options.field` 가 존재한다면
  // `options.field.name.vlaue` 와 같다
  // 이는 여러 `fields` 에서 같은 함수 재사용을 원하거나,
  // 현재 진행중인 `field` 를 알고싶을때 유용하다
  // options.field 가 null 이더라도 항상 string 타입이다
  fieldName: string;

  // 이 `field` 를 읽기위해 사용되는 `FieldNode` 객체이다
  // 만약 `field` 의 다른`attributes` 에 대해서 알고 싶을때 유용하다.
  // 이 옵션은 `options.readField` 에 `string` 이 전달될때 `null` 이다
  field: FieldNode | null;

  // 이 필드에 있는 쿼리를 읽을때 제공되는 변수들이다
  // 만약 변수들이 제공되지 않는다면, `undefined` 일수 있다
  variables?: Record<string, any>;

  // 쉽게 {__ref: string} 참조 객체를 감지한다
  isReference(obj: any): obj is Reference;

  // Returns a Reference object if obj can be identified, which requires,
  // at minimum, a __typename and any necessary key fields. If true is
  // passed for the optional mergeIntoStore argument, the object's fields
  // will also be persisted into the cache, which can be useful to ensure
  // the Reference actually refers to data stored in the cache. If you
  // pass an ID string, toReference will make a Reference out of it. If
  // you pass a Reference, toReference will return it as-is.
  //
  // 이 helper 함수는 ref 를 생성하거나, 정규화하는데 사용된다
  // - objOrIdOrRef: 캐시 참조로 변환하거나 정규화하려는 객체, ID, 또는
  //                 참조이다.
  //                 - `StoreObject: 캐시에 저장된 정규화된 객체
  //                   `__typename`: 과 식별자(id) 가 있어야 한다
  //                 - string: 고유 식별자(id)
  //                 - Reference: 기존 캐시 참조
  // - mergeIntoStore?: `ture` 로 설정하면 `cache` 에 병합하는지 여부를 나타낸다
  //                    `mergeIntoStore` 가 `false` 이거나 제공되지 않으면
  //                    참조가 캐시에 자동으로 추가되지 않는다.
  //
  // // Example object representing a User in the cache
  // const objectInCache = {
  //   __typename: 'User',
  //   id: '123',
  //   name: 'John Doe',
  // };

  // // Convert the object to a cache reference
  // const reference = toReference(objectInCache);

  // // Alternatively, you can create a reference from an ID
  // const idReference = toReference('123');

  // // Output values:
  // // reference: { __ref: 'User:123' }
  // // idReference: { __ref: '123' }
  //
  toReference(
    objOrIdOrRef: StoreObject | string | Reference,
    mergeIntoStore?: boolean
  ): Reference | undefined;

  // Helper function for reading other fields within the current object.
  // If a foreign object or reference is provided, the field will be read
  // from that object instead of the current object, so this function can
  // be used (together with isReference) to examine the cache outside the
  // current object. If a FieldNode is passed instead of a string, and
  // that FieldNode has arguments, the same options.variables will be used
  // to compute the argument values. Note that this function will invoke
  // custom read functions for other fields, if defined. Always returns
  // immutable data (enforced with Object.freeze in development).
  //
  // 현재 객체안에 다른 `fields` 를 읽기위한 핼퍼함수이다
  // 만약 제공된 참고 또는 외부 객체가 있다면(foreignObjOrRef),
  // 이 필드는 현재 객체 대신에 제공된 객체의 필드를 읽을것이다.
  //
  // 외부 객체 일경우이 함수는 캐시에 저장된 객체인지 검사하기 위해
  // `isReference` 와 함께 사용될수 있다
  // `isReference` 는 `{ __ref: string }` 을 가졌는지 확인하는
  // 헬퍼함수이다
  //
  // nameOrField 에 `string` 대신 `FieldNode` 가 전달되었고
  // `FieldNode` 에 인자를 가졌다면, 이는 `options.variables` 에서
  // 계산된 `arguement` 값들을 사용한것과 같다
  // (이부분은 options 관련 문서를 살펴봐야 겠다...)
  //
  // 이 함수가 다른 `field` 들과 `read` 함수에 정의된 경우 항상
  // `imutable data` 를 반환한다
  //
  readField<T = StoreValue>(
    nameOrField: string | FieldNode,
    foreignObjOrRef?: StoreObject | Reference
  ): T;

  // Returns true for non-normalized StoreObjects and non-dangling
  // References, indicating that readField(name, objOrRef) has a chance of
  // working. Useful for filtering out dangling references from lists.
  //
  // 이는 정규화되지 않은 저장객체, non-dangling 참조 일 경우 `true` 를
  // 리턴한다.
  // 이는 `readField` 없이 읽을수 있는 객체라는 뜻이다
  //
  // readField 는 `__ref` 를 사용하여 정규화된 객체를 읽어서
  // 중첩된 객체를 반환하므로, `canRead` 로 구분하여 처리 가능하다
  //
  canRead(value: StoreValue): boolean;

  // A handy place to put field-specific data that you want to survive
  // across multiple read function calls. Useful for field-level caching,
  // if your read function does any expensive work.
  //
  // 여러 `read` 함수 호출에서 유지하려는 필드별 데이터를 저장하는
  // 편리한 장소이다.
  //
  // read 함수에서 비싼 작업을 한다면, field-level 캐싱에
  // 유용하다
  storage: Record<string, any>;

  // Instead of just merging objects with { ...existing, ...incoming }, this
  // helper function can be used to merge objects in a way that respects any
  // custom merge functions defined for their fields.
  //
  // 단순히 { ...existsing, ...incoming} 와 병합하는 대신
  // 자신의 필드가 정의된 custom merge function 를 고려하는 방식으로
  // 객체 머지를 사용할수 있는 헬퍼 함수이다
  mergeObjects<T extends StoreObject | Reference>(
    existing: T,
    incoming: T
  ): T | undefined;
}
```

> 대략적으로 알아보았지만, 실제 사용하는데 어떻게 사용할지
> 애매하다...
>
> 몇몇 부분은 해석하는데 약간의 어려움이 있는것 같다...

다음의 `read` 함수는 `cache` 에서 `Person` 타입의 `name` 필드가 존재하지 않는다면, `Person` 타입의 `name` 필드에 `default` 값인 `UNKNOW NAME` 을
리턴한다.

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Person: {
      fields: {
        name: {
          read(name = "UNKNOWN NAME") {
            return name;
          },
        },
      },
    },
  },
});
```

**_Handling field arguments_**

만약 `field` 에 `arguments` 가 있다면, `read` 함수는 두번째 인자가 가진
`args` 객체에 해당 `field` 의 `arguments` 의 값을 가진다

예를들어서, `read` 함수의 `name` 필드에서 `maxLength` `arguments` 가 있는지 없는지 확인한다.

만약 제공된다면, 함수는 `person.name` 의 `maxLength` 만큼의 문자열을
리턴한다.

그렇지 않으면 `person.name` 전체를 리턴한다
이는 다음의 코드와 같다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Person: {
      fields: {
        // If a field's TypePolicy would only include a read function,
        // you can optionally define the function like so, instead of
        // nesting it inside an object as shown in the previous example.
        name(name: string, { args }) {
          if (args && typeof args.maxLength === "number") {
            return name.substring(0, args.maxLength);
          }
          return name;
        },
      },
    },
  },
});
```

만약 수많은 매개변수를 원한다면, 각 매개변수는 구조분해할당되어
반환되는 변수로 감싸주어야 한다

각 매개변수들은 개별 `subfield` 로 사용된다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Person: {
      fields: {
        fullName: {
          read(
            fullName = {
              firstName: "UNKNOWN FIRST NAME",
              lastName: "UNKNOWN LAST NAME",
            }
          ) {
            return { ...fullName };
          },
        },
      },
    },
  },
});
```

```gql
query personWithFullName {
  fullName {
    firstName
    lastName
  }
}
```

`field` 를 통해 `read` 함수 정의를 할수도 있다
이것은 스키마안에 정의된 필드가 없어야한다

예를 들어, 다음의 `read` 함수의 `userId` 는 `localStorage` 데이터로 채워지며 `userId` 필드로 쿼리할수 있다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Person: {
      fields: {
        userId() {
          return localStorage.getItem("loggedInUserId");
        },
      },
    },
  },
});
```

> 로컬로만 정의된 필드를 쿼리하려면, 해당 쿼리에 `@client` 지시자가
> 포함되어야 한다. 이는 `Apollo Client` 가 `GraphQL` 서버에 요청시 이를
> 포함하지 않도록 해준다

다른 사용법들은 다음과 같다

- `client` 가 필요한것들에 맞추도록 `cached` 데이터를 변경한다
  **_예시: 부동소수점을 가까운 정수로 반올림_**
  <br/>

- 동일한 객체에 있는 하나 이상의 기존 스키마 필드에서 로컬 전용 필드를 파생시킨다
  **_예시: `birthDate` `field` 에서 `age` `field` 를 파생시킨다_**
  <br/>

- 여러 객체에 걸쳐 하나 이상의 기존 스키마 필드에서 전용 필드를 파생

> 여기서 `여러 객체에 걸쳐` 와 `하나이상의 기존 스키마 필드` 에 대한 뜻이
> 애매모호하다.
>
> `여러 객체` 란 `Schema` 를 말하며, `하나이상의 기존스키마 필드` 란,
> 스키마내부의 필드를 통해 값을 도출할수 있음을 말하는듯하다.

🤼‍♂️ **_The merge function_**

캐시는 `server` 로부터 응답된 값을 `field` 에 작성하려고 할때마다
`marge` 함수를 호출한다

쓰기가 발생할때, `field` 의 새로운 값은 원래 응답된 값 대신에  
`marge` 함수가 반환한 값으로 설정된다

**_Mergin arrays_**

`merge` 함수는 일반적으로, `array` 를 가진 `field` 에 쓰기를 작업을
하는것이다. 정확한건 예시를 보면 금방이해할 수 있다

`merge` 함수는 다음과 같이 두 배열을 연결하는것을 볼수 있다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Agenda: {
      fields: {
        tasks: {
          merge(existing = [], incoming: any[]) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});
```

> 이 패턴은 일반적으로 `pagenated lists` 와 함께 작업될때 효과적이다

- **existing**
  이 매개변수는 기존의 `cache` 된 데이터를 가진다

> `existing` 은 주어진 `field` 의 인스턴스로부터 이 함수가 맨 처음
> 호출되면 `undefined` 이다
>
> 왜냐하면 `cache` 는 아직 `field` 로부터 어떠한 데이터도 가지고 있지
> 않기 때문이다
>
> 위의 예시에서 `existing = []` 을 한 이유는 효과적으로 `existing` 을
> 제어하기 위해서 (`배열을 sperad 하려고..`)이다. 보통은 `[]` 로 `default` 값 설정하는듯 하다

- **incoming**
  이 매개변수는 응답받은 새로운 데이터를 가진다

> `merge` 함수는 `incoming` 을 `existing` 배열에 직접적으로 `push` 할수
> 없다. 잠재적인 오류를 방지하기 위해 반드시 새로운 배열을 만들어 리턴해야
> 한다

**_Merging non-normalized objects_**

`merge` 함수를 중첩된 객체를 똑똑하게 결합하려고 사용한다
이는 `cache` 에 정규화되지 않으며, 정규화된 부모안에 안에 중첩되었다고
가정한다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      fields: {
        author: {
          // Non-normalized Author object within Book
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming);
          },
        },
      },
    },
  },
});
```

그래프 스키마에 다음의 타입이 있다고 가졍해보자

```gql
type Book {
  id: ID!
  title: String!
  author: Author!
}

type Author { # Has no key fields
  name: String!
  dateOfBirth: String!
}

type Query {
  favoriteBook: Book!
}
```

이 스키마와 함께, `cache` 는 `Book` 객체는 정규화할것이다. 왜냐하면
`Book` 은 `id` `field` 를 가지기 때문이다

그러나, `Author` 객체는 `id` 필드를 가지고 있지 않으며, 특정 인스턴스의
유일한 식별자를 가진 다른 `field` 역시 가지고 있지 않다

그러므로, `cache` 는 `Author` 객체를 정규화할 수 없으며 이로인해
두개의 다른 `Author` 객채가 실제로 같은 `author` 를 나타내는지
알수 없다

예시를 위해 `client` 는 다음의 두개의 쿼리를 순서대로 실행할것이다

```gql
query BookWithAuthorName {
  favoriteBook {
    id
    author {
      name
    }
  }
}

query BookWithAuthorBirthdate {
  favoriteBook {
    id
    author {
      dateOfBirth
    }
  }
}
```

첫번째 쿼리는 다음의 `Book` 객체를 `cache` 에 `write` 할것이다

```json
{
  "__typename": "Book",
  "id": "abc123",
  "author": {
    "__typename": "Author",
    "name": "George Eliot"
  }
}
```

> `Author` 객체는 정규화할수 없다. 이 객체는 `parent` 객체에 바로 중첩된다

두번째 쿼리는 캐시된 `Book` 객체를 다음으로 업데이트 된다

```json
{
  "__typename": "Book",
  "id": "abc123",
  "author": {
    "__typename": "Author",
    "dateOfBirth": "1819-11-22"
  }
}
```

⚠️ `Author` 의 `name` 필드는 제거되었다!

왜냐하면 `Apollo Client` 가 두 쿼리에서 리턴된 `Author` 객체가 실제
동일한 `author` 를 가리키는지 확신할수 없기때문이다.

> 이는 다시 말하지만 `Author` 에서 식별할수 있는 고유 식별자가 없기때문이다.

이때, 두 객체의 필드를 병합하는 대신, 객체를 덮어씌어버린다

> 이러한 경우 `Warning` 로그가 출려된다

그러나 두 `author` 는 같은 `author` 를 나타낸다. 왜냐하면 책의 저자는
거의 변하지 않기 때문이다.

그러므로 `Book.author` 가 같은 `Book` 에 속해
있는한 같은 객체임을 `cache` 에 지시할수 있다

이를통해 `cache` 는 다른 쿼리에 의해 반환된 `name` 과 `dateOfBirth` 필드를
`marge` 할수 있다

이를 위해서 `Book` 에서 `policy type` 안 `author` 필드에
커스텀 `merge` 함수를 정의한다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      fields: {
        author: {
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming);
          },
        },
      },
    },
  },
});
```

`mergeObjects` 라는 헬퍼 함수를 사용했다. 이 함수는 `Author` 객체의
`esisting`, `incoming` 의 값을 병합한다

`merge` 를 위해 `Object spread syntax` 를 사용하는 대신 `mergeObject` 를
사용한다는것은 매우 중요하다. 왜냐하면 `mergeObjects` 는 `Book.author` 의
서브필드에 대해 정의된 `merge` 함수를 모두 호출하기 때문이다

이 `merge` 함수는 `Book` 또는 `Author` 에대해 정의된 로직이 전혀없음을
눈치 챘을것이다. 이는 어떠한 비 정규화된 객체 필드에도 재사용가능함을
말한다. 실제로 이를 이용해 `merge` 라는 단축어로도 정의가능하다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      fields: {
        author: {
          // Equivalent to options.mergeObjects(existing, incoming).
          merge: true,
        },
      },
    },
  },
});
```

두개의 비정규화된 객체를 `merge` 하려면 다음의 두가지가 반드시
조건 이어야 한다

- 두 객체는 반드시 `cache` 에서 정확히 동일한 정규화된 객체의 적확히
  동일한 `field` 이어야 한다

- 두 객체는 반드시 같은 `__typename` 이어야 한다

> 이는 여러 `object type` 들중 하나를 반환할수 있는 `interface` 및 `union` 반환타입이 있는 `field` 에 중요하다.

**_Merging array of non-normalized objects_**

`Book` 이 여러 `authors` 를 가진다면 어떻게 되는지 생각해보자

```gql
query BookWithAuthorNames {
  favoriteBook {
    isbn
    title
    authors {
      name
    }
  }
}

query BookWithAuthorLanguages {
  favoriteBook {
    isbn
    title
    authors {
      language
    }
  }
}
```

`favoriteBooks.authors` 필드는 비정규화된 `Author` 객체의 리스트를 가진다
이 경우 `name` 그리고 `language` 필드를 확인하는 좀더 복잡한 `merge` 함수를 정의할 필요가 있다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      fields: {
        authors: {
          merge(existing: any[], incoming: any[], { readField, mergeObjects }) {
            // existing 이 존재하면 existing 을 복사한 배열을
            // 아니면 빈배열을 할당
            // 이는 나중에 병합된 배열을 리턴하는데 사용된다
            const merged: any[] = existing ? existing.slice(0) : [];

            //  __proto__ 가 없는 빈객체 생성
            // 이는 readField('name', author) 값을 가진 key 와
            // existing 배열의 각 요소에 대한 index 를 value 로
            // 가진 객체이다
            const authorNameToIndex: Record<string, number> =
              Object.create(null);

            // existing 이 있다면
            if (existing) {
              // existing 의 값을 가져와서 `authorNameToIndex` 에 할당
              existing.forEach((author, index) => {
                // authorNameToIndex 의 key 는 readField 헬퍼함수의 반환값
                // 이며 값은 `index` 이다
                //
                // author.name 을 사용하지 않고 readField 를 사용하는 이유는
                // normalized 된 field 때문이다.
                // 정규화 될때, 중첩된 객체는 `__ref` 로 객체의 unique id 를
                // 가진다.
                //
                // cache 에서 정규화된 field 를 가져온다면 이 값은
                // 중첩된 객체가 아닌 `__ref: ID` 형태를 띈 값일것이다.
                // 이러한 객체참조 `ID` 를 다시 non_normalized 시켜서,
                // 중첩객체로 만들어야 한다.
                // (deserialize 처럼 생각해도 될듯하다)
                //
                // 이를 위해 Apollo Client 에서 cache 된 데이터를 가져올때
                // 항상 readField 를 사용하는것이 좋다
                // (해당값이 정규화된 객체일수 있으니...)
                authorNameToIndex[readField<string>("name", author)] = index;
              });
            }
            // incomming 의 값을 가져온다
            incoming.forEach((author) => {
              // authorNameToIndex 에서 가져올 key 값
              const name = readField<string>("name", author);
              // name 을 사용하여 aurthorNameToIndex 에
              // 해당하는 index 값을 가져온다
              const index = authorNameToIndex[name];
              // index 타입이 number 라면
              if (typeof index === "number") {
                // Merge the new author data with the existing author data.
                // merged 배열 `index` 에 merged[index] 에 저장된 값과
                // 현재 author 를 병합
                merged[index] = mergeObjects(merged[index], author);
              } else {
                // index 가 number 가 아니라면, (아마도 undefined 일것이다)
                // 이 경우는 맨 처음 호출될때, 혹은 빈배열 일때이다
                // First time we've seen this author in this array.
                // authorNameToIndex[name] 을 merged.length 값으로 지정한다
                // 1. authorNameToIndex[name] = 0
                // 2. authorNameToIndex[name] = 1
                // ...
                //
                // 사실 이 값은 이부분에서 필요없을거 같은데..
                // 일단 둔다..
                authorNameToIndex[name] = merged.length;
                // author 를 merged 에 추가한다
                merged.push(author);
              }
            });
            // 만들어진 merged 를 반환한다
            return merged;
          },
        },
      },
    },
  },
});
```

이는 매우 복잡하므로, `helper` 함수로 따로 빼서 적용가능하다

```ts
function mergeArrayByField<T>(fieldName: string): MergeFunction<T> {
  return (existing, incoming, { readField, mergeObjects }) => {
    const merged: T[] = existing ? existing.slice(0) : [];
    const fieldToIndex: Record<string, number> = Object.create(null);

    if (existing) {
      existing.forEach((item, index) => {
        const fieldValue = readField(fieldName, item);
        fieldToIndex[fieldValue] = index;
      });
    }

    incoming.forEach((item) => {
      const fieldValue = readField(fieldName, item);
      const index = fieldToIndex[fieldValue];

      if (typeof index === "number") {
        merged[index] = mergeObjects(merged[index], item);
      } else {
        fieldToIndex[fieldValue] = merged.length;
        merged.push(item);
      }
    });

    return merged;
  };
}

const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      fields: {
        authors: {
          merge: mergeArrayByField<AuthorType>("name"),
        },
      },
    },
  },
});
```

이를 통해 단순화 시킬수 있다.

🔝 **_Defining a merge function at the top level_**

`Apollo Client 3.3` 에서 비정규화된 `Object Type` 를 위한 `default merge` 함수를
정의할수 있다

그렇게 하면, 해당 `type` 을 반환하는 모든 `field` 는 `field` 별로 재정의 되지 않는한
`default merge` 함수를 사용한다

이는 다음과 같다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      fields: {
        // No longer required!
        // author: {
        //   merge: true,
        // },
      },
    },

    Author: {
      merge: true,
    },
  },
});
```

이는 더이상 `field-level merge function` 을 사용할 필요 없이 `field` 에 적용가능하다
매우 편리하게 사용가능할듯 보인다

📖 **_handling pagination_**

`field` 가 `array` 로 고정될때, `array` 로 반환되는 결과인 `pageinate` 에
유용하게 사용된다

이는 임의의 큰 배열을 가진 전체 결과를 반환하기에 때문이다

일반적으로, `pagenation query` 는 다음의 `pagination arguments` 를 포함해야 한다

- `array` 의 시작이 어디인지, `offset` 또는 `startingID` 를 사용한다
  <br/>

- `현재 페이지` 에서 반환되는 최대 `elements` 수

만약 `field` 에서 `pagination` 을 구현한다면, `field` 에서 `read` 그리고
`merge` 함수를 구현시 `pagenamtion arguments` 를 명심해야 한다

```ts
const agendaTasksMergePagenation: FieldMergeFunction = <T extends {}>() =>
function read(existing: T[], incomming: T[], { args }: ): FieldMergeFunction {
  // args.offset = array list 의 offset 개수
  // args.limit = array list 의 limit 개수
  const { offset, limit } = args;

  // 기존의 tasks 배열을 복사 없으면 빈배열
  const merged = existing ? existing.slice(0) : [];

  // offset 에서 limit 결과를 더해야 가져올 개수의 끝을 알수있다
  // inclomming.length 값이 limit 보다 작으면 해당 개수를 사용한다
  const end = offset + Math.min(limit, incomming.length);

  // offset 부터 end 까지 반복
  for (let i = offset; i < end; i+=1) {
    // merged 배열에서 해당 index 는 offset 에서 end 이며
    // incomming 배열의 원소를 하나씩 할당한다
    //
    // incomming 배열은 0 부터 시작하니 i - offset 을 해서
    // 인덱스 값을 할당한다
    merged[i] = incomming[i - offset];
  }
  // merged 를 반환
  return merged;
}

const agendaTasksReadPagenation: FieldReadFunction = <T extends {}>() =>
function read(existing: T[], { args }) {
  // offset, limit 을 가져옴
  const { offset, limit } = args;

  // existing 이 존재하면, slice 를 사용하여
  // offset 에서부터 offset + limit 까지 자른다
  const page = existing && existing.slice(
    offset,
    offset + limit,
  );

  // page 가 존재하고 length 가 0 보다크면
  if (page && page.length > 0) {
    // page 리턴
    return page;
  }
}

const cache = new InMemoryCache ({
  typePolices: {
    Agenda: {
      fields: {
        tasks: {
          agendaTasksMergePagenation<Tasks>(),
          agendaTasksReadPagenation<Tasks>(),
        }
      }
    }
  }
})

```

위의 예시는 `read` 함수와 `merge` 함수가 같은 `aguments` 서로 협력하는것을 볼 수 있다

다음은 `args.offset` 대신에 지정한 `entity ID` 를 지정하여 페이지의 `start`
지점을 줄수 있다

이때에도 `merge` 그리고 `read` 함수를 같이 구현한다

```ts

const AgendaTasksMergePagenation: FieldMergeFunction = <T extends {}>() =>
function merge(existing: T[], incoming: T[], { args, readField }) {
  // existing 배열이 있다면 existing 배열 복사 아니면 빈배열 생성
  const merged = exsisting ? exsiting.slice(0) : [];

  // 모든 `taskId` 의 `set` 을 얻는다
  const existingIdSet = new Set(
    // 여기서 `readField` 를 사용하여 실제 필드값을 가져온다
    // 그리고 반환된 배열을 Set 에 담는다.
    // Set 을 사용하는 이유는 읽기 전용이며, 고유한 ID 를 가진
    // 값이니, Set 으로 작성한듯하다
    mreged.map(task => readField('id', task));
  );

  // incoming 에서 existingIdSet 의 id 를 가진 필드가 있다면
  // 제거한다
  incoming = incoming.filter(
    task => !existingIdSet.has(readField('id', task))
  );

  // incoming tasks 이전의 id 값을 찾는다
  const afterIndex = merged.findIndex(
    task => args.id === readField('id', task);
  );

  // afterIndex 가 -1 이 아니면
  if (afterIndex >= 0) {
    // merged 에 afterIndex + 1 의 index 이후에 ...incoming 배열원소들을 할당
    merged.splice(afterIndex + 1, 0, ...incoming);
  } else {
    // -1 이면, 저장된 cache 가 없다는것이므로, merged 에 incoming push
    merged.push(...incoming);
  }
  // merged 반환
  return merged;
}

const AgendaTasksReadPagenation = <T extends {}>() =>
function read(existing: T[], { args, readField }) {
  // exisiting 이 있다면
  if (existing) {
    // exisging 에서 다음 페이지네이션 id 이전값을 찾는다
    const afterIndex = existing.findIndex(
      task => args.afterId === readField('id', task);
    );
    // -1 이 아니라면
    if (afterIndex >= 0) {
      // afterIndex + 1 부터 afterIndex + 1 + args.limit 까지 잘라
      // page 에 할당
      const page = existing.slice(
        afterIndex + 1,
        afterIndex + 1 + args.limit
      );
      // 만약 page 가 있고 length 가 0 보다 크면
      if (page && page.length > 0) {
        // page 리턴
        return page;
      }
    }
  }
}

const cache = new InMemoryCache({
  typePolices: {
    Agenda: {
      fields: {
        tasks: {
          AgendaTasksMergePagenation<Task>(),
          AgendaTasksReadPagenation<Task>(),
        }
      }
    }
  }
})

```

이를 통해 간편하게 처리가능하도록 만들수있다.
그런데, 더 간편하게 만드네??...

```ts
function afterIdLimitPaginatedFieldPolicy<T>() {
  return {
    merge(existing: T[], incoming: T[], { args, readField }): T[] {
      ...
    },
    read(existing: T[], { args, readField }): T[] {
      ...
    },
  };
}

const cache = new InMemoryCache({
  typePolicies: {
    Agenda: {
      fields: {
        tasks: afterIdLimitPaginatedFieldPolicy<Reference>(),
      },
    },
  },
});
```

이게 맞지.. 👍 `Docs` 가 역시 좋다

**_Specifying key arguments_**

만약 `field` 가 `arguments` 를 받는다면, `FieldPolicy` `field` 에 `KeyArgs` 의
배열을 지정할수 있다.

이 `arguments` 를 가리키는 배열은 `key arguments` 라 부른며
`key arguments` 는 `field` 의 값에 영향을 미친다

```ts
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        monthForNumber: {
          keyArgs: ["number"],
        },
      },
    },
  },
});
```

위는 `arguments` 로 `number` 을 배열로 넣는다.
이는 `monthForNumber` 필드의 `cache` 키가 이름이 `number` 인 인수를 기반으로
생성되야 함을 말한다

> 🐵 갑자기 내용이 헷갈린다. 내용을 정리해보자
>
> 모든 `Object` 는 `__ref` 를 통해 정규화 된다고 했다
>
> 정규화되어 `flat` 한 `Object` 를 생성하는데, 이때 해당 스키마의 `Object` 들은
> `__ref` 에서 참조가능한 식별자역할을 하는 `cache ID` 를 생성한다
>
> 이 생성된 `cache ID` 값이 `cache` 키이고, 이 키를 가진 객체는 `number` 라는
> 인수를 가졌다고 알려주는것이다.
>
> 여기서 중요한건 `field` 가 이러한 `KeyArgs` 에 지정한 인수를 받아,
> 해당 인수의 값에 따른 새로운 `cache ID` 를 생성한다는 것이다.
>
> 간단히 말하면 `field` 가 `arg` 에 따라서 다른 `cacheId` 를 가진 데이터가 저장된다.
>
> `cache` 상에서 이 `field` 에서 `arg` 의 값으로 `1` 이 저장되어 있다면,
> `1` 의 `arg` 로 해당 `field` 으로 조회할때 캐시된 데이터를 찾아서 반환한다.
>
> 반면 `2` 값으로 쿼리를 한다면, `2` 값은 없으므로, `2` 에 대한
> `cacheId` 를 생성하여 `cache` 한다
>
> 이는 인수를 기반으로 캐시를 효율적으로 구성하는것이다
>
> 음... 정리하니 어떠한 방식인지 추상적으로 그려진다.

**기본적으로 `field` 의 모든 `arguments` 는 전부 `key arguments` 이다**
그러므로, `field` 에서 받은 모든 이자값에 따라 새로운 `cacheID` 가 생성되며
`cache` 됨을 의미한다

위 예시처럼 `field` 에 `KeyArgs` 를 지정하면, 지정된 인수가 아닌 나머지 인수들은
`key arguments` 가 아님을 의미한다

이는 다음과 같은 상황이 발생할수 있다

만약, `monthForNumber` 를 쿼리하는 두개의 쿼리가 있는데,
두 쿼리상에 `number` 인자값은 같지만 `token` 인자값은 서로 다른 값을 가지고 있다고 하자

이러한경우 `KeyArgs` 는 오직 `number` 인자만을 `key arguments` 로 사용하기 때문에,
두번째 쿼리되는 값이 첫번째 쿼리 값으로 덮어씌어버린다

이는 예상치 못한 결과가 발생할수 있음으로 잘 생각하고 작성해야 할것같다

**_Providing a KeyArgs function_**

`KeyArgs` 를 좀더 설정가능하도록 배열로 구성하는게 아닌 함수로써 사용가능하게 만들었다
이 `KeyArgs` 함수는 다음의 2개의 인자값을 갖는다

- `args` 객체는 모든 `field` 의 모든 `arguments` 를 포함한다
  <br/>

- `context` 객체는 기타관련 세부정보를 포함하는 객체이다.
  <br/>

현재까지 `CachePolicy` 에 대한 대략적인 내용을 정리했다
이제 직접 구현해볼 차례이다.

---

앞에서 살펴보았듯, `chech` 스토어는 정규화된 객체를 갖는다.
이러한 정규화된 객체는 `cacheId` 를 갖으며, 이 `cacheId` 가
`cache` 스토어에서 해당 쿼리를 찾을수 있는 식별자가 된다.

> `cacheId` 는 `ID`, `__typename` 이며, 이 `cachId` 와 받은 인수인
> `arguments key` 로 캐시를 조회한다

그럼 앞전의 코드에서 왜 `fetchMore` 가 `data` 에 적용이 안되었는지 이해할수
있다

`fetchMore` 할때, `cache` 스토어에 해당하는 쿼리의 캐시를 찾을 수 없어
`graphQL server` 에서 `data` 를 `fetch` 하고, `fetch` 된 `data` 에 대한 새로운
캐시를 생성하여 저장할 것이다.

`fetchMore` 의 역할은 딱 여기까지이다.

> 이는 앞전의 `fetch` 된 쿼리의 데이터와 다르기 때문이다.
> 다시 말하지만 `cacheId` 와 `arguments key` 로 캐시를 조회한다
> `fetchMore` 에서 `arguments key` 값이 다르기 때문에 캐시된데이터가 없다

이제, 이를 해결하기위해 `PolicyType` 을 구현한다

```ts
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
```

이를 생성한후 적용한다

`./ghibli_project/web/src/App.tsx`

```tsx
import { ChakraProvider, Box, Text, theme } from '@chakra-ui/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import FilmList from './components/film/FilmList';
import { filmsPagenatedFieldPolicy } from './common/apollo/FieldPolicy'

const apolloClient = new ApolloClient({
  // graphql server uri
  uri: 'http://127.0.0.1:8000/graphql',
  // apollo client 캐시를 메모리에 캐시
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          films: filmsPagenatedFieldPolicy(),
        }
      }
    }
  }),
});

export const App = () => (
  <ApolloProvider client={apolloClient}>
    <ChakraProvider theme={theme}>
      <Box>
        <Text>Ghibli GraphQL</Text>
      </Box>
      <FilmList />
    </ChakraProvider>
  </ApolloProvider>
);
```

이후, `FilmList` 를 수정한다

`ghibli_project/web/src/components/film/FilmList.tsx`

```tsx
import { Box, SimpleGrid, Skeleton } from '@chakra-ui/react';
import useFilmsQuery from '../../hooks/queries/useFilmsQuery';
import FilmCard from './FilmCard';
import Scroller from '../common/scroller';
import { useCallback } from 'react';

export default function FilmList() {
  // 패칭할 데이터 LIMIT 
  const LIMIT = 6;
  // films 쿼리
  const { data, loading, error, fetchMore } = useFilmsQuery({
    cursor: 1,
    limit: LIMIT,
  });

  // Scroller 의 onEnter 함수 
  const onEnter = useCallback(() => {
    if (data) {
      // fetchMore 실행
      fetchMore({
        variables: {
          limit: LIMIT,
          cursor: data.films.cursor,
        },
      });
    }
  }, [data, fetchMore]);

  if (loading) return <p>...loading</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <Scroller onEnter={onEnter} isLoading={loading} lastCursor={data?.films.cursor}>
      <SimpleGrid columns={[2, null, 3]} spacing={[2, null, 10]}>
        {loading && new Array(LIMIT).fill(0).map((x) => <Skeleton key={x} height="400px" />)}
        {!loading &&
          data &&
          data.films.films.map((film) => (
            <Box key={film.id}>
              <FilmCard film={film} />
            </Box>
          ))}
      </SimpleGrid>
    </Scroller>
  );
}

```

제대로 `Scroller` 가 작동하는것을 볼 수 있다.

이후에 `react-route-dom` 을 사용하는데, `v6` 를 사용하여 적용한다

🦊 여기 내용은 그냥저냥해서 넘긴다

## 🎥 Lazy-loading

> 책에서는 `react-lazyloading` 을 사용한다.
> `InterceptionObserver` 를 통해 직접구현한다

일단 `lazyLoading` 에 대해서 생각해보자.
`Film` 페이지로 진입시 모든 이미지가 한꺼번에 로드된다

이는 보이지 않은 모든 이미지전부를 가져오므로, 서버입장에서나 클라이언트 입장에서
좋지 못하다

> 클라이언트에서는 서버에서 많은 양의 사진을 불러와서 렌더링해야 하므로 좋지 못하고,
서버 입장에서는 사용자에게 보여주지 않아도되는 사진을 보내야 하므로, 퍼포먼스상 좋지않다

간단한 `LazyLoader` 를 구현해본다

`ghibli_project/web/src/components/common/LazyLoader.tsx

```tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Skeleton from './Skeleton/Skeleton';

interface LazyLoaderProps {
  children: React.ReactElement;
  height?: number;
  loading: boolean;
}

const LazyLoader = ({ children, height, loading }: LazyLoaderProps) => {
  // 해당 element 를 보여줄지 설정하는 state
  const [inView, setInView] = useState<boolean>(false);
  // interceptionObserver target ref
  const ioPlaceholderRef = useRef<HTMLImageElement>(null);
  // interceptionObserver ref
  const ioRef = useRef<IntersectionObserver>();
  // interceptionObserver 콜백
  const lazyLoading: IntersectionObserverCallback = useCallback(
    (entities, obs) => {
      entities.forEach((entity) => {
        // entity 가 intersecting 되었다면,
        if (entity.isIntersecting) {
          // setInview 를 true
          setInView(true);
          // obs.discnnect 한다
          // 이는 한번 실행한후에 다시 실행되지 않도록 하기 위해서다
          obs.disconnect();
        }
      });
    },
    [setInView],
  );

  useEffect(() => {
    // ioRef 할당
    ioRef.current = new IntersectionObserver(lazyLoading, {
      threshold: 0
    });
    // ioPlaceholderRef 가 있다면
    if (ioPlaceholderRef.current) {
      // loading 중이면 unobserve
      if (loading) {
        ioRef.current.unobserve(ioPlaceholderRef.current);
      } else {
        // intersectionObserver 생성
        // 타겟설정
        ioRef.current.observe(ioPlaceholderRef.current);
      }
    }
    // unmount 시 disconnect
    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [ioRef, lazyLoading, ioPlaceholderRef, loading]);

  return (
    <>
      {inView && !loading ? (
        children
      ) : (
        <Skeleton ref={ioPlaceholderRef} animationEffect={true} height={height} rounded={40} />
      )}
    </>
  );
};

export default LazyLoader;

```
