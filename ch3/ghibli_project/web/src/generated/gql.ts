/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query cuts($filmId: Int!) {\n  cuts(filmId: $filmId) {\n    id\n    src\n  }\n}": types.CutsDocument,
    "query film($filmId: Int!) {\n  film(filmId: $filmId) {\n    id\n    title\n    subtitle\n    description\n    genre\n    runningTime\n    posterImg\n    release\n    director {\n      id\n      name\n    }\n  }\n}": types.FilmDocument,
    "query films($limit: Int, $cursor: Int) {\n  films(limit: $limit, cursor: $cursor) {\n    cursor\n    films {\n      id\n      title\n      subtitle\n      runningTime\n      director_id\n      release\n      director {\n        id\n        name\n      }\n      posterImg\n      description\n      genre\n    }\n  }\n}": types.FilmsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query cuts($filmId: Int!) {\n  cuts(filmId: $filmId) {\n    id\n    src\n  }\n}"): (typeof documents)["query cuts($filmId: Int!) {\n  cuts(filmId: $filmId) {\n    id\n    src\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query film($filmId: Int!) {\n  film(filmId: $filmId) {\n    id\n    title\n    subtitle\n    description\n    genre\n    runningTime\n    posterImg\n    release\n    director {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["query film($filmId: Int!) {\n  film(filmId: $filmId) {\n    id\n    title\n    subtitle\n    description\n    genre\n    runningTime\n    posterImg\n    release\n    director {\n      id\n      name\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query films($limit: Int, $cursor: Int) {\n  films(limit: $limit, cursor: $cursor) {\n    cursor\n    films {\n      id\n      title\n      subtitle\n      runningTime\n      director_id\n      release\n      director {\n        id\n        name\n      }\n      posterImg\n      description\n      genre\n    }\n  }\n}"): (typeof documents)["query films($limit: Int, $cursor: Int) {\n  films(limit: $limit, cursor: $cursor) {\n    cursor\n    films {\n      id\n      title\n      subtitle\n      runningTime\n      director_id\n      release\n      director {\n        id\n        name\n      }\n      posterImg\n      description\n      genre\n    }\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;