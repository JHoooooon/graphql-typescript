const config = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['react', 'react-hooks', '@typescript-eslint', '@stylistic'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    '@stylistic/max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
        ignorePattern: '^import\\s.+\\sform\\s.+;$',
      },
    ],
    '@stylistic/linebreak-style': 0,
    'no-use-before-define': 0,
    camelcase: 1,
    'max-classes-per-file': 0,
    'class-methods-use-this': 0,
    'import/prefer-default-export': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
        jsx: 'never',
        tsx: 'never',
      },
    ],
    'no-underscore-dangle': 0,
    'no-console': 0,
    '@typescript-eslint/no-use-before-define': 2,
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['generated/**/*.ts'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', 'jsx', 'tsx'],
      },
    },
  },
};

module.exports = config;
