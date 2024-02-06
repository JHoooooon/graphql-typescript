/* eslint-disable */
/* eslint-disable */ 
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Director = {
  __typename?: 'Director';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Film = {
  __typename?: 'Film';
  /** 영화 줄거리 및 설명 */
  description: Scalars['String']['output'];
  director: Director;
  /** 제작자 고유 아이디 */
  director_id: Scalars['Int']['output'];
  /** 영화 장르 */
  genre: Scalars['String']['output'];
  /** 영화 고유 아이디 */
  id: Scalars['Int']['output'];
  /** 포스터 이미지 URL */
  posterImg: Scalars['String']['output'];
  /** 개봉일 */
  release: Scalars['String']['output'];
  /** 영화 러닝 타임, minute */
  runningTime: Scalars['Float']['output'];
  /** 영화 부제목 */
  subtitle?: Maybe<Scalars['String']['output']>;
  /** 영화 제목 */
  title: Scalars['String']['output'];
};

export type PagenatedFilms = {
  __typename?: 'PagenatedFilms';
  cursor?: Maybe<Scalars['Int']['output']>;
  films: Array<Film>;
};

export type Query = {
  __typename?: 'Query';
  films: PagenatedFilms;
};


export type QueryFilmsArgs = {
  cursor?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type FilmsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  cursor?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FilmsQuery = { __typename?: 'Query', films: { __typename?: 'PagenatedFilms', cursor?: number | null, films: Array<{ __typename?: 'Film', id: number, title: string, subtitle?: string | null, runningTime: number, director_id: number, release: string, posterImg: string, description: string, genre: string, director: { __typename?: 'Director', id: number, name: string } }> } };


export const FilmsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Films"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"films"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"cursor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"films"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"runningTime"}},{"kind":"Field","name":{"kind":"Name","value":"director_id"}},{"kind":"Field","name":{"kind":"Name","value":"release"}},{"kind":"Field","name":{"kind":"Name","value":"director"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"posterImg"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"genre"}}]}}]}}]}}]} as unknown as DocumentNode<FilmsQuery, FilmsQueryVariables>;