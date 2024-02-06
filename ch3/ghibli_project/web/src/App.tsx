import { ChakraProvider, Box, Text, theme } from '@chakra-ui/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import FilmList from './components/film/FilmList';

const apolloClient = new ApolloClient({
  // graphql server uri
  uri: 'http://127.0.0.1:8000/graphql',
  // apollo client 캐시를 메모리에 캐시
  cache: new InMemoryCache(),
});

export const App = () => (
  <ApolloProvider client={apolloClient}>
    <ChakraProvider theme={theme}>
      <Box>
        <Text>Ghibli GraphQL</Text>
        <FilmList />
      </Box>
    </ChakraProvider>
  </ApolloProvider>
);
