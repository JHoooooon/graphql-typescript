import { ChakraProvider, theme } from '@chakra-ui/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import FilmList from './components/film/FilmList';
import { filmsPagenatedFieldPolicy } from './common/apollo/FieldPolicy'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import CommonLayout from './components/common/layout/CommonLayout';
import Film from './pages/Film';

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
      <BrowserRouter>
        <CommonLayout>
        <Routes>
            <Route path="/" element={<Main />}/>
            <Route path="/film/:filmId" element={<Film />}/>
        </Routes>
        </CommonLayout>
      </BrowserRouter>
    </ChakraProvider>
  </ApolloProvider>
);
