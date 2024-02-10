import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import app from './app';
import { FilmResolver } from './resolver/Film';
import { CutResolver } from './resolver/Cut';

async function bootStrap() {
  const schema = await buildSchema({
    resolvers: [FilmResolver, CutResolver],
  });
  const server = new ApolloServer({
    schema,
  });

  try {
    await server.start();

    app.use(
      '/graphql',
      cors({
        origin: '*',
      }),
      expressMiddleware(server),
    );
    app.listen(app.get('PORT'), () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`
          server started on => http://localhost:${app.get('PORT')} 
          graphql playground => http://localhost:${app.get('PORT')}/graphql
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
