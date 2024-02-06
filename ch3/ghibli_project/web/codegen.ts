import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // 이미 해당 파일이 있다면, 덮어씌우기 위한 설정
  overwrite: true,
  // GraphQL Codegne 이 참조할 서버 주소
  schema: 'http://localhost:8000/graphql',
  documents: './src/**/*.graphql',
  // 생성할 파일 및 플러그인 preset 설정
  generates: {
    // src/generated/graphql.tsx 로 생성
    './src/generated/': {
      // preset 은 client
      preset: 'client-preset',
      // preset config
      presetConfig: {
        gqlTagName: 'gql',
      },
      // plugins 는 add 를 사용
      plugins: [
        // eslint 무시하기 위한 주석 설정 
        { add: { content: '/* eslint-disable */ ' } },
      ],
    },
  },
};

export default config;
